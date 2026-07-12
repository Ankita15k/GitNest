/**
 * Tests for fix: session.startTransaction() must be awaited
 *
 * Verifies that the async handshake with the MongoDB driver completes
 * before the step pipeline begins, so all session-scoped writes happen
 * inside the transaction.
 */
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// ─── In-process SagaState store ──────────────────────────────────────────────
const mockStates = new Map();

const makeSagaDoc = (data) => {
  const doc = {
    sagaId:         data.sagaId,
    type:           data.type,
    status:         data.status ?? 'pending',
    completedSteps: [...(data.completedSteps ?? [])],
    failedStep:     data.failedStep ?? null,
    retryCount:     data.retryCount ?? 0,
    metadata:       { ...(data.metadata ?? {}) },
    lastHeartbeatAt: data.lastHeartbeatAt ?? null,
  };
  doc.save = jest.fn(async function () {
    mockStates.set(doc.sagaId, { ...doc });
    return doc;
  });
  return doc;
};

// ─── Mongoose mock ────────────────────────────────────────────────────────────
// startTransaction is a jest.fn() so we can assert it was awaited correctly.
// We capture call order relative to step execution using a shared callLog.
let callLog = [];
let mockSession;

jest.unstable_mockModule('mongoose', () => ({
  default: {
    startSession: jest.fn(async () => {
      mockSession = {
        // Returns a promise that resolves on the next tick so we can detect
        // whether the caller awaits it before running steps.
        startTransaction: jest.fn(() => {
          callLog.push('startTransaction');
          return Promise.resolve();
        }),
        commitTransaction:  jest.fn(async () => { callLog.push('commitTransaction'); }),
        abortTransaction:   jest.fn(async () => { callLog.push('abortTransaction'); }),
        endSession:         jest.fn(),
      };
      return mockSession;
    }),
  },
}));

// ─── SagaState model mock ─────────────────────────────────────────────────────
jest.unstable_mockModule('../src/models/SagaState.model.js', () => ({
  default: {
    findOne: jest.fn(async ({ sagaId } = {}) => {
      const stored = mockStates.get(sagaId);
      return stored ? makeSagaDoc(stored) : null;
    }),
    findOneAndUpdate: jest.fn(async ({ sagaId }, update) => {
      const stored = mockStates.get(sagaId);
      if (stored && update.$set) {
        Object.assign(stored, update.$set);
        mockStates.set(sagaId, stored);
      }
      return stored ? makeSagaDoc(stored) : null;
    }),
    create: jest.fn(async (data) => {
      const doc = makeSagaDoc(data);
      mockStates.set(doc.sagaId, { ...doc });
      return doc;
    }),
    deleteMany: jest.fn(async () => { mockStates.clear(); }),
  },
}));

jest.unstable_mockModule('../src/utils/devLogger.js', () => ({
  devLog: jest.fn(),
}));

// ─── Dynamic imports (after mocks) ───────────────────────────────────────────
const { default: SagaOrchestrator } = await import('../src/services/saga/sagaOrchestrator.js');
const { default: SagaState }         = await import('../src/models/SagaState.model.js');

// ─── Test suite ───────────────────────────────────────────────────────────────
describe('fix #556 — session.startTransaction() must be awaited', () => {
  beforeEach(async () => {
    callLog = [];
    mockStates.clear();
    jest.clearAllMocks();

    // Re-wire mocks after clearAllMocks
    SagaState.findOne.mockImplementation(async ({ sagaId } = {}) => {
      const stored = mockStates.get(sagaId);
      return stored ? makeSagaDoc(stored) : null;
    });
    SagaState.findOneAndUpdate.mockImplementation(async ({ sagaId }, update) => {
      const stored = mockStates.get(sagaId);
      if (stored && update.$set) {
        Object.assign(stored, update.$set);
        mockStates.set(sagaId, stored);
      }
      return stored ? makeSagaDoc(stored) : null;
    });
    SagaState.create.mockImplementation(async (data) => {
      const doc = makeSagaDoc(data);
      mockStates.set(doc.sagaId, { ...doc });
      return doc;
    });
    SagaState.deleteMany.mockImplementation(async () => { mockStates.clear(); });
  });

  // ── 1. startTransaction awaited before first step executes ──────────────────
  test('startTransaction resolves before the first step execute is called', async () => {
    // startTransaction returns a promise that we track.
    // If it were not awaited, the step would appear in callLog before
    // 'startTransaction' resolves — we assert the opposite.

    const sagaId = 'tx-await-order';

    const steps = [
      {
        name: 'step1',
        execute: async () => { callLog.push('step1-execute'); },
        compensate: async () => {},
      },
    ];

    await SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {});

    // startTransaction must appear before any step work
    const txIdx   = callLog.indexOf('startTransaction');
    const stepIdx = callLog.indexOf('step1-execute');

    expect(txIdx).toBeGreaterThanOrEqual(0);   // startTransaction was called
    expect(stepIdx).toBeGreaterThan(txIdx);    // step ran AFTER transaction started
  });

  // ── 2. startTransaction is called exactly once per executeSaga call ──────────
  test('startTransaction is called exactly once on a successful saga run', async () => {
    const sagaId = 'tx-called-once';

    const steps = [
      { name: 'a', execute: async () => {}, compensate: async () => {} },
      { name: 'b', execute: async () => {}, compensate: async () => {} },
    ];

    await SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {});

    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
  });

  // ── 3. commitTransaction is called after all steps succeed ───────────────────
  test('commitTransaction is called after all steps complete successfully', async () => {
    const sagaId = 'tx-commit-called';

    const steps = [
      { name: 'step1', execute: async () => { callLog.push('step1'); }, compensate: async () => {} },
    ];

    await SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {});

    const commitIdx = callLog.indexOf('commitTransaction');
    const stepIdx   = callLog.indexOf('step1');

    expect(commitIdx).toBeGreaterThan(stepIdx);     // commit comes after step
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.abortTransaction).not.toHaveBeenCalled();
  });

  // ── 4. abortTransaction is called (not commitTransaction) when a step fails ──
  test('abortTransaction is called and commitTransaction is not called when a step fails', async () => {
    const sagaId = 'tx-abort-on-failure';

    const steps = [
      {
        name: 'failingStep',
        execute: async () => { throw new Error('step blew up'); },
        compensate: async () => {},
      },
    ];

    await expect(
      SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {}, { maxRetries: 1 })
    ).rejects.toThrow('step blew up');

    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).not.toHaveBeenCalled();
  });

  // ── 5. session is passed to step.execute (so writes are transaction-scoped) ──
  test('session object is forwarded as the second argument to each step execute', async () => {
    const sagaId = 'tx-session-forwarded';
    const capturedSessions = [];

    const steps = [
      {
        name: 'step1',
        execute: async (ctx, session) => { capturedSessions.push(session); },
        compensate: async () => {},
      },
      {
        name: 'step2',
        execute: async (ctx, session) => { capturedSessions.push(session); },
        compensate: async () => {},
      },
    ];

    await SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {});

    // Both steps must receive the same session object
    expect(capturedSessions).toHaveLength(2);
    expect(capturedSessions[0]).toBe(capturedSessions[1]);
    expect(capturedSessions[0]).toBe(mockSession);
  });

  // ── 6. session is forwarded to step.compensate during rollback ───────────────
  test('session object is forwarded to compensate callbacks during rollback', async () => {
    const sagaId = 'tx-session-in-compensate';
    const capturedCompSessions = [];

    const steps = [
      {
        name: 'step1',
        execute: async () => {},
        compensate: async (ctx, session) => { capturedCompSessions.push(session); },
      },
      {
        name: 'step2',
        execute: async () => { throw new Error('trigger rollback'); },
        compensate: async () => {},
      },
    ];

    await expect(
      SagaOrchestrator.executeSaga(sagaId, 'TEST', steps, {}, { maxRetries: 1 })
    ).rejects.toThrow('trigger rollback');

    expect(capturedCompSessions).toHaveLength(1);
    expect(capturedCompSessions[0]).toBe(mockSession);
  });
});
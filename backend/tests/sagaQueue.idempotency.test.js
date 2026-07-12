/**
 *  - Both callers receive the same resolved value; execute runs exactly once
 *  - activeJobs is empty (size 0) after both callers settle
 *  - Both callers receive the same rejection when the job fails; no hanging
 *  - A new job with the same sagaId can be enqueued after the first has settled
 *  - Distinct sagaIds still run as independent jobs
 */

import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// ─── Mock SagaOrchestrator ────────────────────────────────────────────────────
const mockExecuteSaga = jest.fn();

jest.unstable_mockModule('../src/services/saga/sagaOrchestrator.js', () => ({
  default: { executeSaga: mockExecuteSaga },
}));

jest.unstable_mockModule('../src/utils/devLogger.js', () => ({
  devLog: jest.fn(),
}));

// ─── Dynamic import after mocks ───────────────────────────────────────────────
const { default: SagaQueue } = await import('../src/queue/sagaQueue.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const noopSteps = [
  { name: 'step1', execute: async () => {}, compensate: async () => {} },
];

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('SagaQueue — duplicate sagaId deduplication (Issue #479)', () => {
  let queue;

  beforeEach(() => {
    // Fresh queue instance per test so state never leaks between tests
    queue = new SagaQueue();
    jest.clearAllMocks();
  });

  // ── 1. Both callers get the same resolved value; execute runs exactly once ──
  test('returns same promise for duplicate sagaId and executes step only once', async () => {
    const sagaId = 'dedup-success';
    const expectedResult = { done: true, riskScore: 42 };

    mockExecuteSaga.mockResolvedValueOnce(expectedResult);

    const p1 = queue.enqueue(sagaId, 'TEST', noopSteps, {});
    const p2 = queue.enqueue(sagaId, 'TEST', noopSteps, {}); // duplicate

    // Both promises must be the same reference
    expect(p1).toBe(p2);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(expectedResult);
    expect(r2).toBe(expectedResult);

    // SagaOrchestrator.executeSaga must have been called exactly once
    expect(mockExecuteSaga).toHaveBeenCalledTimes(1);
  });

  // ── 2. activeJobs is empty after both callers settle ─────────────────────
  test('activeJobs map has size 0 after both callers settle', async () => {
    const sagaId = 'dedup-cleanup';
    mockExecuteSaga.mockResolvedValueOnce({ ok: true });

    const p1 = queue.enqueue(sagaId, 'TEST', noopSteps, {});
    const p2 = queue.enqueue(sagaId, 'TEST', noopSteps, {}); // duplicate

    await Promise.allSettled([p1, p2]);

    expect(queue.activeJobs.size).toBe(0);
  });

  // ── 3. Both callers reject with the same error; neither hangs ────────────
  test('both callers receive the same rejection when the job fails', async () => {
    const sagaId = 'dedup-failure';
    const boom = new Error('saga exploded');

    mockExecuteSaga.mockRejectedValueOnce(boom);

    const p1 = queue.enqueue(sagaId, 'TEST', noopSteps, {});
    const p2 = queue.enqueue(sagaId, 'TEST', noopSteps, {}); // duplicate

    expect(p1).toBe(p2);

    const [s1, s2] = await Promise.allSettled([p1, p2]);

    expect(s1.status).toBe('rejected');
    expect(s1.reason).toBe(boom);
    expect(s2.status).toBe('rejected');
    expect(s2.reason).toBe(boom);

    // Job executed exactly once, not twice
    expect(mockExecuteSaga).toHaveBeenCalledTimes(1);
  });

  // ── 4. A new job with the same sagaId is accepted after the first settles ─
  test('allows re-enqueue of the same sagaId after the first job has settled', async () => {
    const sagaId = 'dedup-reuse';
    const result1 = { round: 1 };
    const result2 = { round: 2 };

    mockExecuteSaga
      .mockResolvedValueOnce(result1)
      .mockResolvedValueOnce(result2);

    // First run
    const r1 = await queue.enqueue(sagaId, 'TEST', noopSteps, {});
    expect(r1).toBe(result1);
    expect(queue.activeJobs.size).toBe(0); // cleaned up

    // Second run — same sagaId, but the first has fully settled
    const r2 = await queue.enqueue(sagaId, 'TEST', noopSteps, {});
    expect(r2).toBe(result2);

    expect(mockExecuteSaga).toHaveBeenCalledTimes(2);
  });

  // ── 5. Distinct sagaIds still run as independent jobs ────────────────────
  test('independent sagaIds each get their own promise and execute independently', async () => {
    const result1 = { id: 'a' };
    const result2 = { id: 'b' };

    mockExecuteSaga
      .mockResolvedValueOnce(result1)
      .mockResolvedValueOnce(result2);

    const p1 = queue.enqueue('saga-a', 'TEST', noopSteps, {});
    const p2 = queue.enqueue('saga-b', 'TEST', noopSteps, {});

    // Must be distinct promises
    expect(p1).not.toBe(p2);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe(result1);
    expect(r2).toBe(result2);
    expect(mockExecuteSaga).toHaveBeenCalledTimes(2);
    expect(queue.activeJobs.size).toBe(0);
  });
});
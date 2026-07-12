import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// ─── Dynamic import (ESM — no mocks needed for this pure utility) ──────────
const { acquireRepoLock, _lockMapSize } = await import('../src/utils/repoMutex.js');

// ─── helpers ──────────────────────────────────────────────────────────────

/**
 * Simulates a "git operation" that takes `durationMs` to complete.
 * Pushes events into `log` at start and end so tests can assert ordering.
 */
const fakeGitOp = async (label, log, durationMs = 20) => {
  log.push(`${label}:start`);
  await new Promise((r) => setTimeout(r, durationMs));
  log.push(`${label}:end`);
};

// ─── tests ────────────────────────────────────────────────────────────────

describe('repoMutex — acquireRepoLock', () => {

  // ── sequential execution ───────────────────────────────────────────────

  test('two operations on the same path execute sequentially, not concurrently', async () => {
    const log = [];
    const path = '/repos/owner/my-repo';

    const op1 = async () => {
      const release = await acquireRepoLock(path);
      try { await fakeGitOp('op1', log, 30); }
      finally { release(); }
    };

    const op2 = async () => {
      const release = await acquireRepoLock(path);
      try { await fakeGitOp('op2', log, 10); }
      finally { release(); }
    };

    // Start both without awaiting — simulates concurrent HTTP requests
    await Promise.all([op1(), op2()]);

    // op1 must fully complete before op2 starts
    expect(log).toEqual(['op1:start', 'op1:end', 'op2:start', 'op2:end']);
  });

  test('three concurrent operations on the same path execute in FIFO order', async () => {
    const log = [];
    const path = '/repos/owner/three-pr-repo';

    const makeOp = (label, dur) => async () => {
      const release = await acquireRepoLock(path);
      try { await fakeGitOp(label, log, dur); }
      finally { release(); }
    };

    await Promise.all([
      makeOp('op1', 20)(),
      makeOp('op2', 10)(),
      makeOp('op3', 5)(),
    ]);

    expect(log).toEqual([
      'op1:start', 'op1:end',
      'op2:start', 'op2:end',
      'op3:start', 'op3:end',
    ]);
  });

  // ── independent paths ──────────────────────────────────────────────────

  test('operations on different paths run concurrently (no cross-repo blocking)', async () => {
    const log = [];

    const opA = async () => {
      const release = await acquireRepoLock('/repos/owner/repo-a');
      try { await fakeGitOp('A', log, 30); }
      finally { release(); }
    };

    const opB = async () => {
      const release = await acquireRepoLock('/repos/owner/repo-b');
      try { await fakeGitOp('B', log, 5); }
      finally { release(); }
    };

    await Promise.all([opA(), opB()]);

    // B is faster and should finish before A even though A started first
    expect(log).toEqual(['A:start', 'B:start', 'B:end', 'A:end']);
  });

  // ── lock release on error ──────────────────────────────────────────────

  test('lock is released even when the critical section throws', async () => {
    const log = [];
    const path = '/repos/owner/error-repo';

    const faultyOp = async () => {
      const release = await acquireRepoLock(path);
      try {
        log.push('faulty:start');
        throw new Error('git merge conflict');
      } finally {
        release();
      }
    };

    const successOp = async () => {
      const release = await acquireRepoLock(path);
      try { await fakeGitOp('success', log, 5); }
      finally { release(); }
    };

    // faultyOp fails, successOp must still run
    await Promise.allSettled([faultyOp(), successOp()]);

    expect(log).toContain('faulty:start');
    expect(log).toContain('success:start');
    expect(log).toContain('success:end');
    // success must start only after faulty finishes (lock was released)
    expect(log.indexOf('success:start')).toBeGreaterThan(log.indexOf('faulty:start'));
  });

  // ── memory cleanup ─────────────────────────────────────────────────────

  test('lock map entry is removed after the last waiter releases', async () => {
    const path = '/repos/owner/cleanup-repo';

    const release = await acquireRepoLock(path);
    release();

    // Give the cleanup microtask a tick to run
    await Promise.resolve();

    expect(_lockMapSize()).toBe(0);
  });

  test('lock map does not grow unboundedly across many sequential acquires', async () => {
    const path = '/repos/owner/seq-repo';

    for (let i = 0; i < 20; i++) {
      const release = await acquireRepoLock(path);
      release();
      await Promise.resolve();
    }

    expect(_lockMapSize()).toBe(0);
  });

  // ── checkout+merge critical section simulation ─────────────────────────

  test('checkout and merge steps of two concurrent sagas are never interleaved', async () => {
    const log = [];
    const path = '/repos/owner/concurrent-merge-repo';

    // Simulates a saga's gitCheckout + gitMerge steps
    const runSaga = async (label, checkoutMs, mergeMs) => {
      // gitCheckout: acquire lock, do checkout
      const release = await acquireRepoLock(path);
      try {
        log.push(`${label}:checkout:start`);
        await new Promise((r) => setTimeout(r, checkoutMs));
        log.push(`${label}:checkout:end`);

        // gitMerge: still inside the same lock
        log.push(`${label}:merge:start`);
        await new Promise((r) => setTimeout(r, mergeMs));
        log.push(`${label}:merge:end`);
      } finally {
        release();
      }
    };

    await Promise.all([
      runSaga('PR-A', 20, 20),
      runSaga('PR-B', 5,  5),
    ]);

    // PR-A acquires first; its checkout AND merge must fully complete before
    // PR-B's checkout begins.
    const prACheckoutStart = log.indexOf('PR-A:checkout:start');
    const prAMergeEnd      = log.indexOf('PR-A:merge:end');
    const prBCheckoutStart = log.indexOf('PR-B:checkout:start');

    expect(prBCheckoutStart).toBeGreaterThan(prAMergeEnd);
    expect(prACheckoutStart).toBeLessThan(prAMergeEnd);
  });
});
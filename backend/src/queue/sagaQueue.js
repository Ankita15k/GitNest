import SagaOrchestrator from '../services/saga/sagaOrchestrator.js';
import { devLog } from '../utils/devLogger.js';

class SagaQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.activeJobs = new Map();
  }

  /**
   * Enqueues a Saga execution job.
   * Runs the queue processor in the background.
   *
   * @param {string} sagaId
   * @param {string} type
   * @param {Array} steps
   * @param {Object} initialContext
   * @param {Object} options
   * @returns {Promise<Object>} Resolves when the saga has been successfully enqueued
   */
  async enqueue(sagaId, type, steps, initialContext = {}, options = {}) {
    devLog(`[SagaQueue] Enqueuing job ${type} with sagaId: ${sagaId}`);
    
    // Construct a promise that will resolve or reject when the job finishes processing
    const jobPromise = new Promise((resolve, reject) => {
      this.queue.push({
        sagaId,
        type,
        steps,
        initialContext,
        options,
        resolve,
        reject,
      });
    });

    this.activeJobs.set(sagaId, jobPromise);

    // Process the queue asynchronously
    this._processQueue();

    return jobPromise;
  }

  /**
   * Internal queue processor.
   * Processes jobs sequentially to ensure strict database consistency.
   */
  async _processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const job = this.queue.shift();

    try {
      devLog(`[SagaQueue] Processing job ${job.type} (sagaId: ${job.sagaId})`);
      const result = await SagaOrchestrator.executeSaga(
        job.sagaId,
        job.type,
        job.steps,
        job.initialContext,
        job.options
      );
      job.resolve(result);
    } catch (error) {
      devLog(`[SagaQueue] Job ${job.type} (sagaId: ${job.sagaId}) failed: ${error.message}`);
      job.reject(error);
    } finally {
      this.activeJobs.delete(job.sagaId);
      this.processing = false;
      // Trigger next job processing asynchronously
      setImmediate(() => this._processQueue());
    }
  }

  /**
   * Checks if a saga is currently queued or active.
   */
  isJobActive(sagaId) {
    return this.activeJobs.has(sagaId);
  }

  /**
   * Returns the promise of an active job so callers can wait on it if desired.
   */
  getJobPromise(sagaId) {
    return this.activeJobs.get(sagaId);
  }
}

const sagaQueue = new SagaQueue();
export default sagaQueue;

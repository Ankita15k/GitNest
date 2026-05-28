import SagaState from '../../models/SagaState.model.js';
import mongoose from 'mongoose';
import { devLog } from '../../utils/devLogger.js';

export class SagaOrchestrator {
  /**
   * Executes a saga composed of sequential steps.
   * Supports:
   * - Strict Idempotency: Checks for prior saga state and returns cached results if completed.
   * - Resumability: Skips previously completed steps if retrying.
   * - Automated Step Retries: Retries transient step failures up to `maxRetries`.
   * - Automated reverse compensations: Rolls back all completed steps in reverse order upon final failure.
   *
   * @param {string} sagaId - Unique identifier (idempotency key)
   * @param {string} type - Identifier of the Saga operation
   * @param {Array} steps - Array of steps: { name: string, execute: function, compensate: function }
   * @param {Object} initialContext - Input data for the saga steps
   * @param {Object} options - Saga configurations (e.g. maxRetries)
   */
  static async executeSaga(sagaId, type, steps, initialContext = {}, options = {}) {
    const maxRetries = options.maxRetries ?? 3;
    const retryDelayMs = options.retryDelayMs ?? 100;
    
    let state = await SagaState.findOne({ sagaId });
    
    // 1. Idempotency Check
    if (state) {
      if (state.status === 'completed') {
        devLog(`[Saga: ${type}] Already completed for sagaId: ${sagaId}. Returning cached state.`);
        return state.metadata;
      }
      if (state.status === 'processing' || state.status === 'rolling_back') {
        throw new Error(`Saga ${type} with ID ${sagaId} is currently in progress.`);
      }
      // If failed/rolled_back, we will resume/retry using the existing state doc
      state.status = 'processing';
      await state.save();
    } else {
      state = await SagaState.create({
        sagaId,
        type,
        status: 'processing',
        completedSteps: [],
        metadata: initialContext,
      });
    }

    const context = state.metadata || {};
    
    // We can run database updates within a Mongoose session if needed
    const session = await mongoose.startSession();
    const useTransaction = typeof session.startTransaction === 'function';
    
    try {
      if (useTransaction) {
        session.startTransaction();
      }

      // Begin execution pipeline
      for (const step of steps) {
        // Resumability: Skip step if already recorded as successfully completed
        if (state.completedSteps.includes(step.name)) {
          devLog(`[Saga: ${type}] Step ${step.name} already completed in a prior run. Skipping.`);
          continue;
        }

        let stepSuccess = false;
        let stepError = null;

        // Automated retry loop for the current step
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            devLog(`[Saga: ${type}] Executing step ${step.name} (Attempt ${attempt}/${maxRetries})...`);
            
            // Run the step
            const result = await step.execute(context, session);
            if (result && typeof result === 'object') {
              Object.assign(context, result);
            }
            
            stepSuccess = true;
            break; // Break retry loop on success
          } catch (error) {
            stepError = error;
            devLog(`[Saga: ${type}] Step ${step.name} failed on attempt ${attempt}: ${error.message}`);
            
            // Increment retry count in state
            state.retryCount += 1;
            await state.save();
            
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            }
          }
        }

        if (!stepSuccess) {
          state.failedStep = step.name;
          await state.save();
          throw stepError || new Error(`Step ${step.name} failed after ${maxRetries} attempts.`);
        }

        // Record successful step completion
        state.completedSteps.push(step.name);
        state.metadata = context;
        await state.save();
      }

      if (useTransaction) {
        await session.commitTransaction();
      }

      // If all steps succeeded, mark saga as completed
      state.status = 'completed';
      await state.save();
      devLog(`[Saga: ${type}] Execution succeeded for sagaId: ${sagaId}`);
      
      return context;
    } catch (pipelineError) {
      devLog(`[Saga: ${type}] Pipeline failed at step ${state.failedStep}. Initiating rollback compensations...`);
      
      if (useTransaction) {
        try {
          await session.abortTransaction();
        } catch (abortErr) {
          devLog(`[Saga: ${type}] Failed to abort transaction: ${abortErr.message}`);
        }
      }

      state.status = 'rolling_back';
      await state.save();
      
      // Rollback completed steps in reverse order
      const completedList = [...state.completedSteps];
      for (let i = completedList.length - 1; i >= 0; i--) {
        const stepName = completedList[i];
        const step = steps.find((s) => s.name === stepName);
        if (step && step.compensate) {
          try {
            devLog(`[Saga: ${type}] Compensating step ${stepName}...`);
            await step.compensate(context, session);
          } catch (compError) {
            console.error(`[Saga: ${type}] CRITICAL: Compensation failed for step ${stepName}:`, compError);
            // Continue compensating other steps even if one fails to ensure maximum consistency
          }
        }
      }

      state.status = 'rolled_back';
      await state.save();
      devLog(`[Saga: ${type}] Rollback completed for sagaId: ${sagaId}`);
      
      throw pipelineError;
    } finally {
      session.endSession();
    }
  }
}

export default SagaOrchestrator;

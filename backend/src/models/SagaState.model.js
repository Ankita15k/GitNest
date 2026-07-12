import mongoose from 'mongoose';

const sagaStateSchema = new mongoose.Schema(
  {
    sagaId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rolling_back', 'rolled_back'],
      default: 'pending',
    },
    completedSteps: {
      type: [String],
      default: [],
    },
    failedStep: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastHeartbeatAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SagaState = mongoose.model('SagaState', sagaStateSchema);
export default SagaState;
import mongoose from 'mongoose';

const securityEventSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    scanId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['SECRET_EXPOSED', 'VULNERABLE_DEPENDENCY', 'VERSION_MISMATCH', 'SUSPICIOUS_FILE'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

securityEventSchema.index({ repository: 1, createdAt: -1 });
securityEventSchema.index({ scanId: 1 });
securityEventSchema.index(
  { repository: 1, scanId: 1, type: 1, 'metadata.file': 1, 'metadata.line': 1 },
  { unique: true, sparse: true }
);

const SecurityEvent = mongoose.model('SecurityEvent', securityEventSchema);
export default SecurityEvent;
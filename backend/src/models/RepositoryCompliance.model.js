import mongoose from 'mongoose';

const complianceCheckSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
    value: { type: mongoose.Schema.Types.Mixed },
    threshold: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const policyResultSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    status: { type: String, enum: ['PASS', 'WARNING', 'FAIL'], required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    threshold: { type: mongoose.Schema.Types.Mixed },
    scoreImpact: { type: Number, default: 0 },
  },
  { _id: false }
);

const repositoryComplianceSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true,
  },
  repositoryName: {
    type: String,
    required: true,
    trim: true,
  },
  complianceStatus: {
    type: String,
    enum: ['COMPLIANT', 'WARNING', 'NON_COMPLIANT'],
    required: true,
    index: true,
  },
  complianceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true,
  },
  violations: {
    type: [complianceCheckSchema],
    default: [],
  },
  warnings: {
    type: [complianceCheckSchema],
    default: [],
  },
  passedChecks: {
    type: [complianceCheckSchema],
    default: [],
  },
  policyResults: {
    type: [policyResultSchema],
    default: [],
  },
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

repositoryComplianceSchema.index({ repositoryId: 1, generatedAt: -1 });

const RepositoryCompliance = mongoose.model('RepositoryCompliance', repositoryComplianceSchema);
export default RepositoryCompliance;

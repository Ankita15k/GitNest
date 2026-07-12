import mongoose from 'mongoose';

const architectureAnalysisSchema = new mongoose.Schema({
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
  complexityScore: {
    type: Number,
    default: 0,
    min: 0,
  },
  riskScore: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true,
  },
  hotspotCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  circularDependencyCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  criticalModuleCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  summary: {
    type: String,
    default: '',
    trim: true,
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

architectureAnalysisSchema.index({ repositoryId: 1, generatedAt: -1 });

const ArchitectureAnalysis = mongoose.model('ArchitectureAnalysis', architectureAnalysisSchema);
export default ArchitectureAnalysis;

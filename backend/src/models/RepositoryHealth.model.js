import mongoose from 'mongoose';

const repositoryHealthSchema = new mongoose.Schema({
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
  overallScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true,
  },
  securityScore: { type: Number, required: true, min: 0, max: 100 },
  architectureScore: { type: Number, required: true, min: 0, max: 100 },
  activityScore: { type: Number, required: true, min: 0, max: 100 },
  maintainabilityScore: { type: Number, required: true, min: 0, max: 100 },
  healthCategory: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    required: true,
    index: true,
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

repositoryHealthSchema.index({ repositoryId: 1, generatedAt: -1 });

const RepositoryHealth = mongoose.model('RepositoryHealth', repositoryHealthSchema);
export default RepositoryHealth;

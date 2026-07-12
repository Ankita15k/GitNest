import mongoose from 'mongoose';

const dependencyGraphSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true,
  },
  filePath: {
    type: String,
    required: true,
    trim: true,
  },
  sourceSymbol: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  sourceType: {
    type: String,
    required: true,
    trim: true,
  },
  targetSymbol: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  targetType: {
    type: String,
    required: true,
    trim: true,
  },
  dependencyType: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

dependencyGraphSchema.index({ repositoryId: 1, sourceSymbol: 1 });
dependencyGraphSchema.index({ repositoryId: 1, targetSymbol: 1 });
dependencyGraphSchema.index({ repositoryId: 1, dependencyType: 1 });

const DependencyGraph = mongoose.model('DependencyGraph', dependencyGraphSchema);
export default DependencyGraph;

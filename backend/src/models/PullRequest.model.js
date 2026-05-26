import mongoose from 'mongoose';

const diffChunkSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['context', 'added', 'removed'], required: true },
    line: { type: Number, min: 1, required: true },
    content: { type: String, default: '' },
  },
  { _id: false }
);

const diffFileSchema = new mongoose.Schema(
  {
    file: { type: String, required: true, trim: true },
    chunks: { type: [diffChunkSchema], default: [] },
  },
  { _id: false }
);

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
    type: { type: String, enum: ['general', 'review'], default: 'general' },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['approved', 'changes_requested', 'commented'], required: true },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

const pullRequestSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['open', 'closed', 'merged'], default: 'open', index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true, index: true },
    sourceBranch: { type: String, required: true, trim: true },
    targetBranch: { type: String, required: true, trim: true },
    diff: { type: [diffFileSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    reviews: { type: [reviewSchema], default: [] },
    mergedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pullRequestSchema.index({ repository: 1, number: 1 }, { unique: true });
pullRequestSchema.index({ title: 'text', description: 'text' });
pullRequestSchema.virtual('fromBranch').get(function getFromBranch() { return this.sourceBranch; });
pullRequestSchema.virtual('toBranch').get(function getToBranch() { return this.targetBranch; });
pullRequestSchema.set('toJSON', { virtuals: true });
pullRequestSchema.set('toObject', { virtuals: true });

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);
export default PullRequest;

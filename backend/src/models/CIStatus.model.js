import mongoose from 'mongoose';

const ciStatusSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      index: true,
    },
    commitSha: {
      type: String,
      required: true,
      index: true,
    },
    pullRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PullRequest',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['success', 'failure', 'pending', 'error', 'neutral', 'skipped'],
      default: 'pending',
    },
    provider: {
      type: String,
      required: true,
      enum: ['github', 'circleci', 'jenkins', 'gitlab', 'other'],
      default: 'github',
    },
    checkName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    detailsUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ciStatusSchema.index({ repository: 1, commitSha: 1 });
ciStatusSchema.index({ pullRequestId: 1, createdAt: -1 });

export default mongoose.model('CIStatus', ciStatusSchema);

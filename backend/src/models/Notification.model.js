import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'USER_FOLLOWED',
        'REPOSITORY_STARRED',
        'REPOSITORY_FORKED',
        'PULL_REQUEST_MERGED',
      ],
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
    },
    message: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);

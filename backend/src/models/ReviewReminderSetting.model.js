import mongoose from 'mongoose';

const reviewReminderSettingSchema = new mongoose.Schema(
  {
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
      unique: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    thresholdHours: {
      type: Number,
      required: true,
      default: 24,
      min: 1,
      max: 720,
      description: 'Hours before a PR is considered stale for review reminder',
    },
    notificationChannels: {
      type: [String],
      enum: ['in-app', 'email'],
      default: ['in-app'],
    },
    excludeAuthors: {
      type: Boolean,
      default: true,
      description: 'Do not remind author of their own PR',
    },
    maxRemindersPerPR: {
      type: Number,
      default: 3,
      min: 1,
      max: 10,
      description: 'Maximum number of reminders per PR',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ReviewReminderSetting', reviewReminderSettingSchema);

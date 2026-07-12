import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'repo.create',
        'repo.update',
        'repo.delete',
        'branch_protection.create',
        'branch_protection.update',
        'branch_protection.delete',
        'collaborator.add',
        'collaborator.remove',
        'collaborator.role_change',
        'repo.clone',
        'auth.login',
        'auth.logout',
        'settings.update',
      ],
    },
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

auditLogSchema.index({ repositoryId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);

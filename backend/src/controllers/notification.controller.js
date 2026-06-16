import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/Notification.model.js';
import { sendSuccess } from '../utils/responseHandlers.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'username avatarUrl')
      .lean(),
    Notification.countDocuments({ recipient: req.user._id }),
  ]);

  sendSuccess(res, 200, {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  sendSuccess(res, 200, { count });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true },
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  sendSuccess(res, 200, notification);
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true },
  );

  sendSuccess(res, 200, { message: 'All notifications marked as read' });
});

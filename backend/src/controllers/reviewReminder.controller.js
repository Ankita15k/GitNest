import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import ReviewReminderService from '../services/reviewReminderService.js';
import Repository from '../models/Repository.model.js';
import AppError from '../utils/AppError.js';

export const getReminderSettings = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;

  const repository = await Repository.findOne({
    name: reponame,
    owner: req.user.id,
  });

  if (!repository) {
    return sendError(res, 404, 'Repository not found');
  }

  const settings = await ReviewReminderService.getReminderSetting(repository._id);

  sendSuccess(
    res,
    200,
    { settings: settings || null },
    'Review reminder settings retrieved'
  );
});

export const updateReminderSettings = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;
  const { enabled, thresholdHours, notificationChannels, excludeAuthors, maxRemindersPerPR } = req.body;

  const repository = await Repository.findOne({
    name: reponame,
    owner: req.user.id,
  });

  if (!repository) {
    return sendError(res, 404, 'Repository not found');
  }

  const settings = await ReviewReminderService.updateReminderSetting(
    repository._id,
    {
      enabled,
      thresholdHours,
      notificationChannels,
      excludeAuthors,
      maxRemindersPerPR,
    },
    req.user.id
  );

  sendSuccess(
    res,
    200,
    { settings },
    'Review reminder settings updated successfully'
  );
});

export const testReminder = asyncHandler(async (req, res) => {
  const { username, reponame } = req.params;

  const repository = await Repository.findOne({
    name: reponame,
    owner: req.user.id,
  });

  if (!repository) {
    return sendError(res, 404, 'Repository not found');
  }

  const results = await ReviewReminderService.processAllReminders();

  sendSuccess(
    res,
    200,
    { results },
    'Reminder processing completed'
  );
});

export default {
  getReminderSettings,
  updateReminderSettings,
  testReminder,
};

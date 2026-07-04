import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getReminderSettings,
  updateReminderSettings,
  testReminder,
} from '../controllers/reviewReminder.controller.js';

const router = express.Router();

router.get(
  '/:username/:reponame/review-reminders/settings',
  protect,
  getReminderSettings
);

router.put(
  '/:username/:reponame/review-reminders/settings',
  protect,
  updateReminderSettings
);

router.post(
  '/:username/:reponame/review-reminders/test',
  protect,
  testReminder
);

export default router;

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getTeamWorkload,
  getContributorDetails,
} from '../controllers/teamWorkload.controller.js';

const router = express.Router();

router.get('/workload', protect, getTeamWorkload);

router.get('/workload/contributor/:login', protect, getContributorDetails);

export default router;

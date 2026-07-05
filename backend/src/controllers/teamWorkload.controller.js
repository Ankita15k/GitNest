import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/responseHandlers.js';
import TeamWorkloadService from '../services/teamWorkloadService.js';

export const getTeamWorkload = asyncHandler(async (req, res) => {
  const { organizationId } = req.query;

  const workload = await TeamWorkloadService.getTeamWorkload(
    req.user.id,
    organizationId || null
  );

  sendSuccess(
    res,
    200,
    { workload },
    'Team workload retrieved successfully'
  );
});

export const getContributorDetails = asyncHandler(async (req, res) => {
  const { login } = req.params;
  const { organizationId } = req.query;

  if (!login) {
    return sendError(res, 400, 'Contributor login is required');
  }

  const details = await TeamWorkloadService.getContributorDetails(
    req.user.id,
    login,
    organizationId || null
  );

  sendSuccess(
    res,
    200,
    details,
    'Contributor details retrieved successfully'
  );
});

export default {
  getTeamWorkload,
  getContributorDetails,
};

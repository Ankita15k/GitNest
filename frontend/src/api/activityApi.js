import authApi from './authApi.js';

export const fetchGlobalActivities = async (page = 1, limit = 10) => {
  const response = await authApi.get('/activities/global', {
    params: { page, limit },
  });
  return response.data;
};

export const fetchUserActivities = async (username, page = 1, limit = 10) => {
  const response = await authApi.get(`/activities/user/${username}`, {
    params: { page, limit },
  });
  return response.data;
};

export const fetchRepositoryActivities = async (repo, page = 1, limit = 10) => {
  const response = await authApi.get(`/activities/repository/${repo}`, {
    params: { page, limit },
  });
  return response.data;
};

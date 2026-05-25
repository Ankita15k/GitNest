import { createApiClient } from './createApiClient.js';
import { unwrapApiData } from '../utils/apiContracts.js';

const pullRequestApi = createApiClient('/pull-requests');

export const fetchPullRequests = async ({ page = 1, limit = 20, status = 'all', search = '' } = {}) => {
  const { data } = await pullRequestApi.get('/', {
    params: { page, limit, status, search: search || undefined },
  });
  return data.data;
};

export const fetchPullRequest = async (id) => {
  const response = await pullRequestApi.get(`/${id}`);
  return unwrapApiData(response);
};

export const createPullRequest = async (payload) => {
  const response = await pullRequestApi.post('/', payload);
  return unwrapApiData(response);
};

export const updatePullRequest = async (id, payload) => {
  const response = await pullRequestApi.put(`/${id}`, payload);
  return unwrapApiData(response);
};

export const mergePullRequest = async (id) => {
  const response = await pullRequestApi.post(`/${id}/merge`);
  return unwrapApiData(response);
};

export const closePullRequest = async (id) => {
  const response = await pullRequestApi.post(`/${id}/close`);
  return unwrapApiData(response);
};

export const addPullRequestComment = async (id, body) => {
  const response = await pullRequestApi.post(`/${id}/comments`, { body });
  return unwrapApiData(response);
};

export const submitPullRequestReview = async (id, action, comment = '') => {
  const response = await pullRequestApi.post(`/${id}/reviews`, { action, comment });
  return unwrapApiData(response);
};

export default pullRequestApi;

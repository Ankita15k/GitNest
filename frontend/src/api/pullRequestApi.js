import { createApiClient } from './createApiClient.js';
import { unwrapApiData } from '../utils/apiContracts.js';

const pullRequestApi = createApiClient('/pull-requests');

export const fetchPullRequests = async ({ page = 1, limit = 20, status = 'all', search = '' } = {}) => {
  const { data } = await pullRequestApi.get('/', {
    params: { page, limit, status, search: search || undefined },
  });
  return data.data;
};

export const fetchPullRequest = async (id) => unwrapApiData(await pullRequestApi.get(`/${id}`));
export const addPullRequestComment = async (id, body) => unwrapApiData(await pullRequestApi.post(`/${id}/comments`, { body }));
export const submitPullRequestReview = async (id, action, comment = '') => unwrapApiData(await pullRequestApi.post(`/${id}/reviews`, { action, comment }));
export const mergePullRequest = async (id) => unwrapApiData(await pullRequestApi.post(`/${id}/merge`));
export const closePullRequest = async (id) => unwrapApiData(await pullRequestApi.post(`/${id}/close`));
export const createPullRequest = async (payload) => unwrapApiData(await pullRequestApi.post('/', payload));
export const updatePullRequest = async (id, payload) => unwrapApiData(await pullRequestApi.put(`/${id}`, payload));

export default pullRequestApi;

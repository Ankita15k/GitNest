import { createApiClient } from './createApiClient.js';

const architectureApi = createApiClient('/architecture');

export const analyzeRepo = async (owner, repo) => {
  const response = await architectureApi.get(`/${owner}/${repo}`);
  return response.data.data;
};

export default architectureApi;
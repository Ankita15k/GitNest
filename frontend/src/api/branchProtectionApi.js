import { createApiClient } from './createApiClient.js';

const branchProtectionApi = createApiClient('/repos');

export const listRules = async ({ username, reponame }) => {
  const response = await branchProtectionApi.get(`/${username}/${reponame}/settings/branch-protection`);
  return response.data;
};

export const createRule = async ({ username, reponame, data }) => {
  const response = await branchProtectionApi.post(`/${username}/${reponame}/settings/branch-protection`, data);
  return response.data;
};

export const updateRule = async ({ username, reponame, ruleId, data }) => {
  const response = await branchProtectionApi.put(`/${username}/${reponame}/settings/branch-protection/${ruleId}`, data);
  return response.data;
};

export const deleteRule = async ({ username, reponame, ruleId }) => {
  const response = await branchProtectionApi.delete(`/${username}/${reponame}/settings/branch-protection/${ruleId}`);
  return response.data;
};

export default branchProtectionApi;

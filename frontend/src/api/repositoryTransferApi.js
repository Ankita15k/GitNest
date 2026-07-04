import { createApiClient } from './createApiClient';

const apiClient = createApiClient('/repos');

export const initiateTransfer = async ({ owner, repoName, receiverUsername }) => {
  const { data } = await apiClient.post(`/${owner}/${repoName}/transfer`, { receiverUsername });
  return data;
};

export const acceptTransfer = async ({ owner, repoName }) => {
  const { data } = await apiClient.post(`/${owner}/${repoName}/transfer/accept`);
  return data;
};

export const rejectTransfer = async ({ owner, repoName }) => {
  const { data } = await apiClient.post(`/${owner}/${repoName}/transfer/reject`);
  return data;
};

export const cancelTransfer = async ({ owner, repoName }) => {
  const { data } = await apiClient.post(`/${owner}/${repoName}/transfer/cancel`);
  return data;
};

export const getPendingTransfers = async () => {
  const { data } = await apiClient.get('/pending');
  return data;
};

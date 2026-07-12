import { createApiClient } from './createApiClient.js';

const auditLogApi = createApiClient('/repos');

export const fetchAuditLogs = async ({
  username,
  reponame,
  page = 1,
  limit = 20,
  filters = {},
}) => {
  const params = {
    page,
    limit,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  }

  const response = await auditLogApi.get(`/${username}/${reponame}/audit-logs`, {
    params,
  });

  return response.data;
};

export default auditLogApi;

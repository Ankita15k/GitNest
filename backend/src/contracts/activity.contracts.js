import { sharedSchemas } from './components.js';

const activityListData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    activities: { type: 'array', items: sharedSchemas.activity },
    pagination: sharedSchemas.pagination,
  },
  required: ['activities', 'pagination'],
};

export const activityContracts = {
  global: {
    tags: ['Activities'],
    summary: 'Fetch global activity feed',
    request: { query: sharedSchemas.paginationQuery },
    responses: {
      200: sharedSchemas.successEnvelope(activityListData),
    },
  },
  user: {
    tags: ['Activities'],
    summary: 'Fetch activity feed for a user',
    request: {
      params: sharedSchemas.usernameParam,
      query: sharedSchemas.paginationQuery,
    },
    responses: {
      200: sharedSchemas.successEnvelope(activityListData),
    },
  },
  repository: {
    tags: ['Activities'],
    summary: 'Fetch activity feed for a repository',
    request: {
      params: {
        type: 'object',
        additionalProperties: true,
        properties: {
          repo: { type: 'string', minLength: 1 },
        },
        required: ['repo'],
      },
      query: sharedSchemas.paginationQuery,
    },
    responses: {
      200: sharedSchemas.successEnvelope(activityListData),
    },
  },
};

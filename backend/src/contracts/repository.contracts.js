import { sharedSchemas } from './components.js';

const repositoryBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    visibility: { type: 'string', enum: ['public', 'private'] },
    language: { type: 'string', maxLength: 50 },
    topics: {
      type: 'array',
      maxItems: 20,
      items: { type: 'string', minLength: 1, maxLength: 50 },
    },
    defaultBranch: { type: 'string', minLength: 1, maxLength: 100 },
  },
};

export const repositoryContracts = {
  listByUser: {
    tags: ['Repositories'],
    summary: 'List repositories for a user',
    request: {
      params: sharedSchemas.usernameParam,
      query: sharedSchemas.paginationQuery,
    },
    responses: {
      200: sharedSchemas.successEnvelope({
        type: 'object',
        additionalProperties: false,
        properties: {
          repositories: { type: 'array', items: sharedSchemas.repository },
          pagination: sharedSchemas.pagination,
        },
        required: ['repositories', 'pagination'],
      }),
    },
  },
  get: {
    tags: ['Repositories'],
    summary: 'Fetch a repository',
    request: { params: sharedSchemas.repoParam },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.repository),
    },
  },
  create: {
    tags: ['Repositories'],
    summary: 'Create a repository',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        ...repositoryBody,
        required: ['name'],
      },
    },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.repository),
    },
  },
  update: {
    tags: ['Repositories'],
    summary: 'Update a repository',
    security: [{ bearerAuth: [] }],
    request: {
      params: sharedSchemas.repoParam,
      body: repositoryBody,
    },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.repository),
    },
  },
  remove: {
    tags: ['Repositories'],
    summary: 'Delete a repository',
    security: [{ bearerAuth: [] }],
    request: { params: sharedSchemas.repoParam },
    responses: {
      200: sharedSchemas.successEnvelope({ type: 'null' }),
    },
  },
  star: {
    tags: ['Repositories'],
    summary: 'Toggle repository star',
    security: [{ bearerAuth: [] }],
    request: { params: sharedSchemas.repoParam },
    responses: {
      200: sharedSchemas.successEnvelope({
        type: 'object',
        additionalProperties: false,
        properties: {
          stars: { type: 'integer', minimum: 0 },
        },
        required: ['stars'],
      }),
    },
  },
  fork: {
    tags: ['Repositories'],
    summary: 'Fork a repository',
    security: [{ bearerAuth: [] }],
    request: { params: sharedSchemas.repoParam },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.repository),
    },
  },
};

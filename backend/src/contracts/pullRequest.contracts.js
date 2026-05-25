import { sharedSchemas } from './components.js';

const prBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 10000 },
    repository: { type: 'string', minLength: 1 },
    repositoryId: { type: 'string', minLength: 1 },
    sourceBranch: { type: 'string', minLength: 1, maxLength: 100 },
    targetBranch: { type: 'string', minLength: 1, maxLength: 100 },
    fromBranch: { type: 'string', minLength: 1, maxLength: 100 },
    toBranch: { type: 'string', minLength: 1, maxLength: 100 },
    diff: { type: 'array', items: sharedSchemas.diffFile },
  },
};

const prParams = {
  type: 'object',
  additionalProperties: true,
  properties: {
    id: { type: 'string', minLength: 1 },
  },
  required: ['id'],
};

const commentBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    body: { type: 'string', minLength: 1, maxLength: 5000 },
    type: { type: 'string', enum: ['general', 'review'] },
  },
  required: ['body'],
};

const reviewBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    action: { type: 'string', enum: ['approve', 'changes_requested', 'comment'] },
    comment: { type: 'string', maxLength: 5000 },
  },
  required: ['action'],
};

const updateBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 200 },
    description: { type: 'string', maxLength: 10000 },
    sourceBranch: { type: 'string', minLength: 1, maxLength: 100 },
    targetBranch: { type: 'string', minLength: 1, maxLength: 100 },
    fromBranch: { type: 'string', minLength: 1, maxLength: 100 },
    toBranch: { type: 'string', minLength: 1, maxLength: 100 },
    status: { type: 'string', enum: ['open', 'closed'] },
    diff: { type: 'array', items: sharedSchemas.diffFile },
  },
};

export const pullRequestContracts = {
  list: {
    tags: ['Pull Requests'],
    summary: 'List pull requests',
    request: {
      query: {
        type: 'object',
        additionalProperties: true,
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 50 },
          status: { type: 'string', enum: ['open', 'closed', 'merged', 'all'] },
          repository: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
    responses: {
      200: sharedSchemas.successEnvelope({
        type: 'object',
        additionalProperties: false,
        properties: {
          pullRequests: { type: 'array', items: sharedSchemas.pullRequest },
          counts: {
            type: 'object',
            additionalProperties: false,
            properties: {
              open: { type: 'integer', minimum: 0 },
              closed: { type: 'integer', minimum: 0 },
              merged: { type: 'integer', minimum: 0 },
            },
            required: ['open', 'closed', 'merged'],
          },
          pagination: sharedSchemas.pagination,
        },
        required: ['pullRequests', 'counts', 'pagination'],
      }),
    },
  },
  detail: {
    tags: ['Pull Requests'],
    summary: 'Fetch a pull request',
    request: { params: prParams },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest),
    },
  },
  create: {
    tags: ['Pull Requests'],
    summary: 'Create a pull request',
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        ...prBody,
        required: ['title', 'repository', 'sourceBranch', 'targetBranch'],
      },
    },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.pullRequest),
    },
  },
  update: {
    tags: ['Pull Requests'],
    summary: 'Update a pull request',
    security: [{ bearerAuth: [] }],
    request: { params: prParams, body: updateBody },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest),
    },
  },
  merge: {
    tags: ['Pull Requests'],
    summary: 'Merge a pull request',
    security: [{ bearerAuth: [] }],
    request: { params: prParams },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest),
    },
  },
  close: {
    tags: ['Pull Requests'],
    summary: 'Close a pull request',
    security: [{ bearerAuth: [] }],
    request: { params: prParams },
    responses: {
      200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest),
    },
  },
  comment: {
    tags: ['Pull Requests'],
    summary: 'Add a pull request comment',
    security: [{ bearerAuth: [] }],
    request: { params: prParams, body: commentBody },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.pullRequestComment),
    },
  },
  review: {
    tags: ['Pull Requests'],
    summary: 'Submit a pull request review',
    security: [{ bearerAuth: [] }],
    request: { params: prParams, body: reviewBody },
    responses: {
      201: sharedSchemas.successEnvelope(sharedSchemas.review),
    },
  },
};

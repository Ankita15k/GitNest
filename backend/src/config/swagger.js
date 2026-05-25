import swaggerJSDoc from 'swagger-jsdoc';
import { components, contracts } from '../contracts/index.js';

const errorResponses = {
  400: {
    description: 'Validation error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  401: {
    description: 'Authentication error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  404: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
  500: {
    description: 'Server error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorEnvelope' },
      },
    },
  },
};

const bodyContent = (schema) => ({
  required: true,
  content: {
    'application/json': { schema },
  },
});

const pathParameter = (name) => ({
  name,
  in: 'path',
  required: true,
  schema: { type: 'string' },
});

const queryParameters = (querySchema = {}) =>
  Object.entries(querySchema.properties || {}).map(([name, schema]) => ({
    name,
    in: 'query',
    required: (querySchema.required || []).includes(name),
    schema,
  }));

const pathParameters = (paramSchema = {}) =>
  (paramSchema.required || Object.keys(paramSchema.properties || {})).map(pathParameter);

const operationFromContract = (contract) => {
  const responses = Object.entries(contract.responses || {}).reduce((acc, [status, schema]) => {
    acc[status] = {
      description: `${status} response`,
      content: {
        'application/json': { schema },
      },
    };
    return acc;
  }, {});

  return {
    tags: contract.tags,
    summary: contract.summary,
    security: contract.security,
    parameters: [
      ...pathParameters(contract.request?.params),
      ...queryParameters(contract.request?.query),
    ],
    requestBody: contract.request?.body ? bodyContent(contract.request.body) : undefined,
    responses: {
      ...responses,
      ...errorResponses,
    },
  };
};

const operation = (contract) => operationFromContract(contract);

const paths = {
  '/api/v1/auth/register': {
    post: operation(contracts.auth.register),
  },
  '/api/v1/auth/login': {
    post: operation(contracts.auth.login),
  },
  '/api/v1/auth/me': {
    get: operation(contracts.auth.me),
  },
  '/api/v1/users/{username}': {
    get: operation(contracts.users.profile),
  },
  '/api/v1/users/profile': {
    put: operation(contracts.users.updateProfile),
  },
  '/api/v1/users/{username}/follow': {
    post: operation(contracts.users.follow),
    delete: operation(contracts.users.unfollow),
  },
  '/api/v1/users/{username}/followers': {
    get: operation(contracts.users.followers),
  },
  '/api/v1/users/{username}/following': {
    get: operation(contracts.users.following),
  },
  '/api/v1/repositories/{username}': {
    get: operation(contracts.repositories.listByUser),
  },
  '/api/v1/repositories/{username}/{reponame}': {
    get: operation(contracts.repositories.get),
    put: operation(contracts.repositories.update),
    delete: operation(contracts.repositories.remove),
  },
  '/api/v1/repositories': {
    post: operation(contracts.repositories.create),
  },
  '/api/v1/repositories/{username}/{reponame}/star': {
    post: operation(contracts.repositories.star),
  },
  '/api/v1/repositories/{username}/{reponame}/fork': {
    post: operation(contracts.repositories.fork),
  },
  '/api/v1/activities/global': {
    get: operation(contracts.activities.global),
  },
  '/api/v1/activities/user/{username}': {
    get: operation(contracts.activities.user),
  },
  '/api/v1/activities/repository/{repo}': {
    get: operation(contracts.activities.repository),
  },
  '/api/v1/pull-requests': {
    get: operation(contracts.pullRequests.list),
    post: operation(contracts.pullRequests.create),
  },
  '/api/v1/pull-requests/{id}': {
    get: operation(contracts.pullRequests.detail),
    put: operation(contracts.pullRequests.update),
  },
  '/api/v1/pull-requests/{id}/merge': {
    post: operation(contracts.pullRequests.merge),
  },
  '/api/v1/pull-requests/{id}/close': {
    post: operation(contracts.pullRequests.close),
  },
  '/api/v1/pull-requests/{id}/comments': {
    post: operation(contracts.pullRequests.comment),
  },
  '/api/v1/pull-requests/{id}/reviews': {
    post: operation(contracts.pullRequests.review),
  },
};

const baseDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'GitNest API',
    version: process.env.API_VERSION || '1.0.0',
    description: 'Schema-driven API contract for GitNest MERN services.',
  },
  servers: [
    {
      url: process.env.API_PUBLIC_URL || 'http://localhost:5000',
      description: 'GitNest API server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication and current-user endpoints' },
    { name: 'Users', description: 'User profile and relationship endpoints' },
    { name: 'Repositories', description: 'Repository management endpoints' },
    { name: 'Activities', description: 'Activity feed endpoints' },
    { name: 'Pull Requests', description: 'Pull request workflow endpoints' },
  ],
  components,
  paths,
};

const generatedSpec = swaggerJSDoc({
  definition: baseDefinition,
  apis: [],
});

export const swaggerSpec = {
  ...generatedSpec,
  paths,
  components,
};

export default swaggerSpec;

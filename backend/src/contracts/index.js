import { components, sharedSchemas } from './components.js';

const registerBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 30 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['username', 'email', 'password'],
};

const loginBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
  },
  required: ['email', 'password'],
};

const repositoryBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 100 },
    description: { type: 'string', maxLength: 500 },
    visibility: { type: 'string', enum: ['public', 'private'] },
    language: { type: 'string', maxLength: 50 },
    topics: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 50 } },
    defaultBranch: { type: 'string', minLength: 1, maxLength: 100 },
  },
};

const profileBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    bio: { type: 'string', maxLength: 280 },
    location: { type: 'string', maxLength: 100 },
    website: { type: 'string', maxLength: 200 },
    avatarUrl: { type: 'string', maxLength: 500 },
    displayName: { type: 'string', maxLength: 100 },
    company: { type: 'string', maxLength: 100 },
    twitterHandle: { type: 'string', maxLength: 50 },
  },
};

const activityListData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    activities: { type: 'array', items: sharedSchemas.activity },
    pagination: sharedSchemas.pagination,
  },
  required: ['activities', 'pagination'],
};

const pullRequestBody = {
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

const idParam = {
  type: 'object',
  additionalProperties: true,
  properties: { id: { type: 'string', minLength: 1 } },
  required: ['id'],
};

const listPullRequestsData = {
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
};

export const contracts = {
  auth: {
    register: { tags: ['Auth'], summary: 'Register a user', request: { body: registerBody }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.authUser) } },
    login: { tags: ['Auth'], summary: 'Log in a user', request: { body: loginBody }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.authUser) } },
    me: { tags: ['Auth'], summary: 'Fetch current user', security: [{ bearerAuth: [] }], responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.user) } },
  },
  repositories: {
    listByUser: { tags: ['Repositories'], request: { params: sharedSchemas.usernameParam, query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    get: { tags: ['Repositories'], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repository) } },
    create: { tags: ['Repositories'], security: [{ bearerAuth: [] }], request: { body: { ...repositoryBody, required: ['name'] } }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.repository) } },
    update: { tags: ['Repositories'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: repositoryBody }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repository) } },
    remove: { tags: ['Repositories'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'null' }) } },
    star: { tags: ['Repositories'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    fork: { tags: ['Repositories'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.repository) } },
  },
  users: {
    profile: { tags: ['Users'], request: { params: sharedSchemas.usernameParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.user) } },
    updateProfile: { tags: ['Users'], security: [{ bearerAuth: [] }], request: { body: profileBody }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.user) } },
    follow: { tags: ['Users'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.usernameParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'null' }) } },
    unfollow: { tags: ['Users'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.usernameParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'null' }) } },
    followers: { tags: ['Users'], request: { params: sharedSchemas.usernameParam, query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    following: { tags: ['Users'], request: { params: sharedSchemas.usernameParam, query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
  },
  activities: {
    global: { tags: ['Activities'], request: { query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope(activityListData) } },
    user: { tags: ['Activities'], request: { params: sharedSchemas.usernameParam, query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope(activityListData) } },
    repository: { tags: ['Activities'], security: [{ bearerAuth: [] }], request: { params: { type: 'object', additionalProperties: true, properties: { repo: { type: 'string', minLength: 1 } }, required: ['repo'] }, query: sharedSchemas.paginationQuery }, responses: { 200: sharedSchemas.successEnvelope(activityListData) } },
  },
  pullRequests: {
    list: { tags: ['Pull Requests'], request: { query: { type: 'object', additionalProperties: true, properties: { page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 50 }, status: { type: 'string', enum: ['open', 'closed', 'merged', 'all'] }, repository: { type: 'string' }, search: { type: 'string' } } } }, responses: { 200: sharedSchemas.successEnvelope(listPullRequestsData) } },
    detail: { tags: ['Pull Requests'], request: { params: idParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest) } },
    create: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { body: { ...pullRequestBody, required: ['title', 'repository', 'sourceBranch', 'targetBranch'] } }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.pullRequest) } },
    update: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { params: idParam, body: pullRequestBody }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest) } },
    merge: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { params: idParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest) } },
    close: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { params: idParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.pullRequest) } },
    comment: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { params: idParam, body: { type: 'object', additionalProperties: false, properties: { body: { type: 'string', minLength: 1 }, type: { type: 'string', enum: ['general', 'review'] } }, required: ['body'] } }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.pullRequestComment) } },
    review: { tags: ['Pull Requests'], security: [{ bearerAuth: [] }], request: { params: idParam, body: { type: 'object', additionalProperties: false, properties: { action: { type: 'string', enum: ['approve', 'changes_requested', 'comment'] }, comment: { type: 'string' } }, required: ['action'] } }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.review) } },
  },
};

export { components, sharedSchemas };

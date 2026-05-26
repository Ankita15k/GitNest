const timestamp = { type: 'string', format: 'date-time' };

const validationError = {
  type: 'object',
  additionalProperties: true,
  properties: {
    field: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['message'],
};

const pagination = {
  type: 'object',
  additionalProperties: true,
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
    totalCount: { type: 'integer', minimum: 0 },
    totalItems: { type: 'integer', minimum: 0 },
    totalPages: { type: 'integer', minimum: 1 },
    hasNextPage: { type: 'boolean' },
    hasPrevPage: { type: 'boolean' },
  },
  required: ['page', 'limit', 'totalPages'],
};

const successEnvelope = (dataSchema = {}) => ({
  type: 'object',
  additionalProperties: true,
  properties: {
    success: { const: true },
    status: { type: 'string', enum: ['success'] },
    message: { type: 'string' },
    data: dataSchema,
    requestId: { type: ['string', 'null'] },
  },
  required: ['success', 'message', 'data', 'requestId'],
});

const errorEnvelope = {
  type: 'object',
  additionalProperties: true,
  properties: {
    success: { const: false },
    status: { type: 'string', enum: ['fail', 'error'] },
    statusCode: { type: 'integer', minimum: 400 },
    code: { type: 'string' },
    message: { type: 'string' },
    errors: { type: 'array', items: validationError },
    requestId: { type: ['string', 'null'] },
    timestamp: { type: 'string' },
  },
  required: ['success', 'code', 'message', 'errors', 'requestId'],
};

const paginationQuery = {
  type: 'object',
  additionalProperties: true,
  properties: {
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
};

const usernameParam = {
  type: 'object',
  additionalProperties: true,
  properties: { username: { type: 'string', minLength: 1, maxLength: 39 } },
  required: ['username'],
};

const repoParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
  },
  required: ['username', 'reponame'],
};

const user = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    id: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string' },
    avatarUrl: { type: 'string' },
    bio: { type: 'string' },
    createdAt: timestamp,
    updatedAt: timestamp,
  },
};

const authUser = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    username: { type: 'string' },
    email: { type: 'string' },
    token: { type: 'string' },
  },
  required: ['_id', 'username', 'email', 'token'],
};

const repository = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    name: { type: 'string' },
    owner: {},
    description: { type: ['string', 'null'] },
    visibility: { type: 'string', enum: ['public', 'private'] },
    stars: { type: 'array' },
    forks: { type: 'array' },
    defaultBranch: { type: 'string' },
    language: { type: 'string' },
    topics: { type: 'array', items: { type: 'string' } },
  },
};

const activity = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    actor: {},
    type: { type: 'string' },
    repository: {},
    metadata: { type: 'object', additionalProperties: true },
    visibility: { type: 'string' },
    createdAt: timestamp,
  },
};

const diffFile = {
  type: 'object',
  additionalProperties: false,
  properties: {
    file: { type: 'string' },
    chunks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', enum: ['context', 'added', 'removed'] },
          line: { type: 'integer', minimum: 1 },
          content: { type: 'string' },
        },
        required: ['type', 'line', 'content'],
      },
    },
  },
  required: ['file', 'chunks'],
};

const pullRequestComment = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    author: {},
    body: { type: 'string' },
    type: { type: 'string', enum: ['general', 'review'] },
    createdAt: timestamp,
  },
  required: ['body'],
};

const review = {
  type: 'object',
  additionalProperties: true,
  properties: {
    author: {},
    status: { type: 'string', enum: ['approved', 'changes_requested', 'commented'] },
    comment: { type: 'string' },
    createdAt: timestamp,
  },
  required: ['status'],
};

const pullRequest = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    id: { type: 'string' },
    number: { type: 'integer', minimum: 1 },
    title: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['open', 'closed', 'merged'] },
    author: {},
    repository: {},
    sourceBranch: { type: 'string' },
    targetBranch: { type: 'string' },
    fromBranch: { type: 'string' },
    toBranch: { type: 'string' },
    comments: { oneOf: [{ type: 'integer' }, { type: 'array', items: pullRequestComment }] },
    reviews: { type: 'array', items: review },
    diff: { type: 'array', items: diffFile },
    createdAt: timestamp,
  },
  required: ['title', 'status', 'sourceBranch', 'targetBranch'],
};

export const components = {
  schemas: {
    SuccessEnvelope: successEnvelope({}),
    ErrorEnvelope: errorEnvelope,
    ValidationError: validationError,
    Pagination: pagination,
    User: user,
    AuthUser: authUser,
    Repository: repository,
    Activity: activity,
    PullRequest: pullRequest,
    PullRequestComment: pullRequestComment,
    PullRequestReview: review,
    DiffFile: diffFile,
  },
  securitySchemes: {
    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
  },
};

export const sharedSchemas = {
  timestamp,
  validationError,
  pagination,
  successEnvelope,
  errorEnvelope,
  paginationQuery,
  usernameParam,
  repoParam,
  user,
  authUser,
  repository,
  activity,
  pullRequest,
  pullRequestComment,
  diffFile,
  review,
};

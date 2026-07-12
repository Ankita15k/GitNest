import swaggerJSDoc from 'swagger-jsdoc';
import { components, contracts } from '../contracts/index.js';

const json = (schema) => ({ content: { 'application/json': { schema } } });
const errors = {
  400: { description: 'Validation error', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
  401: { description: 'Authentication error', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
  403: { description: 'Forbidden', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
  404: { description: 'Not found', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
  422: { description: 'Unprocessable entity', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
  500: { description: 'Server error', ...json({ $ref: '#/components/schemas/ErrorEnvelope' }) },
};

const params = (schema = {}) => [
  ...Object.keys(schema.properties || {}).map((name) => ({
    name,
    in: 'path',
    required: (schema.required || []).includes(name),
    schema: schema.properties[name],
  })),
];

const query = (schema = {}) =>
  Object.keys(schema.properties || {}).map((name) => ({
    name,
    in: 'query',
    required: (schema.required || []).includes(name),
    schema: schema.properties[name],
  }));

const op = (contract) => ({
  tags: contract.tags,
  summary: contract.summary,
  security: contract.security,
  parameters: [...params(contract.request?.params), ...query(contract.request?.query)],
  requestBody: contract.request?.body ? { required: true, ...json(contract.request.body) } : undefined,
  responses: {
    ...Object.fromEntries(
      Object.entries(contract.responses || {}).map(([status, schema]) => [
        status,
        { description: `${status} response`, ...json(schema) },
      ])
    ),
    ...errors,
  },
});

// Inline op builder for routes that have no contract in index.js
const simpleOp = ({ tags, summary, security, pathParams = [], queryParams = [], body, responses = {} }) => ({
  tags,
  summary,
  security,
  parameters: [
    ...pathParams.map(({ name, description, schema }) => ({ name, in: 'path', required: true, description, schema })),
    ...queryParams.map(({ name, required = false, description, schema }) => ({ name, in: 'query', required, description, schema })),
  ],
  requestBody: body ? { required: true, ...json(body) } : undefined,
  responses: {
    ...Object.fromEntries(
      Object.entries(responses).map(([status, description]) => [status, { description }])
    ),
    ...errors,
  },
});

const repoPathParams = [
  { name: 'username', description: 'Repository owner username', schema: { type: 'string' } },
  { name: 'repoName', description: 'Repository name', schema: { type: 'string' } },
];

const paths = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  '/api/v1/auth/register': { post: op(contracts.auth.register) },
  '/api/v1/auth/login': { post: op(contracts.auth.login) },
  '/api/v1/auth/me': { get: op(contracts.auth.me) },
  '/api/v1/auth/forgot-password': { post: op(contracts.auth.forgotPassword) },
  '/api/v1/auth/reset-password/{token}': { post: op(contracts.auth.resetPassword) },

  // ── GitHub OAuth ─────────────────────────────────────────────────────────────
  '/api/v1/auth/github': {
    get: simpleOp({
      tags: ['Auth'],
      summary: 'Initiate GitHub OAuth flow',
      responses: { 302: 'Redirects to GitHub authorization page' },
    }),
  },
  '/api/v1/auth/github/callback': {
    get: simpleOp({
      tags: ['Auth'],
      summary: 'GitHub OAuth callback — exchanges code for session and redirects with opaque code',
      responses: { 302: 'Redirects to frontend /oauth-success?code=<opaque_code>' },
    }),
  },
  '/api/v1/auth/exchange': {
    post: simpleOp({
      tags: ['Auth'],
      summary: 'Exchange opaque OAuth code for JWT',
      body: {
        type: 'object',
        required: ['code'],
        properties: { code: { type: 'string', description: '64-character hex code from OAuth callback' } },
      },
      responses: {
        200: 'JWT token returned',
        400: 'Missing or malformed code',
        401: 'Invalid or expired code',
        429: 'Rate limit exceeded',
      },
    }),
  },

  // ── Users ────────────────────────────────────────────────────────────────────
  '/api/v1/users/{username}': { get: op(contracts.users.profile) },
  '/api/v1/users/profile': { put: op(contracts.users.updateProfile) },
  '/api/v1/users/{username}/follow': { post: op(contracts.users.follow), delete: op(contracts.users.unfollow) },
  '/api/v1/users/{username}/followers': { get: op(contracts.users.followers) },
  '/api/v1/users/{username}/following': { get: op(contracts.users.following) },

  // ── Repositories ─────────────────────────────────────────────────────────────
  '/api/v1/repositories': { post: op(contracts.repositories.create) },
  '/api/v1/repositories/{username}': { get: op(contracts.repositories.listByUser) },
  '/api/v1/repositories/{username}/{reponame}': {
    get: op(contracts.repositories.get),
    put: op(contracts.repositories.update),
    delete: op(contracts.repositories.remove),
  },
  '/api/v1/repositories/{username}/{reponame}/star': { post: op(contracts.repositories.star) },
  '/api/v1/repositories/{username}/{reponame}/fork': { post: op(contracts.repositories.fork) },

  // ── Branch Protection ────────────────────────────────────────────────────────
  '/api/v1/repos/{username}/{reponame}/settings/branch-protection': {
    get: op(contracts.branchProtection.list),
    post: op(contracts.branchProtection.create),
  },
  '/api/v1/repos/{username}/{reponame}/settings/branch-protection/{ruleId}': {
    put: op(contracts.branchProtection.update),
    delete: op(contracts.branchProtection.remove),
  },

  // ── Audit Logs ───────────────────────────────────────────────────────────────
  '/api/v1/repos/{username}/{reponame}/audit-logs': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'Get audit logs for a repository',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', description: 'Repository owner username', schema: { type: 'string' } },
        { name: 'reponame', description: 'Repository name', schema: { type: 'string' } },
      ],
      queryParams: [
        { name: 'page', description: 'Page number', schema: { type: 'integer', minimum: 1 } },
        { name: 'limit', description: 'Items per page', schema: { type: 'integer', minimum: 1, maximum: 50 } },
      ],
      responses: { 200: 'List of audit log entries' },
    }),
  },

  // ── Activities ───────────────────────────────────────────────────────────────
  '/api/v1/activities/global': { get: op(contracts.activities.global) },
  '/api/v1/activities/user/{username}': { get: op(contracts.activities.user) },
  '/api/v1/activities/repository/{repo}': { get: op(contracts.activities.repository) },

  // ── Pull Requests ────────────────────────────────────────────────────────────
  '/api/v1/pull-requests': { get: op(contracts.pullRequests.list), post: op(contracts.pullRequests.create) },
  '/api/v1/pull-requests/{id}': { get: op(contracts.pullRequests.detail), put: op(contracts.pullRequests.update) },
  '/api/v1/pull-requests/{id}/merge': { post: op(contracts.pullRequests.merge) },
  '/api/v1/pull-requests/{id}/close': { post: op(contracts.pullRequests.close) },
  '/api/v1/pull-requests/{id}/comments': { post: op(contracts.pullRequests.comment) },
  '/api/v1/pull-requests/{id}/reviews': { post: op(contracts.pullRequests.review) },

  // ── Commit History ───────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{repoName}/commits': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'Get commit history for a repository',
      pathParams: repoPathParams,
      queryParams: [
        { name: 'branch', description: 'Branch name', schema: { type: 'string' } },
        { name: 'page', description: 'Page number', schema: { type: 'integer', minimum: 1 } },
        { name: 'limit', description: 'Items per page', schema: { type: 'integer', minimum: 1, maximum: 50 } },
      ],
      responses: { 200: 'Paginated list of commits' },
    }),
  },

  // ── File Browser ─────────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{repoName}/tree': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'Get repository file/directory tree',
      pathParams: repoPathParams,
      queryParams: [
        { name: 'branch', description: 'Branch name (defaults to default branch)', schema: { type: 'string' } },
        { name: 'path', description: 'Path within the repository', schema: { type: 'string' } },
      ],
      responses: { 200: 'Directory tree structure' },
    }),
  },
  '/api/v1/repositories/{username}/{repoName}/files': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'Get file content from a repository',
      pathParams: repoPathParams,
      queryParams: [
        { name: 'branch', description: 'Branch name (defaults to default branch)', schema: { type: 'string' } },
        { name: 'path', description: 'File path within the repository', schema: { type: 'string' } },
      ],
      responses: { 200: 'File content and metadata' },
    }),
  },

  // ── Branches ─────────────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{repoName}/branches': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'List branches for a repository',
      pathParams: repoPathParams,
      responses: { 200: 'List of branches' },
    }),
    post: simpleOp({
      tags: ['Repositories'],
      summary: 'Create a new branch',
      security: [{ bearerAuth: [] }],
      pathParams: repoPathParams,
      body: {
        type: 'object',
        required: ['branchName'],
        properties: {
          branchName: { type: 'string', description: 'Name of the new branch' },
          sourceBranch: { type: 'string', description: 'Branch to create from (defaults to default branch)' },
        },
      },
      responses: { 201: 'Branch created successfully' },
    }),
  },
  '/api/v1/repositories/{username}/{repoName}/branches/checkout': {
    post: simpleOp({
      tags: ['Repositories'],
      summary: 'Checkout (switch to) a branch',
      security: [{ bearerAuth: [] }],
      pathParams: repoPathParams,
      body: {
        type: 'object',
        required: ['branchName'],
        properties: { branchName: { type: 'string', description: 'Branch to checkout' } },
      },
      responses: { 200: 'Branch checked out successfully' },
    }),
  },
  '/api/v1/repositories/{username}/{repoName}/branches/{branchName}': {
    delete: simpleOp({
      tags: ['Repositories'],
      summary: 'Delete a branch',
      security: [{ bearerAuth: [] }],
      pathParams: [
        ...repoPathParams,
        { name: 'branchName', description: 'Name of the branch to delete', schema: { type: 'string' } },
      ],
      responses: { 200: 'Branch deleted successfully' },
    }),
  },

  // ── Git Operations ───────────────────────────────────────────────────────────
  '/api/v1/repos/{username}/{reponame}/init': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Initialize a repository',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      responses: { 200: 'Repository initialized' },
    }),
  },
  '/api/v1/repos/{username}/{reponame}/add': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Stage files for commit',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      body: {
        type: 'object',
        properties: { files: { type: 'array', items: { type: 'object', additionalProperties: true } } },
      },
      responses: { 200: 'Files staged successfully' },
    }),
  },
  '/api/v1/repos/{username}/{reponame}/commit': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Create a commit',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      body: {
        type: 'object',
        required: ['message'],
        properties: { message: { type: 'string', description: 'Commit message' } },
      },
      responses: { 200: 'Commit created successfully' },
    }),
  },
  '/api/v1/repos/{username}/{reponame}/push': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Push commits to remote',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      responses: { 200: 'Push successful' },
    }),
  },
  '/api/v1/repos/{username}/{reponame}/pull': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Pull latest changes',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      responses: { 200: 'Pull successful' },
    }),
  },
  '/api/v1/repos/{username}/{reponame}/revert': {
    post: simpleOp({
      tags: ['Git'],
      summary: 'Revert a commit',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'username', schema: { type: 'string' } },
        { name: 'reponame', schema: { type: 'string' } },
      ],
      body: {
        type: 'object',
        required: ['commitHash'],
        properties: { commitHash: { type: 'string', description: 'Hash of the commit to revert' } },
      },
      responses: { 200: 'Commit reverted successfully' },
    }),
  },

  // ── Merge ────────────────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{repoName}/merge': {
    post: simpleOp({
      tags: ['Repositories'],
      summary: 'Merge two branches',
      security: [{ bearerAuth: [] }],
      pathParams: repoPathParams,
      body: {
        type: 'object',
        required: ['sourceBranch', 'targetBranch'],
        properties: {
          sourceBranch: { type: 'string', description: 'Branch to merge from' },
          targetBranch: { type: 'string', description: 'Branch to merge into' },
        },
      },
      responses: { 200: 'Branches merged successfully' },
    }),
  },

  // ── Search ───────────────────────────────────────────────────────────────────
  '/api/v1/search': { get: op(contracts.search.global) },

  // ── Clone ────────────────────────────────────────────────────────────────────
  '/api/v1/repositories/clone': {
    post: simpleOp({
      tags: ['Repositories'],
      summary: 'Clone an external repository into GitNest',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', description: 'URL of the external repository to clone' },
          name: { type: 'string', description: 'Name for the cloned repository (optional)' },
        },
      },
      responses: {
        200: 'Repository cloned successfully',
        429: 'Rate limit exceeded',
      },
    }),
  },

  // ── Archive ──────────────────────────────────────────────────────────────────
  '/api/v1/repositories/{repoName}/archive': {
    get: simpleOp({
      tags: ['Repositories'],
      summary: 'Download a repository as an archive',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'repoName', description: 'Repository name', schema: { type: 'string' } },
      ],
      queryParams: [
        { name: 'format', description: 'Archive format (zip or tar.gz)', schema: { type: 'string', enum: ['zip', 'tar.gz'] } },
        { name: 'branch', description: 'Branch to archive (defaults to default branch)', schema: { type: 'string' } },
      ],
      responses: { 200: 'Archive file download' },
    }),
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  '/api/v1/notifications': {
    get: simpleOp({
      tags: ['Notifications'],
      summary: 'Get notifications for the authenticated user',
      security: [{ bearerAuth: [] }],
      queryParams: [
        { name: 'page', description: 'Page number', schema: { type: 'integer', minimum: 1 } },
        { name: 'limit', description: 'Items per page', schema: { type: 'integer', minimum: 1, maximum: 50 } },
      ],
      responses: { 200: 'List of notifications' },
    }),
  },
  '/api/v1/notifications/unread-count': {
    get: simpleOp({
      tags: ['Notifications'],
      summary: 'Get count of unread notifications',
      security: [{ bearerAuth: [] }],
      responses: { 200: 'Unread notification count' },
    }),
  },
  '/api/v1/notifications/read-all': {
    patch: simpleOp({
      tags: ['Notifications'],
      summary: 'Mark all notifications as read',
      security: [{ bearerAuth: [] }],
      responses: { 200: 'All notifications marked as read' },
    }),
  },
  '/api/v1/notifications/{id}/read': {
    patch: simpleOp({
      tags: ['Notifications'],
      summary: 'Mark a single notification as read',
      security: [{ bearerAuth: [] }],
      pathParams: [
        { name: 'id', description: 'Notification ID', schema: { type: 'string' } },
      ],
      responses: { 200: 'Notification marked as read' },
    }),
  },

  // ── Security ─────────────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{reponame}/security/scan': { post: op(contracts.security.scan) },
  '/api/v1/repositories/{username}/{reponame}/security/status/{scanId}': { get: op(contracts.security.status) },
  '/api/v1/repositories/{username}/{reponame}/security/events': { get: op(contracts.security.events) },

  // ── Code Intelligence ────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{reponame}/index': { post: op(contracts.codeIntelligence.triggerIndex) },
  '/api/v1/repositories/{username}/{reponame}/index/status/{indexId}': { get: op(contracts.codeIntelligence.indexStatus) },
  '/api/v1/repositories/{username}/{reponame}/symbols/search': { get: op(contracts.codeIntelligence.searchSymbols) },
  '/api/v1/repositories/{username}/{reponame}/symbols/{symbolId}': { get: op(contracts.codeIntelligence.symbolDetails) },
  '/api/v1/repositories/{username}/{reponame}/dependencies/rebuild': { post: op(contracts.codeIntelligence.rebuildDependencies) },
  '/api/v1/repositories/{username}/{reponame}/dependencies': { get: op(contracts.codeIntelligence.listDependencies) },
  '/api/v1/repositories/{username}/{reponame}/dependencies/impact': { get: op(contracts.codeIntelligence.dependencyImpact) },
  '/api/v1/repositories/{username}/{reponame}/dependencies/symbol/{symbolName}': { get: op(contracts.codeIntelligence.symbolDependencies) },

  // ── Architecture ─────────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{reponame}/architecture': { get: op(contracts.architecture.get) },
  '/api/v1/repositories/{username}/{reponame}/architecture/hotspots': { get: op(contracts.architecture.hotspots) },
  '/api/v1/repositories/{username}/{reponame}/architecture/risk': { get: op(contracts.architecture.risk) },
  '/api/v1/repositories/{username}/{reponame}/architecture/module/{moduleName}': { get: op(contracts.architecture.module) },

  // ── Repository Health ────────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{reponame}/health': { get: op(contracts.repositoryHealth.get) },
  '/api/v1/repositories/{username}/{reponame}/health/history': { get: op(contracts.repositoryHealth.history) },
  '/api/v1/repositories/{username}/{reponame}/health/breakdown': { get: op(contracts.repositoryHealth.breakdown) },
  '/api/v1/repositories/{username}/{reponame}/health/recommendations': { get: op(contracts.repositoryHealth.recommendations) },

  // ── Repository Compliance ────────────────────────────────────────────────────
  '/api/v1/repositories/{username}/{reponame}/compliance': { get: op(contracts.repositoryCompliance.get) },
  '/api/v1/repositories/{username}/{reponame}/compliance/history': { get: op(contracts.repositoryCompliance.history) },
  '/api/v1/repositories/{username}/{reponame}/compliance/violations': { get: op(contracts.repositoryCompliance.violations) },
  '/api/v1/repositories/{username}/{reponame}/compliance/report': { get: op(contracts.repositoryCompliance.report) },

  // ── Health Check ─────────────────────────────────────────────────────────────
  '/health': {
    get: simpleOp({
      tags: ['System'],
      summary: 'Server health check — returns status of database and cache',
      responses: {
        200: 'Server is healthy',
        503: 'Server is degraded (database disconnected)',
      },
    }),
  },
};

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'GitNest API',
    version: process.env.API_VERSION || '1.0.0',
    description: 'Schema-driven API contract for GitNest MERN services.',
  },
  servers: [{ url: process.env.API_PUBLIC_URL || 'http://localhost:5000' }],
  tags: [
    'Auth',
    'Users',
    'Repositories',
    'Activities',
    'Pull Requests',
    'Git',
    'Notifications',
    'Security',
    'Search',
    'Code Intelligence',
    'Architecture',
    'Repository Health',
    'Repository Compliance',
    'System',
  ].map((name) => ({ name })),
  components,
  paths,
};

const swaggerSpec = { ...swaggerJSDoc({ definition, apis: [] }), paths, components };

export { swaggerSpec };
export default swaggerSpec;

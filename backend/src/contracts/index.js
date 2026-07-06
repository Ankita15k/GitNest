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

const forgotPasswordBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
  },
  required: ['email'],
};

const resetPasswordBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    password: { type: 'string', minLength: 6 },
  },
  required: ['password'],
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

const branchProtectionRule = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    id: { type: 'string' },
    repositoryId: { type: 'string' },
    branchPattern: { type: 'string' },
    requirePullRequest: { type: 'boolean' },
    requiredApprovalsCount: { type: 'integer', minimum: 0 },
    requireStatusChecks: { type: 'boolean' },
    createdAt: sharedSchemas.timestamp,
    updatedAt: sharedSchemas.timestamp,
  },
  required: ['branchPattern'],
};

const branchProtectionRuleList = {
  type: 'array',
  items: branchProtectionRule,
};

const branchProtectionCreateBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    branchPattern: { type: 'string', minLength: 1, maxLength: 100 },
    requirePullRequest: { type: 'boolean' },
    requiredApprovalsCount: { type: 'integer', minimum: 0, maximum: 10 },
    requireStatusChecks: { type: 'boolean' },
  },
  required: ['branchPattern'],
};

const branchProtectionUpdateBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    branchPattern: { type: 'string', minLength: 1, maxLength: 100 },
    requirePullRequest: { type: 'boolean' },
    requiredApprovalsCount: { type: 'integer', minimum: 0, maximum: 10 },
    requireStatusChecks: { type: 'boolean' },
  },
  minProperties: 1,
};

const branchProtectionRuleIdParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
    ruleId: { type: 'string', minLength: 1 },
  },
  required: ['username', 'reponame', 'ruleId'],
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

const searchQuery = {
  type: 'object',
  additionalProperties: true,
  properties: {
    q: { type: 'string', minLength: 2, maxLength: 100 },
    type: { type: 'string', enum: ['users', 'repositories', 'pullRequests', 'all'] },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
  required: ['q'],
};

const indexStatusParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
    indexId: { type: 'string', minLength: 1 },
  },
  required: ['username', 'reponame', 'indexId'],
};

const symbolSearchQuery = {
  type: 'object',
  additionalProperties: true,
  properties: {
    q: { type: 'string', minLength: 1, maxLength: 100 },
    symbolType: { type: 'string', enum: ['function', 'class', 'export', 'import', 'route'] },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
  required: ['q'],
};

const symbolDetailParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
    symbolId: { type: 'string', minLength: 1 },
  },
  required: ['username', 'reponame', 'symbolId'],
};

const symbolSearchData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    symbols: { type: 'array', items: sharedSchemas.indexedSymbol },
    pagination: sharedSchemas.pagination,
  },
  required: ['symbols', 'pagination'],
};

const dependencyListQuery = {
  type: 'object',
  additionalProperties: true,
  properties: {
    dependencyType: { type: 'string', minLength: 1, maxLength: 50 },
    file: { type: 'string', minLength: 1, maxLength: 300 },
    symbol: { type: 'string', minLength: 1, maxLength: 100 },
    page: { type: 'integer', minimum: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 50 },
  },
};

const dependencyImpactQuery = {
  type: 'object',
  additionalProperties: true,
  properties: {
    file: { type: 'string', minLength: 1, maxLength: 300 },
    symbol: { type: 'string', minLength: 1, maxLength: 100 },
    depth: { type: 'integer', minimum: 1, maximum: 10 },
  },
  anyOf: [{ required: ['file'] }, { required: ['symbol'] }],
};

const symbolNameParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
    symbolName: { type: 'string', minLength: 1, maxLength: 100 },
  },
  required: ['username', 'reponame', 'symbolName'],
};

const dependencyListData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    dependencies: { type: 'array', items: sharedSchemas.dependencyGraph },
    pagination: sharedSchemas.pagination,
  },
  required: ['dependencies', 'pagination'],
};

const dependencyImpactData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    seed: {
      type: 'object',
      additionalProperties: false,
      properties: {
        file: { type: ['string', 'null'] },
        symbol: { type: ['string', 'null'] },
      },
      required: ['file', 'symbol'],
    },
    directDependencies: { type: 'array', items: sharedSchemas.dependencyGraph },
    directDependents: { type: 'array', items: sharedSchemas.dependencyGraph },
    affectedSymbols: { type: 'array', items: { type: 'string' } },
    affectedFiles: { type: 'array', items: { type: 'string' } },
    depthSummary: { type: 'object', additionalProperties: { type: 'integer', minimum: 0 } },
  },
  required: ['seed', 'directDependencies', 'directDependents', 'affectedSymbols', 'affectedFiles', 'depthSummary'],
};

const symbolDependenciesData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    symbolName: { type: 'string' },
    dependencies: { type: 'array', items: sharedSchemas.dependencyGraph },
    dependents: { type: 'array', items: sharedSchemas.dependencyGraph },
  },
  required: ['symbolName', 'dependencies', 'dependents'],
};

const architectureModuleParam = {
  type: 'object',
  additionalProperties: true,
  properties: {
    username: { type: 'string', minLength: 1, maxLength: 39 },
    reponame: { type: 'string', minLength: 1, maxLength: 100 },
    moduleName: { type: 'string', minLength: 1, maxLength: 300 },
  },
  required: ['username', 'reponame', 'moduleName'],
};

const architectureHotspotsData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    hotspots: { type: 'array', items: sharedSchemas.architectureHotspot },
  },
  required: ['hotspots'],
};

const architectureRiskData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    riskScore: sharedSchemas.riskScore,
    complexityScore: { type: 'number', minimum: 0 },
    circularDependencyCount: { type: 'integer', minimum: 0 },
    criticalModuleCount: { type: 'integer', minimum: 0 },
  },
  required: ['riskScore', 'complexityScore', 'circularDependencyCount', 'criticalModuleCount'],
};

const architectureModuleData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    module: sharedSchemas.architectureModule,
    relationships: { type: 'array', items: { type: 'object', additionalProperties: true } },
    hotspots: { type: 'array', items: sharedSchemas.architectureHotspot },
  },
  required: ['module', 'relationships', 'hotspots'],
};

const repositoryHealthHistoryData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    history: { type: 'array', items: sharedSchemas.repositoryHealth },
  },
  required: ['history'],
};

const repositoryHealthRecommendationsData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    recommendations: { type: 'array', items: sharedSchemas.repositoryHealthRecommendation },
  },
  required: ['recommendations'],
};

const repositoryComplianceHistoryData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    history: { type: 'array', items: sharedSchemas.repositoryCompliance },
  },
  required: ['history'],
};

const repositoryComplianceViolationsData = {
  type: 'object',
  additionalProperties: false,
  properties: {
    violations: { type: 'array', items: sharedSchemas.complianceCheck },
  },
  required: ['violations'],
};

export const contracts = {
  auth: {
    register: { tags: ['Auth'], summary: 'Register a user', request: { body: registerBody }, responses: { 201: sharedSchemas.successEnvelope(sharedSchemas.authUser) } },
    login: { tags: ['Auth'], summary: 'Log in a user', request: { body: loginBody }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.authUser) } },
    me: { tags: ['Auth'], summary: 'Fetch current user', security: [{ bearerAuth: [] }], responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.user) } },
    forgotPassword: { tags: ['Auth'], summary: 'Request a password reset', request: { body: forgotPasswordBody }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    resetPassword: { tags: ['Auth'], summary: 'Reset password with token', request: { body: resetPasswordBody, params: { type: 'object', additionalProperties: true, properties: { token: { type: 'string', minLength: 1 } }, required: ['token'] } }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.authUser) } },
  },
  git: {
    initializeRepository: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 201: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    addFiles: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: { type: 'object', additionalProperties: false, properties: { files: { type: 'array', items: { type: 'string' } } } } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    commitChanges: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: { type: 'object', additionalProperties: false, properties: { message: { type: 'string', minLength: 1 } }, required: ['message'] } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    pushRepository: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: { type: 'object', additionalProperties: false, properties: { branch: { type: 'string' } } } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    pullRepository: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: { type: 'object', additionalProperties: false, properties: { branch: { type: 'string' } } } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    revertCommit: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, body: { type: 'object', additionalProperties: false, properties: { commitHash: { type: 'string', minLength: 1 } }, required: ['commitHash'] } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    diff: { tags: ['Git'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, query: { type: 'object', additionalProperties: false, properties: { base: { type: 'string' }, head: { type: 'string' }, file: { type: 'string' } } } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
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
  branchProtection: {
    list: {
      tags: ['Repositories'],
      security: [{ bearerAuth: [] }],
      request: { params: sharedSchemas.repoParam },
      responses: { 200: branchProtectionRuleList },
    },
    create: {
      tags: ['Repositories'],
      security: [{ bearerAuth: [] }],
      request: { params: sharedSchemas.repoParam, body: branchProtectionCreateBody },
      responses: { 201: branchProtectionRule },
    },
    update: {
      tags: ['Repositories'],
      security: [{ bearerAuth: [] }],
      request: { params: branchProtectionRuleIdParam, body: branchProtectionUpdateBody },
      responses: { 200: branchProtectionRule },
    },
    remove: {
      tags: ['Repositories'],
      security: [{ bearerAuth: [] }],
      request: { params: branchProtectionRuleIdParam },
      responses: { 200: { type: 'object', additionalProperties: false, properties: { deleted: { type: 'boolean' } }, required: ['deleted'] } },
    },
  },
  security: {
    scan: { tags: ['Security'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 202: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    status: { tags: ['Security'], security: [{ bearerAuth: [] }], request: { params: { type: 'object', additionalProperties: true, properties: { username: { type: 'string', minLength: 1, maxLength: 39 }, reponame: { type: 'string', minLength: 1, maxLength: 100 }, scanId: { type: 'string', minLength: 1 } }, required: ['username', 'reponame', 'scanId'] } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    events: { tags: ['Security'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, query: { type: 'object', additionalProperties: true, properties: { page: { type: 'integer', minimum: 1 }, limit: { type: 'integer', minimum: 1, maximum: 50 }, severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }, type: { type: 'string', enum: ['SECRET_EXPOSED', 'VULNERABLE_DEPENDENCY', 'VERSION_MISMATCH', 'SUSPICIOUS_FILE'] }, scanId: { type: 'string' } } } }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
  },
  search: {
    global: { tags: ['Search'], request: { query: searchQuery }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
  },
  codeIntelligence: {
    triggerIndex: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 202: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    indexStatus: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: indexStatusParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: true }) } },
    searchSymbols: { tags: ['Code Intelligence'], request: { params: sharedSchemas.repoParam, query: symbolSearchQuery }, responses: { 200: sharedSchemas.successEnvelope(symbolSearchData) } },
    symbolDetails: { tags: ['Code Intelligence'], request: { params: symbolDetailParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.indexedSymbol) } },
    rebuildDependencies: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope({ type: 'object', additionalProperties: false, properties: { edgeCount: { type: 'integer', minimum: 0 } }, required: ['edgeCount'] }) } },
    listDependencies: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, query: dependencyListQuery }, responses: { 200: sharedSchemas.successEnvelope(dependencyListData) } },
    dependencyImpact: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam, query: dependencyImpactQuery }, responses: { 200: sharedSchemas.successEnvelope(dependencyImpactData) } },
    symbolDependencies: { tags: ['Code Intelligence'], security: [{ bearerAuth: [] }], request: { params: symbolNameParam }, responses: { 200: sharedSchemas.successEnvelope(symbolDependenciesData) } },
  },
  architecture: {
    get: { tags: ['Architecture'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.architectureAnalysis) } },
    hotspots: { tags: ['Architecture'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(architectureHotspotsData) } },
    risk: { tags: ['Architecture'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(architectureRiskData) } },
    module: { tags: ['Architecture'], security: [{ bearerAuth: [] }], request: { params: architectureModuleParam }, responses: { 200: sharedSchemas.successEnvelope(architectureModuleData) } },
  },
  repositoryHealth: {
    get: { tags: ['Repository Health'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repositoryHealth) } },
    history: { tags: ['Repository Health'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(repositoryHealthHistoryData) } },
    breakdown: { tags: ['Repository Health'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repositoryHealthBreakdown) } },
    recommendations: { tags: ['Repository Health'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(repositoryHealthRecommendationsData) } },
  },
  repositoryCompliance: {
    get: { tags: ['Repository Compliance'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repositoryCompliance) } },
    history: { tags: ['Repository Compliance'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(repositoryComplianceHistoryData) } },
    violations: { tags: ['Repository Compliance'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(repositoryComplianceViolationsData) } },
    report: { tags: ['Repository Compliance'], security: [{ bearerAuth: [] }], request: { params: sharedSchemas.repoParam }, responses: { 200: sharedSchemas.successEnvelope(sharedSchemas.repositoryComplianceReport) } },
  },
};

export { components, sharedSchemas };

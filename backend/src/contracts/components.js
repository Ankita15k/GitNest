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

const indexedSymbol = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    repositoryId: { type: 'string' },
    repositoryName: { type: 'string' },
    owner: { type: 'string' },
    filePath: { type: 'string' },
    symbolName: { type: 'string' },
    symbolType: { type: 'string', enum: ['function', 'class', 'export', 'import', 'route'] },
    line: { type: 'integer', minimum: 1 },
    exportName: { type: ['string', 'null'] },
    metadata: { type: 'object', additionalProperties: true },
    indexedAt: timestamp,
  },
  required: ['repositoryId', 'repositoryName', 'owner', 'filePath', 'symbolName', 'symbolType', 'line'],
};

const dependencyGraph = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    repositoryId: { type: 'string' },
    filePath: { type: 'string' },
    sourceSymbol: { type: 'string' },
    sourceType: { type: 'string' },
    targetSymbol: { type: 'string' },
    targetType: { type: 'string' },
    dependencyType: { type: 'string' },
    metadata: { type: 'object', additionalProperties: true },
    createdAt: timestamp,
  },
  required: ['repositoryId', 'filePath', 'sourceSymbol', 'sourceType', 'targetSymbol', 'targetType', 'dependencyType'],
};

const riskScore = { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] };

const architectureHotspot = {
  type: 'object',
  additionalProperties: true,
  properties: {
    moduleName: { type: 'string' },
    referenceCount: { type: 'integer', minimum: 0 },
    dependentFileCount: { type: 'integer', minimum: 0 },
    reasons: { type: 'array', items: { type: 'string' } },
  },
  required: ['moduleName', 'referenceCount', 'dependentFileCount', 'reasons'],
};

const architectureModule = {
  type: 'object',
  additionalProperties: true,
  properties: {
    moduleName: { type: 'string' },
    fileCount: { type: 'integer', minimum: 0 },
    symbolCount: { type: 'integer', minimum: 0 },
    dependencyCount: { type: 'integer', minimum: 0 },
    dependentCount: { type: 'integer', minimum: 0 },
    couplingLevel: { type: 'integer', minimum: 0 },
    riskScore,
  },
  required: ['moduleName', 'dependencyCount', 'dependentCount', 'riskScore'],
};

const architectureAnalysis = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    repositoryId: { type: 'string' },
    repositoryName: { type: 'string' },
    complexityScore: { type: 'number', minimum: 0 },
    riskScore,
    hotspotCount: { type: 'integer', minimum: 0 },
    circularDependencyCount: { type: 'integer', minimum: 0 },
    criticalModuleCount: { type: 'integer', minimum: 0 },
    summary: { type: 'string' },
    metrics: {
      type: 'object',
      additionalProperties: true,
      properties: {
        moduleCount: { type: 'integer', minimum: 0 },
        dependencyCount: { type: 'integer', minimum: 0 },
        dependencyDensity: { type: 'number', minimum: 0 },
        modules: { type: 'array', items: architectureModule },
        hotspots: { type: 'array', items: architectureHotspot },
        circularDependencies: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
      },
    },
    generatedAt: timestamp,
  },
  required: [
    'repositoryId',
    'repositoryName',
    'complexityScore',
    'riskScore',
    'hotspotCount',
    'circularDependencyCount',
    'criticalModuleCount',
    'summary',
    'metrics',
    'generatedAt',
  ],
};

const healthCategory = { type: 'string', enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'] };

const repositoryHealth = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    repositoryId: { type: 'string' },
    repositoryName: { type: 'string' },
    overallScore: { type: 'integer', minimum: 0, maximum: 100 },
    securityScore: { type: 'integer', minimum: 0, maximum: 100 },
    architectureScore: { type: 'integer', minimum: 0, maximum: 100 },
    activityScore: { type: 'integer', minimum: 0, maximum: 100 },
    maintainabilityScore: { type: 'integer', minimum: 0, maximum: 100 },
    healthCategory,
    summary: { type: 'string' },
    metrics: { type: 'object', additionalProperties: true },
    generatedAt: timestamp,
  },
  required: [
    'repositoryId',
    'repositoryName',
    'overallScore',
    'securityScore',
    'architectureScore',
    'activityScore',
    'maintainabilityScore',
    'healthCategory',
    'metrics',
    'generatedAt',
  ],
};

const repositoryHealthBreakdown = {
  type: 'object',
  additionalProperties: false,
  properties: {
    overallScore: { type: 'integer', minimum: 0, maximum: 100 },
    healthCategory,
    scores: {
      type: 'object',
      additionalProperties: false,
      properties: {
        security: { type: 'integer', minimum: 0, maximum: 100 },
        architecture: { type: 'integer', minimum: 0, maximum: 100 },
        activity: { type: 'integer', minimum: 0, maximum: 100 },
        maintainability: { type: 'integer', minimum: 0, maximum: 100 },
      },
      required: ['security', 'architecture', 'activity', 'maintainability'],
    },
    metrics: { type: 'object', additionalProperties: true },
    generatedAt: timestamp,
  },
  required: ['overallScore', 'healthCategory', 'scores', 'metrics', 'generatedAt'],
};

const repositoryHealthRecommendation = {
  type: 'object',
  additionalProperties: false,
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['code', 'message'],
};

const complianceStatus = { type: 'string', enum: ['COMPLIANT', 'WARNING', 'NON_COMPLIANT'] };
const complianceCheckStatus = { type: 'string', enum: ['PASS', 'WARNING', 'FAIL'] };

const complianceCheck = {
  type: 'object',
  additionalProperties: true,
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
    severity: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    value: {},
    threshold: {},
  },
  required: ['code', 'message', 'severity'],
};

const compliancePolicyResult = {
  type: 'object',
  additionalProperties: true,
  properties: {
    code: { type: 'string' },
    status: complianceCheckStatus,
    value: {},
    threshold: {},
    scoreImpact: { type: 'number', minimum: 0 },
  },
  required: ['code', 'status', 'scoreImpact'],
};

const repositoryCompliance = {
  type: 'object',
  additionalProperties: true,
  properties: {
    _id: { type: 'string' },
    repositoryId: { type: 'string' },
    repositoryName: { type: 'string' },
    complianceStatus,
    complianceScore: { type: 'integer', minimum: 0, maximum: 100 },
    violations: { type: 'array', items: complianceCheck },
    warnings: { type: 'array', items: complianceCheck },
    passedChecks: { type: 'array', items: complianceCheck },
    policyResults: { type: 'array', items: compliancePolicyResult },
    metrics: { type: 'object', additionalProperties: true },
    generatedAt: timestamp,
  },
  required: [
    'repositoryId',
    'repositoryName',
    'complianceStatus',
    'complianceScore',
    'violations',
    'warnings',
    'passedChecks',
    'policyResults',
    'metrics',
    'generatedAt',
  ],
};

const repositoryComplianceReport = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: {
      type: 'object',
      additionalProperties: false,
      properties: {
        repositoryName: { type: 'string' },
        complianceStatus,
        complianceScore: { type: 'integer', minimum: 0, maximum: 100 },
        generatedAt: timestamp,
        violationCount: { type: 'integer', minimum: 0 },
        warningCount: { type: 'integer', minimum: 0 },
        passedCheckCount: { type: 'integer', minimum: 0 },
      },
      required: [
        'repositoryName',
        'complianceStatus',
        'complianceScore',
        'generatedAt',
        'violationCount',
        'warningCount',
        'passedCheckCount',
      ],
    },
    violations: { type: 'array', items: complianceCheck },
    warnings: { type: 'array', items: complianceCheck },
    passedChecks: { type: 'array', items: complianceCheck },
    scoreBreakdown: { type: 'array', items: compliancePolicyResult },
    metrics: { type: 'object', additionalProperties: true },
  },
  required: ['summary', 'violations', 'warnings', 'passedChecks', 'scoreBreakdown', 'metrics'],
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
    IndexedSymbol: indexedSymbol,
    DependencyGraph: dependencyGraph,
    ArchitectureAnalysis: architectureAnalysis,
    ArchitectureHotspot: architectureHotspot,
    ArchitectureModule: architectureModule,
    RepositoryHealth: repositoryHealth,
    RepositoryHealthBreakdown: repositoryHealthBreakdown,
    RepositoryHealthRecommendation: repositoryHealthRecommendation,
    RepositoryCompliance: repositoryCompliance,
    RepositoryComplianceReport: repositoryComplianceReport,
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
  indexedSymbol,
  dependencyGraph,
  architectureAnalysis,
  architectureHotspot,
  architectureModule,
  healthCategory,
  repositoryHealth,
  repositoryHealthBreakdown,
  repositoryHealthRecommendation,
  complianceStatus,
  complianceCheck,
  compliancePolicyResult,
  repositoryCompliance,
  repositoryComplianceReport,
  riskScore,
};

import { body, param } from 'express-validator';

/**
 * Validates :username and :reponame route parameters on all routes that
 * address a specific repository. Rejects malformed or oversized values before
 * any controller logic or database query runs.
 */
export const repoParamValidator = [
    param('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 1, max: 39 }).withMessage('Username must be 1–39 characters')
        .matches(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/)
        .withMessage('Username contains invalid characters'),

    param('reponame')
        .trim()
        .notEmpty().withMessage('Repository name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Repository name must be 1–100 characters')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage('Repository name may only contain letters, numbers, hyphens, dots, and underscores'),
];

// Reserved names that must not be used as repository names.
const RESERVED_REPO_NAMES = new Set(['.', '..', '.git', '.gitignore', '.gitmodules']);

const validateTopics = (topics) => {
    if (!Array.isArray(topics)) return false;
    if (topics.length > 20) throw new Error('Topics must contain at most 20 entries');
    const invalid = topics.find((t) => typeof t !== 'string' || t.length > 35);
    if (invalid !== undefined) throw new Error('Each topic must be a string of at most 35 characters');
    return true;
};

export const createRepositoryValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Repository name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Repository name must be between 1 and 100 characters')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Repository name can only contain letters, numbers, hyphens and underscores')
        .custom((val) => !RESERVED_REPO_NAMES.has(val)).withMessage('That repository name is reserved'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    body('visibility')
        .optional()
        .isIn(['public', 'private']).withMessage('Visibility must be either public or private'),

    body('language')
        .optional()
        .trim()
        .isString().withMessage('Language must be a string')
        .isLength({ max: 50 }).withMessage('Language must be at most 50 characters'),

    body('topics')
        .optional()
        .custom(validateTopics),
];

export const updateRepositoryValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('Repository name must be between 1 and 100 characters')
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Repository name can only contain letters, numbers, hyphens and underscores')
        .custom((val) => !RESERVED_REPO_NAMES.has(val)).withMessage('That repository name is reserved'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),

    body('visibility')
        .optional()
        .isIn(['public', 'private']).withMessage('Visibility must be either public or private'),

    body('language')
        .optional()
        .trim()
        .isString().withMessage('Language must be a string')
        .isLength({ max: 50 }).withMessage('Language must be at most 50 characters'),

    body('topics')
        .optional()
        .custom(validateTopics),

    body('defaultBranch')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Default branch name must not exceed 100 characters'),
];
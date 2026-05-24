import { body, param } from 'express-validator';

/**
 * Validates :username and :reponame route parameters.
 * Applied to every route that addresses a specific repository so that malformed
 * or oversized values are rejected before any database query runs.
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

/**
 * Validates the request body for POST /repositories (create).
 * The schema enforces naming rules, caps description length, restricts
 * visibility to the two allowed values, and limits topic count and length.
 */
export const createRepositoryValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Repository name is required')
        .isLength({ min: 1, max: 100 }).withMessage('Repository name must be 1–100 characters')
        .matches(/^[a-zA-Z0-9._-]+$/)
        .withMessage('Repository name may only contain letters, numbers, hyphens, dots, and underscores'),

    body('description')
        .optional()
        .trim()
        .isString().withMessage('Description must be a string')
        .isLength({ max: 350 }).withMessage('Description must be at most 350 characters'),

    body('visibility')
        .optional()
        .isIn(['public', 'private']).withMessage('Visibility must be public or private'),

    body('language')
        .optional()
        .trim()
        .isString().withMessage('Language must be a string')
        .isLength({ max: 50 }).withMessage('Language must be at most 50 characters'),

    body('topics')
        .optional()
        .isArray({ max: 20 }).withMessage('Topics must be an array with at most 20 entries')
        .custom((topics) => topics.every((t) => typeof t === 'string' && t.length <= 35))
        .withMessage('Each topic must be a string of at most 35 characters'),
];

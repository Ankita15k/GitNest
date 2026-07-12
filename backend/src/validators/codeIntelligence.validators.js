import { param, query } from 'express-validator';
import { repoParamValidator } from './repository.validators.js';

export const indexIdValidator = [
  ...repoParamValidator,
  param('indexId')
    .trim()
    .notEmpty()
    .withMessage('Index ID is required')
    .isUUID()
    .withMessage('Index ID must be a valid UUID'),
];

export const symbolSearchValidator = [
  ...repoParamValidator,
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('symbolType')
    .optional()
    .isIn(['function', 'class', 'export', 'import', 'route'])
    .withMessage('Invalid symbol type'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const symbolDetailValidator = [
  ...repoParamValidator,
  param('symbolId')
    .trim()
    .notEmpty()
    .withMessage('Symbol ID is required')
    .isMongoId()
    .withMessage('Symbol ID must be a valid Mongo ID'),
];

export const dependencyListValidator = [
  ...repoParamValidator,
  query('dependencyType')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Dependency type must be between 1 and 50 characters'),
  query('file')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('File must be between 1 and 300 characters'),
  query('symbol')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Symbol must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];

export const dependencyImpactValidator = [
  ...repoParamValidator,
  query('file')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('File must be between 1 and 300 characters'),
  query('symbol')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Symbol must be between 1 and 100 characters'),
  query('depth')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Depth must be between 1 and 10'),
];

export const symbolNameValidator = [
  ...repoParamValidator,
  param('symbolName')
    .trim()
    .notEmpty()
    .withMessage('Symbol name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Symbol name must be between 1 and 100 characters'),
];

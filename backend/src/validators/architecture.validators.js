import { param } from 'express-validator';
import { repoParamValidator } from './repository.validators.js';

export const architectureRepoValidator = [...repoParamValidator];

export const architectureModuleValidator = [
  ...repoParamValidator,
  param('moduleName')
    .trim()
    .notEmpty()
    .withMessage('Module name is required')
    .isLength({ min: 1, max: 300 })
    .withMessage('Module name must be between 1 and 300 characters'),
];

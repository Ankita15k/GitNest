import { body, param } from 'express-validator';

export const mergeBranchesValidator = [
  param('username')
    .trim()
    .notEmpty(),

  param('repoName')
    .trim()
    .notEmpty(),

  body('sourceBranch')
    .trim()
    .notEmpty()
    .withMessage('Source branch is required'),

  body('targetBranch')
    .trim()
    .notEmpty()
    .withMessage('Target branch is required'),
];

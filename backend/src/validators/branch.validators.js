import { param, body } from 'express-validator';

const usernameValidator = param('username')
  .trim()
  .notEmpty().withMessage('Username is required')
  .isLength({ min: 1, max: 39 }).withMessage('Username must be between 1 and 39 characters')
  .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, hyphens and underscores');

const repoNameValidator = param('repoName')
  .trim()
  .notEmpty().withMessage('Repository name is required')
  .isLength({ min: 1, max: 100 }).withMessage('Repository name must be between 1 and 100 characters')
  .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Repository name can only contain letters, numbers, hyphens and underscores');

const branchNamePattern = /^[a-zA-Z0-9_\-./]+$/;

const branchNameValidator = (field) =>
  body(field)
    .trim()
    .notEmpty().withMessage('Branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage(
      'Branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'
    );

export const fetchBranchesValidator = [
  usernameValidator,
  repoNameValidator,
];

export const createBranchValidator = [
  usernameValidator,
  repoNameValidator,
  branchNameValidator('branchName'),
];

export const checkoutBranchValidator = [
  usernameValidator,
  repoNameValidator,
  branchNameValidator('branchName'),
];

export const renameBranchValidator = [
  usernameValidator,
  repoNameValidator,

  branchNameValidator('oldBranchName'),

  body('newBranchName')
    .trim()
    .notEmpty().withMessage('New branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('New branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage(
      'New branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'
    )
    .custom((value, { req }) => {
      if (value === req.body.oldBranchName) {
        throw new Error('New branch name must be different from the old branch name');
      }
      return true;
    }),
];

export const deleteBranchValidator = [
  usernameValidator,
  repoNameValidator,
  param('branchName')
    .trim()
    .notEmpty().withMessage('Branch name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Branch name must be between 1 and 100 characters')
    .matches(branchNamePattern).withMessage(
      'Branch name can only contain letters, numbers, hyphens, underscores, dots and slashes'
    ),
];

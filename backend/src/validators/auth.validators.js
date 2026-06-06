import { body } from 'express-validator';

const RESERVED_USERNAMES = [
  'login', 'register', 'dashboard', 'docs', 'pull-requests', 
  'activities', 'showcase', 'privacy', 'terms', 'user', 
  'users', 'api', 'auth', 'admin', 'settings'
];

export const registerValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .bail()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .bail()
    .custom((value) => {
      if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
        throw new Error('This username is reserved and cannot be used');
      }
      return true;
    }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .bail()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .bail()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .bail()
    .isEmail().withMessage('Email must be valid')
    .normalizeEmail(),
];

export const resetPasswordValidator = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .bail()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];
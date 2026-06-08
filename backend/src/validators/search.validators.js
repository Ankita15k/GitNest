import { query } from 'express-validator';

const rejectHtmlTags = (value) => {
  if (/<[a-z][\s\S]*>/i.test(value)) {
    throw new Error('HTML tags are not allowed');
  }
  return true;
};

const rejectNoSqlInjectionPatterns = (value) => {
  const injectionPatterns = [
    /\$where/i,
    /\$function/i,
    /\$regex/i,
    /\$or/i,
    /\$and/i,
    /\$nor/i,
    /\$not/i,
    /\$exists/i,
    /\$in/i,
    /\$nin/i,
    /\$gt/i,
    /\$gte/i,
    /\$lt/i,
    /\$lte/i,
    /\$eq/i,
    /\$ne/i,
    /\$elemMatch/i,
    /\$type/i,
    /\{.*\}/,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(value)) {
      throw new Error('Invalid search query. Operators and special patterns are not allowed');
    }
  }
  return true;
};

export const searchQueryValidator = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters')
    .custom(rejectHtmlTags)
    .custom(rejectNoSqlInjectionPatterns),
  query('type')
    .optional()
    .isIn(['users', 'repositories', 'pullRequests', 'all'])
    .withMessage('Type must be one of: users, repositories, pullRequests, or all'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
];
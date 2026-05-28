import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';
import ERROR_CODES from '../constants/errorCodes.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    const appError = new AppError('Validation failed', 400, ERROR_CODES.VALIDATION_ERROR);
    appError.errors = formattedErrors;
    return next(appError);
  }
  next();
};

export default validateRequest;

import { sendError } from '../utils/responseHandlers.js';
import { resolveErrorCode } from '../utils/resolveErrorCode.js';
import { devLog } from '../utils/devLogger.js';

const formatMongooseValidationErrors = (err) =>
  Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (err.code === 11000) {
    statusCode = 400;
    const keyValue = err.keyValue || {};
    const keys = Object.keys(keyValue);

    // For compound indexes, show the field that actually violates uniqueness
    // err.keyPattern contains the full compound index definition
    if (keys.length > 1 || !keys.length) {
      const keyPattern = err.keyPattern || {};
      const patternKeys = Object.keys(keyPattern);
      // Show the most specific field (non-objectid, non-owner fields first)
      const preferred = patternKeys.find(k => k !== 'owner' && k !== '_id') || keys[0] || 'field';
      message = `${preferred} already exists`;
      errors = [{ field: preferred, message }];
    } else {
      const field = keys[0] || 'field';
      message = `${field} already exists`;
      errors = [{ field, message }];
    }
  }

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = formatMongooseValidationErrors(err);
  }

  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
    errors = [];
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please log in again';
    errors = [];
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token, please log in again';
    errors = [];
  }

  if (!err.isOperational) {
    statusCode = 500;
    message = process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : message;
    errors = [];
  }

  const code = resolveErrorCode(err, statusCode);
  const requestId = req.requestId || res.locals?.requestId || null;

  devLog(`[${requestId}]`, code, statusCode, message);
  if (process.env.NODE_ENV === 'development' && err.stack) {
    devLog(err.stack);
  }

  sendError(res, {
    statusCode,
    code,
    message,
    errors,
    requestId,
  });
};

export default errorHandler;
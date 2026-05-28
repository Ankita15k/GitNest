import ERROR_CODES from '../constants/errorCodes.js';

/**
 * Maps thrown errors and HTTP status codes to centralized error codes.
 */
export const resolveErrorCode = (err, statusCode) => {
  if (err.code && Object.values(ERROR_CODES).includes(err.code)) {
    return err.code;
  }

  if (err.name === 'ValidationError' || (Array.isArray(err.errors) && err.errors.length > 0 && statusCode === 400)) {
    return ERROR_CODES.VALIDATION_ERROR;
  }

  if (err.code === 11000) {
    return ERROR_CODES.DATABASE_ERROR;
  }

  if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
    return ERROR_CODES.AUTH_ERROR;
  }

  if (err.name === 'CastError') {
    return ERROR_CODES.NOT_FOUND;
  }

  if (statusCode === 401 || statusCode === 403) {
    return ERROR_CODES.AUTH_ERROR;
  }

  if (statusCode === 404) {
    return ERROR_CODES.NOT_FOUND;
  }

  if (statusCode === 429) {
    return ERROR_CODES.RATE_LIMITED;
  }

  if (statusCode >= 500) {
    return ERROR_CODES.SERVER_ERROR;
  }

  if (statusCode >= 400) {
    return ERROR_CODES.VALIDATION_ERROR;
  }

  return ERROR_CODES.SERVER_ERROR;
};

export default resolveErrorCode;

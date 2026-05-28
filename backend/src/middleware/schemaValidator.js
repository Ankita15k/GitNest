import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AppError from '../utils/AppError.js';
import ERROR_CODES from '../constants/errorCodes.js';
import { sharedSchemas } from '../contracts/index.js';

const ajv = new Ajv({ allErrors: true, coerceTypes: true, strict: false });
addFormats(ajv);

const cache = new WeakMap();
const validatorFor = (schema) => {
  if (!schema) return null;
  if (!cache.has(schema)) cache.set(schema, ajv.compile(schema));
  return cache.get(schema);
};

const formatErrors = (errors = [], location) =>
  errors.map((error) => ({
    field: [location, error.instancePath?.replace(/^\//, '').replace(/\//g, '.') || error.params?.missingProperty]
      .filter(Boolean)
      .join('.'),
    message: error.message || 'Invalid value',
  }));

export const validateContract = (contract = {}) => (req, res, next) => {
  for (const [location, value, schema] of [
    ['params', req.params, contract.request?.params],
    ['query', req.query, contract.request?.query],
    ['body', req.body, contract.request?.body],
  ]) {
    const validate = validatorFor(schema);
    if (validate && !validate(value ?? {})) {
      const error = new AppError('Validation failed', 400, ERROR_CODES.VALIDATION_ERROR);
      error.errors = formatErrors(validate.errors, location);
      return next(error);
    }
  }
  return next();
};

export const validateResponseContract = (contract = {}) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const schema = contract.responses?.[res.statusCode] || contract.responses?.[String(res.statusCode)] || (res.statusCode >= 400 ? sharedSchemas.errorEnvelope : null);
    const validate = validatorFor(schema);
    if (validate && !validate(payload)) {
      return originalJson({
        success: false,
        status: 'error',
        statusCode: 500,
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Response contract validation failed',
        errors: formatErrors(validate.errors, 'response'),
        requestId: req.requestId || res.locals?.requestId || null,
        timestamp: new Date().toISOString(),
      });
    }
    return originalJson(payload);
  };
  return next();
};

const schemaValidator = (contract = {}) => [validateContract(contract), validateResponseContract(contract)];

export default schemaValidator;

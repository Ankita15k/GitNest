import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import AppError from '../utils/AppError.js';
import ERROR_CODES from '../constants/errorCodes.js';
import { sharedSchemas } from '../contracts/index.js';

const ajv = new Ajv({
  allErrors: true,
  coerceTypes: true,
  removeAdditional: false,
  strict: false,
});

addFormats(ajv);

const validatorCache = new WeakMap();

const getValidator = (schema) => {
  if (!schema) return null;
  if (!validatorCache.has(schema)) {
    validatorCache.set(schema, ajv.compile(schema));
  }
  return validatorCache.get(schema);
};

const formatErrors = (errors = [], location) =>
  errors.map((error) => {
    const path = error.instancePath
      ? error.instancePath.replace(/^\//, '').replace(/\//g, '.')
      : error.params?.missingProperty || '';

    return {
      field: [location, path].filter(Boolean).join('.'),
      message: error.message || 'Invalid value',
    };
  });

const failValidation = (message, errors) => {
  const appError = new AppError(message, 400, ERROR_CODES.VALIDATION_ERROR);
  appError.errors = errors;
  return appError;
};

export const validateContract = (contract = {}) => (req, res, next) => {
  const targets = [
    ['params', req.params, contract.request?.params],
    ['query', req.query, contract.request?.query],
    ['body', req.body, contract.request?.body],
  ];

  for (const [location, value, schema] of targets) {
    const validator = getValidator(schema);
    if (!validator) continue;

    const valid = validator(value ?? {});
    if (!valid) {
      return next(failValidation('Validation failed', formatErrors(validator.errors, location)));
    }
  }

  next();
};

const statusSchemaFor = (contract, statusCode) =>
  contract.responses?.[statusCode] ||
  contract.responses?.[String(statusCode)] ||
  (statusCode >= 400 ? sharedSchemas.errorEnvelope : null);

export const validateResponseContract = (contract = {}) => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    const schema = statusSchemaFor(contract, res.statusCode);
    const validator = getValidator(schema);

    if (validator && !validator(payload)) {
      const errors = formatErrors(validator.errors, 'response');

      if (res.headersSent) {
        return originalJson(payload);
      }

      return originalJson({
        success: false,
        status: 'error',
        statusCode: 500,
        code: ERROR_CODES.SERVER_ERROR,
        message: 'Response contract validation failed',
        errors,
        requestId: req.requestId || res.locals?.requestId || null,
        timestamp: new Date().toISOString(),
      });
    }

    return originalJson(payload);
  };

  next();
};

const schemaValidator = (contract = {}) => [
  validateContract(contract),
  validateResponseContract(contract),
];

export default schemaValidator;

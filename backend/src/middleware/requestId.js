import { randomBytes } from 'crypto';

const generateRequestId = () => `req_${randomBytes(4).toString('hex')}`;

/**
 * Attaches a unique request ID for end-to-end tracing.
 */
export const requestIdMiddleware = (req, res, next) => {
  const incomingId = req.headers['x-request-id'];
  req.requestId = typeof incomingId === 'string' && incomingId.trim()
    ? incomingId.trim()
    : generateRequestId();

  res.locals.requestId = req.requestId;
  res.setHeader('X-Request-Id', req.requestId);
  next();
};

/**
 * Ensures JSON responses include requestId when not already set.
 */
export const attachRequestIdToResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === 'object' && req.requestId && body.requestId === undefined) {
      return originalJson({ ...body, requestId: req.requestId });
    }
    return originalJson(body);
  };

  next();
};

export default requestIdMiddleware;

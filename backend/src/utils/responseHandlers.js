export const sendSuccess = (res, statusCode, data, message = 'Success') => {
  const payload = {
    success: true,
    status: 'success',
    message,
    data: data ?? null,
    requestId: res.locals?.requestId || null,
  };

  return res.status(statusCode).json(payload);
};

export const sendPaginated = (res, statusCode, data, pagination, message = 'Success') => {
  const payload = {
    success: true,
    status: 'success',
    message,
    data: data ?? null,
    pagination,
    requestId: res.locals?.requestId || null,
  };

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res,
  {
    statusCode = 500,
    code = 'SERVER_ERROR',
    message = 'Something went wrong',
    errors = [],
    requestId = null,
  }
) => {
  return res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode,
    code,
    message,
    requestId: requestId || res.locals?.requestId || null,
    errors: Array.isArray(errors) ? errors : [],
    timestamp: new Date().toISOString(),
  });
};

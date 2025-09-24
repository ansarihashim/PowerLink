import { error as errorResp } from '../utils/response.js';

export function notFound(req, res) {
  return errorResp(res, 'Not Found', 'NOT_FOUND', 404);
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  return errorResp(res, err.message || 'Server Error', err.code || 'SERVER_ERROR', err.status || 500, err.details);
}

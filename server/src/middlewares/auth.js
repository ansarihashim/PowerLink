import { verifyAccess, verifyRefresh, signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { error } from '../utils/response.js';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return error(res, 'Missing token', 'UNAUTHORIZED', 401);
  try {
    const payload = verifyAccess(token);
    req.user = payload;
    next();
  } catch (e) {
    return error(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return error(res, 'Not authenticated', 'UNAUTHORIZED', 401);
    if (!roles.includes(req.user.role)) return error(res, 'Forbidden', 'FORBIDDEN', 403);
    next();
  };
}

// Permission middleware: check if user can write (create/update)
export function requireWrite(req, res, next) {
  if (!req.user) return error(res, 'Not authenticated', 'UNAUTHORIZED', 401);
  // Admins always have all permissions
  if (req.user.role === 'admin') return next();
  // Check canWrite permission
  if (!req.user.permissions || !req.user.permissions.canWrite) {
    return error(res, 'You do not have permission to modify data', 'FORBIDDEN', 403);
  }
  next();
}

// Permission middleware: check if user can delete
export function requireDelete(req, res, next) {
  if (!req.user) return error(res, 'Not authenticated', 'UNAUTHORIZED', 401);
  // Admins always have all permissions
  if (req.user.role === 'admin') return next();
  // Check canDelete permission
  if (!req.user.permissions || !req.user.permissions.canDelete) {
    return error(res, 'You do not have permission to delete data', 'FORBIDDEN', 403);
  }
  next();
}

// Permission middleware: check if user can export
export function requireExport(req, res, next) {
  if (!req.user) return error(res, 'Not authenticated', 'UNAUTHORIZED', 401);
  // Admins always have all permissions
  if (req.user.role === 'admin') return next();
  // Check canExport permission
  if (!req.user.permissions || !req.user.permissions.canExport) {
    return error(res, 'You do not have permission to export data', 'FORBIDDEN', 403);
  }
  next();
}

export async function rotateRefresh(oldToken, user) {
  // bump tokenVersion already handled outside if needed
  return {
    accessToken: signAccessToken({ 
      sub: user._id.toString(), 
      role: user.role, 
      tv: user.tokenVersion,
      permissions: user.permissions
    }),
    refreshToken: signRefreshToken({ sub: user._id.toString(), tv: user.tokenVersion })
  };
}

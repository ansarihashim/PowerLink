import { Router } from 'express';
import { User } from '../models/User.js';
import { ok, error } from '../utils/response.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return error(res, 'Admin access required', 'FORBIDDEN', 403);
  }
  next();
};

// Get all pending user requests
router.get('/users/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ accountStatus: 'pending' })
      .select('-passwordHash -tokenVersion')
      .sort({ createdAt: -1 });
    return ok(res, { users: pendingUsers });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Get all users (for admin management)
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = req.query.status; // pending, approved, rejected, or 'all'
    const filter = status && status !== 'all' ? { accountStatus: status } : {};
    
    const users = await User.find(filter)
      .select('-passwordHash -tokenVersion')
      .sort({ createdAt: -1 });
    return ok(res, { users });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Approve user request
router.post('/users/:userId/approve', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
    
    if (user.accountStatus === 'approved') {
      return error(res, 'User is already approved', 'ALREADY_APPROVED', 400);
    }
    
    // Set permissions
    const userPermissions = permissions || { canRead: true, canWrite: false, canDelete: false, canExport: false };
    const userRole = role || user.role || 'viewer';
    
    await User.findByIdAndUpdate(userId, {
      accountStatus: 'approved',
      permissions: userPermissions,
      role: userRole,
      approvedBy: req.user.sub,
      approvedAt: new Date(),
      rejectedReason: null,
      $inc: { tokenVersion: 1 } // Invalidate existing tokens to apply new permissions
    });
    
    const updatedUser = await User.findById(userId).select('-passwordHash -tokenVersion');
    return ok(res, { 
      message: 'User approved successfully',
      user: updatedUser 
    });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Reject user request
router.post('/users/:userId/reject', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
    
    await User.findByIdAndUpdate(userId, {
      accountStatus: 'rejected',
      rejectedReason: reason || 'Your account request was rejected by the administrator.',
      approvedBy: req.user.sub,
      approvedAt: new Date()
    });
    
    const updatedUser = await User.findById(userId).select('-passwordHash -tokenVersion');
    return ok(res, { 
      message: 'User rejected',
      user: updatedUser 
    });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Update user permissions
router.put('/users/:userId/permissions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
    
    const updates = {};
    if (permissions) updates.permissions = permissions;
    if (role) updates.role = role;
    updates.$inc = { tokenVersion: 1 }; // Invalidate existing tokens to apply new permissions
    
    await User.findByIdAndUpdate(userId, updates);
    
    const updatedUser = await User.findById(userId).select('-passwordHash -tokenVersion');
    return ok(res, { 
      message: 'User permissions updated',
      user: updatedUser 
    });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

// Delete user (admin only)
router.delete('/users/:userId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent deleting yourself
    if (userId === req.user.sub) {
      return error(res, 'Cannot delete your own account', 'FORBIDDEN', 403);
    }
    
    const user = await User.findById(userId);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
    
    // Prevent deleting other admins
    if (user.role === 'admin') {
      return error(res, 'Cannot delete admin accounts', 'FORBIDDEN', 403);
    }
    
    await User.findByIdAndDelete(userId);
    return ok(res, { message: 'User deleted successfully' });
  } catch (err) {
    return error(res, err.message, 'SERVER_ERROR', 500);
  }
});

export default router;

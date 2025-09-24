import { User } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/jwt.js';
import { created, ok, error } from '../utils/response.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

function setRefreshCookie(res, token) {
  res.cookie('pl_refresh', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth'
  });
}

export async function register(req, res) {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return error(res, 'Validation error', 'VALIDATION_ERROR', 400, parse.error.flatten());
  const { name, email, password } = parse.data;
  const exists = await User.findOne({ email });
  if (exists) return error(res, 'Email already registered', 'EMAIL_IN_USE', 409);
  const count = await User.countDocuments();
  const passwordHash = await hashPassword(password);
  const role = count === 0 ? 'admin' : 'viewer';
  const user = await User.create({ name, email, passwordHash, role });
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, tv: user.tokenVersion });
  const refreshToken = signRefreshToken({ sub: user._id.toString(), tv: user.tokenVersion });
  setRefreshCookie(res, refreshToken);
  return created(res, { user: sanitizeUser(user), accessToken });
}

export async function login(req, res) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return error(res, 'Validation error', 'VALIDATION_ERROR', 400, parse.error.flatten());
  const { email, password } = parse.data;
  const user = await User.findOne({ email });
  if (!user) return error(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
  const okPw = await verifyPassword(password, user.passwordHash);
  if (!okPw) return error(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
  
  // Update last login timestamp
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
  
  const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, tv: user.tokenVersion });
  const refreshToken = signRefreshToken({ sub: user._id.toString(), tv: user.tokenVersion });
  setRefreshCookie(res, refreshToken);
  return ok(res, { user: sanitizeUser(user), accessToken });
}

export async function refresh(req, res) {
  const token = req.cookies.pl_refresh;
  if (!token) return error(res, 'Missing refresh token', 'UNAUTHORIZED', 401);
  try {
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return error(res, 'User not found', 'UNAUTHORIZED', 401);
    if (payload.tv !== user.tokenVersion) return error(res, 'Token expired', 'UNAUTHORIZED', 401);
    // issue new tokens
    const accessToken = signAccessToken({ sub: user._id.toString(), role: user.role, tv: user.tokenVersion });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), tv: user.tokenVersion });
    setRefreshCookie(res, refreshToken);
    return ok(res, { accessToken });
  } catch (e) {
    return error(res, 'Invalid refresh token', 'UNAUTHORIZED', 401);
  }
}

export async function logout(req, res) {
  const token = req.cookies.pl_refresh;
  if (token) {
    // increment tokenVersion to invalidate existing refresh tokens
    try {
      const payload = verifyRefresh(token);
      await User.findByIdAndUpdate(payload.sub, { $inc: { tokenVersion: 1 } });
    } catch {}
  }
  res.clearCookie('pl_refresh', { path: '/api/auth' });
  return res.status(204).send();
}

export async function me(req, res) {
  const user = await User.findById(req.user.sub);
  if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
  return ok(res, { user: sanitizeUser(user) });
}

// Update profile information
export async function updateProfile(req, res) {
  const { name } = req.body;
  
  if (!name || name.trim().length < 1 || name.trim().length > 100) {
    return error(res, 'Name must be between 1 and 100 characters', 'VALIDATION_ERROR', 400);
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.sub, 
      { name: name.trim() }, 
      { new: true }
    );
    
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);
    return ok(res, { user: sanitizeUser(user) });
  } catch (err) {
    return error(res, 'Failed to update profile', 'UPDATE_ERROR', 500);
  }
}

// Change password
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return error(res, 'Current and new passwords are required', 'VALIDATION_ERROR', 400);
  }
  
  if (newPassword.length < 6) {
    return error(res, 'New password must be at least 6 characters', 'VALIDATION_ERROR', 400);
  }

  try {
    const user = await User.findById(req.user.sub);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);

    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      return error(res, 'Current password is incorrect', 'INVALID_PASSWORD', 400);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await User.findByIdAndUpdate(req.user.sub, { 
      passwordHash: newPasswordHash,
      lastPasswordChange: new Date(),
      $inc: { tokenVersion: 1 } // Invalidate all existing tokens
    });

    return ok(res, { message: 'Password changed successfully' });
  } catch (err) {
    return error(res, 'Failed to change password', 'UPDATE_ERROR', 500);
  }
}

// Enable 2FA - Generate secret and QR code
export async function enable2FA(req, res) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);

    if (user.twoFactorEnabled) {
      return error(res, 'Two-factor authentication is already enabled', 'ALREADY_ENABLED', 400);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `PowerLink (${user.email})`,
      issuer: 'PowerLink'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Store secret temporarily (will be confirmed on verification)
    await User.findByIdAndUpdate(req.user.sub, {
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: backupCodes
    });

    return ok(res, {
      qrCode: qrCodeUrl,
      secret: secret.base32,
      backupCodes
    });
  } catch (err) {
    return error(res, 'Failed to setup 2FA', 'SETUP_ERROR', 500);
  }
}

// Verify 2FA setup
export async function verify2FA(req, res) {
  const { token } = req.body;
  
  if (!token) {
    return error(res, 'Verification token is required', 'VALIDATION_ERROR', 400);
  }

  try {
    const user = await User.findById(req.user.sub);
    if (!user || !user.twoFactorSecret) {
      return error(res, 'Two-factor setup not initiated', 'SETUP_NOT_FOUND', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return error(res, 'Invalid verification code', 'INVALID_TOKEN', 400);
    }

    // Enable 2FA
    await User.findByIdAndUpdate(req.user.sub, {
      twoFactorEnabled: true
    });

    return ok(res, { 
      message: 'Two-factor authentication enabled successfully',
      backupCodes: user.twoFactorBackupCodes 
    });
  } catch (err) {
    return error(res, 'Failed to verify 2FA', 'VERIFICATION_ERROR', 500);
  }
}

// Disable 2FA
export async function disable2FA(req, res) {
  const { password } = req.body;
  
  if (!password) {
    return error(res, 'Password is required to disable 2FA', 'VALIDATION_ERROR', 400);
  }

  try {
    const user = await User.findById(req.user.sub);
    if (!user) return error(res, 'User not found', 'NOT_FOUND', 404);

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return error(res, 'Incorrect password', 'INVALID_PASSWORD', 400);
    }

    await User.findByIdAndUpdate(req.user.sub, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: []
    });

    return ok(res, { message: 'Two-factor authentication disabled successfully' });
  } catch (err) {
    return error(res, 'Failed to disable 2FA', 'DISABLE_ERROR', 500);
  }
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    lastPasswordChange: user.lastPasswordChange,
    twoFactorEnabled: user.twoFactorEnabled || false
  };
}

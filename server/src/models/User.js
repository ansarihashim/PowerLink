import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','manager','viewer'], default: 'viewer' },
  tokenVersion: { type: Number, default: 0 },
  avatar: { type: String },
  // 2FA removed
  // Security tracking
  lastLogin: { type: Date, default: Date.now },
  lastPasswordChange: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

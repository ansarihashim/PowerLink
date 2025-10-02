import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','manager','viewer'], default: 'viewer' },
  tokenVersion: { type: Number, default: 0 },
  avatar: { type: String },
  // Account approval system
  accountStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  permissions: {
    canRead: { type: Boolean, default: false },
    canWrite: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false }
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedReason: { type: String },
  // 2FA removed
  // Security tracking
  lastLogin: { type: Date, default: Date.now },
  lastPasswordChange: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

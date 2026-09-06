import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ShippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, unique: true, index: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  name: { type: String, trim: true },
  avatar: { 
    type: String, 
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' 
  },
  role: { 
    type: String, 
    default: 'user', 
    enum: ['user', 'vip', 'moderator', 'admin'],
    index: true 
  },
  tier: { 
    type: String, 
    default: 'Silver Member', 
    enum: ['Silver Member', 'Gold Member', 'Platinum Member', 'Diamond VIP', 'Member'] 
  },
  isVerified: { type: Boolean, default: false },
  
  // Multi-Currency Wallet Balances
  veloopCoins: { type: Number, default: 500 },
  coins: { type: Number, default: 500 },
  sveCoins: { type: Number, default: 100 },
  tokens: { type: Number, default: 500 },
  
  activeTickets: { type: Number, default: 0 },
  status: { type: String, default: 'active', enum: ['active', 'suspended', 'banned'] },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  
  shippingAddress: { type: ShippingAddressSchema, default: () => ({}) },
  refreshTokens: [{ type: String }],
  
  lastLoginAt: { type: Date },
  lastActiveIp: { type: String }
}, {
  timestamps: true
});

// Compare plain text password with hashed password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Exclude sensitive credentials when serializing to JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.__v;
  return obj;
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);

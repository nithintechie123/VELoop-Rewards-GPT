import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { User } from '../models/User.js';

const isMongo = () => mongoose.connection.readyState === 1;

/**
 * Generate Access and Refresh JWT Tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id || user.userId,
    userId: user.userId || user.id,
    email: user.email,
    role: user.role || 'user',
    tier: user.tier || 'Member'
  };

  const accessToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn || '15m'
  });

  const refreshToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiresIn || '7d'
  });

  return { accessToken, refreshToken };
};

/**
 * Format clean safe user response
 */
const formatUserResponse = (user) => ({
  id: user.id || user.userId,
  userId: user.userId || user.id,
  name: user.name || user.fullName,
  fullName: user.fullName || user.name,
  email: user.email,
  avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: user.role || 'user',
  tier: user.tier || 'Silver Member',
  isVerified: Boolean(user.isVerified),
  veloopCoins: user.veloopCoins ?? user.coins ?? 0,
  coins: user.coins ?? user.veloopCoins ?? 0,
  sveCoins: user.sveCoins ?? 0,
  tokens: user.tokens ?? user.veloopCoins ?? 0,
  activeTickets: user.activeTickets ?? 0,
  shippingAddress: user.shippingAddress || {},
  createdAt: user.createdAt || new Date().toISOString()
});

/**
 * 1. User Registration (POST /api/auth/register)
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, name } = req.body || {};
    const displayName = (fullName || name || '').trim();

    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: 'Full name, valid email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate in Atlas or DataStore
    let existing = null;
    if (isMongo()) {
      try {
        existing = await User.findOne({ email: cleanEmail }).lean();
      } catch {}
    }
    if (!existing) {
      existing = db.getUserByEmail(cleanEmail);
    }

    if (existing) {
      return res.status(409).json({
        error: 'USER_EXISTS',
        message: 'An account with this email address already exists.'
      });
    }

    // Secure bcrypt hashing (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `VE${Math.floor(10000 + Math.random() * 90000)}`;

    const newUserDoc = {
      id: userId,
      userId,
      email: cleanEmail,
      passwordHash,
      fullName: displayName,
      name: displayName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      role: 'user',
      tier: 'Silver Member',
      isVerified: false,
      veloopCoins: 500, // Welcome signup bonus
      coins: 500,
      sveCoins: 100,
      tokens: 500,
      activeTickets: 0,
      status: 'active',
      riskScore: 0,
      shippingAddress: {},
      refreshTokens: [],
      lastActiveIp: req.ip || '127.0.0.1',
      lastLoginAt: new Date()
    };

    const { accessToken, refreshToken } = generateTokens(newUserDoc);
    newUserDoc.refreshTokens = [refreshToken];

    // Save to DataStore
    db.addUser(newUserDoc);

    // Save to MongoDB Atlas
    if (isMongo()) {
      try {
        await User.create(newUserDoc);
      } catch (e) {
        AuditLogger.warn('Atlas user sync note:', { message: e.message });
      }
    }

    // Set secure HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    db.logAudit({
      action: 'USER_REGISTERED',
      userId,
      email: cleanEmail,
      ipAddress: req.ip || '127.0.0.1'
    });

    AuditLogger.info(`New user registered: ${userId} (${cleanEmail})`);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered and welcome bonus credited.',
      accessToken,
      token: accessToken,
      refreshToken,
      user: formatUserResponse(newUserDoc)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. User Login (POST /api/auth/login)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up in MongoDB Atlas or DataStore
    let user = null;
    if (isMongo()) {
      try {
        user = await User.findOne({ email: cleanEmail });
      } catch {}
    }
    if (!user) {
      user = db.getUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        notFound: true,
        message: 'No account found with this email address.'
      });
    }

    // Check account status
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({
        error: 'ACCOUNT_SUSPENDED',
        message: 'This account has been suspended for security violations.'
      });
    }

    // Verify Password with bcrypt
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password) {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      db.logAudit({
        action: 'FAILED_LOGIN_ATTEMPT',
        email: cleanEmail,
        ipAddress: req.ip || '127.0.0.1'
      });
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Incorrect password. Please verify your credentials.'
      });
    }

    // Generate rotated tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update session data in store & Atlas
    db.updateUser(user.id || user.userId, {
      lastLoginAt: new Date(),
      lastActiveIp: req.ip || '127.0.0.1'
    });

    if (isMongo() && user._id) {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: { lastLoginAt: new Date(), lastActiveIp: req.ip || '127.0.0.1' },
            $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } }
          }
        );
      } catch {}
    }

    // Set HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    db.logAudit({
      action: 'USER_LOGIN_SUCCESS',
      userId: user.id || user.userId,
      email: cleanEmail,
      ipAddress: req.ip || '127.0.0.1'
    });

    AuditLogger.info(`User login successful: ${user.id || user.userId} (${cleanEmail})`);

    res.json({
      success: true,
      message: 'Login successful.',
      accessToken,
      token: accessToken,
      refreshToken,
      user: formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Token Rotation (POST /api/auth/refresh)
 */
export const refresh = async (req, res, next) => {
  try {
    const token = req.body?.refreshToken || req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token must be provided.'
      });
    }

    let decoded = null;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch {
      return res.status(401).json({
        error: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is expired or invalid.'
      });
    }

    const userId = decoded.id || decoded.userId;
    let user = null;
    if (isMongo()) {
      try {
        user = await User.findOne({ id: userId });
      } catch {}
    }
    if (!user) {
      user = db.getUserById(userId);
    }

    if (!user) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'The user associated with this token no longer exists.'
      });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken,
      token: accessToken,
      refreshToken: newRefreshToken,
      user: formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Live Authenticated User Profile (GET /api/auth/me)
 */
export const me = async (req, res, next) => {
  try {
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required.'
      });
    }

    const userId = authUser.id || authUser.userId;
    let liveUser = null;
    if (isMongo()) {
      try {
        liveUser = await User.findOne({ id: userId }).lean();
      } catch {}
    }
    if (!liveUser) {
      liveUser = db.getUserById(userId) || authUser;
    }

    res.json({
      success: true,
      user: formatUserResponse(liveUser),
      ...formatUserResponse(liveUser) // Direct top-level fields for backwards compatibility
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Update Profile (PUT /api/auth/profile)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required.' });
    }

    const { fullName, name, avatar, shippingAddress } = req.body || {};
    const updates = {};
    if (fullName || name) {
      updates.fullName = (fullName || name).trim();
      updates.name = (fullName || name).trim();
    }
    if (avatar) updates.avatar = avatar;
    if (shippingAddress && typeof shippingAddress === 'object') {
      updates.shippingAddress = shippingAddress;
    }

    const updatedUser = db.updateUser(userId, updates);
    if (isMongo()) {
      try {
        await User.updateOne({ id: userId }, { $set: updates });
      } catch {}
    }

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: formatUserResponse(updatedUser)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 6. Change Password (PUT /api/auth/password)
 */
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'VALIDATION_FAILED',
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'New password must be at least 6 characters.'
      });
    }

    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User not found.' });
    }

    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    } else if (user.password) {
      isMatch = user.password === currentPassword;
    }

    if (!isMatch) {
      return res.status(400).json({
        error: 'INVALID_PASSWORD',
        message: 'Current password does not match.'
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    db.updateUser(userId, { passwordHash: newPasswordHash, password: newPassword });

    if (isMongo()) {
      try {
        await User.updateOne({ id: userId }, { $set: { passwordHash: newPasswordHash } });
      } catch {}
    }

    db.logAudit({
      action: 'PASSWORD_CHANGED',
      userId,
      ipAddress: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: 'Password successfully changed.'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 7. Logout (POST /api/auth/logout)
 */
export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully and session cleared.'
  });
};

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const emailService = require('../services/email.service');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user._id, 
      gymId: user.gymId, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, family: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
  return { accessToken, refreshToken };
};

// @route   POST /api/v1/auth/register
// @desc    Register owner + create gym
// @access  Public
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, gymName, gymPhone, gymCity } = req.body;

    if (!firstName || !lastName || !email || !password || !gymName) {
      return errorResponse(res, 'Please fill all required fields', 400);
    }

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 'Email already registered', 409);

    // 1. Create a placeholder user to get the ID
    const user = new User({
      email,
      passwordHash: password,
      role: 'owner'
    });

    // 2. Create the gym with that ownerId
    const gym = await Gym.create({
      name: gymName,
      slug: gymName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      phone: gymPhone || '',
      email,
      address: { city: gymCity || '' },
      ownerId: user._id
    });

    // 3. Link gym back to user and save
    user.gymId = gym._id;
    await user.save();

    // 4. Create member profile for owner
    await Member.create({
      userId: user._id, // Add userId to member profile
      gymId: gym._id,
      firstName,
      lastName,
      membershipStatus: 'active',
      isActive: true
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send welcome email (async - don't block response)
    emailService.sendWelcomeEmail({ firstName, email }).catch(err => {
       console.error('Failed to send welcome email:', err);
    });

    return successResponse(res, {
      user: user.toJSON(),
      gym,
      accessToken,
      refreshToken
    }, 201);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return errorResponse(res, 'Email and password required', 400);

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 'Invalid credentials', 401);
    if (!user.isActive) return errorResponse(res, 'Account deactivated', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Get gym info
    const gym = await Gym.findById(user.gymId);

    // Get member profile if exists
    const member = await Member.findOne({ userId: user._id });
    const userData = user.toJSON();
    
    if (member) {
      userData.firstName = member.firstName;
      userData.lastName = member.lastName;
      userData.streak = member.streak?.current || 0;
      userData.totalWorkouts = member.totalWorkouts || 0;
      userData.memberId = member._id;
      userData.weight = member.currentMetrics?.weight || 0;
      userData.height = member.currentMetrics?.height || 0;
      userData.photo = member.photo || '';
      userData.preferences = member.preferences || { emailNotifications: true, pushNotifications: true, healthSync: false };
      userData.assignedProtocol = member.assignedProtocol || { source: 'custom' };
    }

    return successResponse(res, {
      user: userData,
      gym,
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, 'Refresh token required', 401);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const tokens = generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, tokens);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token expired, please login again', 401);
    }
    next(error);
  }
};

// @route   POST /api/v1/auth/logout
// @access  Auth
const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
    return successResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/auth/me
// @access  Auth
const getMe = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.user.gymId);
    const member = await Member.findOne({ userId: req.user._id });
    
    const userData = req.user.toJSON();
    if (member) {
      userData.firstName = member.firstName;
      userData.lastName = member.lastName;
      userData.streak = member.streak?.current || 0;
      userData.totalWorkouts = member.totalWorkouts || 0;
      userData.memberId = member._id;
      userData.weight = member.currentMetrics?.weight || 0;
      userData.height = member.currentMetrics?.height || 0;
      userData.photo = member.photo || '';
      userData.preferences = member.preferences || { emailNotifications: true, pushNotifications: true, healthSync: false };
      userData.assignedProtocol = member.assignedProtocol || { source: 'custom' };
    }

    return successResponse(res, { user: userData, gym });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/v1/auth/me
// @access  Auth
const updateMe = async (req, res, next) => {
  try {
    const { firstName, lastName, weight, height, photo, preferences } = req.body;
    
    const member = await Member.findOne({ userId: req.user._id });
    if (!member) return errorResponse(res, 'Member profile not found', 404);

    if (firstName) member.firstName = firstName.trim();
    if (lastName) member.lastName = lastName.trim();
    
    // Strict whitelist for preferences to prevent XSS/Mass Assignment
    if (preferences && typeof preferences === 'object') {
      const allowedKeys = ['emailNotifications', 'pushNotifications', 'healthSync', 'theme'];
      allowedKeys.forEach(key => {
        if (preferences[key] !== undefined) {
          // Basic sanitization for strings, boolean for others
          if (typeof preferences[key] === 'string') {
            member.preferences[key] = preferences[key].replace(/<[^>]*>?/gm, '').substring(0, 50);
          } else {
            member.preferences[key] = !!preferences[key];
          }
        }
      });
    }

    // Basic URL validation for photo
    if (req.file) {
      member.photo = req.file.path; // Cloudinary URL
    } else if (photo !== undefined) {
      if (photo === '' || photo.startsWith('http') || photo.startsWith('data:image')) {
        member.photo = photo;
      }
    }
    
    if (weight !== undefined || height !== undefined) {
      if (!member.currentMetrics) member.currentMetrics = { weight: 0, height: 0 };
      
      // Also add to weight history if weight changed
      if (weight !== undefined && weight !== member.currentMetrics.weight) {
        member.weightHistory.push({ weight, date: new Date() });
        member.currentMetrics.weight = weight;
      }
      
      if (height !== undefined) {
        member.currentMetrics.height = height;
      }
      
      member.currentMetrics.updatedAt = new Date();
    }

    await member.save();
    
    const userData = req.user.toJSON();
    userData.firstName = member.firstName;
    userData.lastName = member.lastName;
    userData.streak = member.streak?.current || 0;
    userData.totalWorkouts = member.totalWorkouts || 0;
    userData.memberId = member._id;
    userData.weight = member.currentMetrics?.weight || 0;
    userData.height = member.currentMetrics?.height || 0;
    userData.photo = member.photo || '';
    userData.preferences = member.preferences;

    return successResponse(res, { user: userData });
  } catch (error) {
    next(error);
  }
};

const crypto = require('crypto');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// @desc    Forgot Password - Send OTP
// @route   POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Always return success to prevent enumeration
    if (!user) return successResponse(res, null, 200, { message: 'If an account exists, a reset code has been sent.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.inviteToken = otp; // Re-using inviteToken field for OTP logic simplicity
    user.inviteTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user, otp);
    
    return successResponse(res, null, 200, { message: 'If an account exists, a reset code has been sent.' });
  } catch (error) { next(error); }
};

// @desc    Reset Password with OTP
// @route   POST /api/v1/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ 
      email, 
      inviteToken: otp, 
      inviteTokenExpiry: { $gt: Date.now() } 
    });

    if (!user) return errorResponse(res, 'Invalid or expired reset code', 400);

    user.passwordHash = newPassword; // Model pre-save hook will hash it
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;
    await user.save();

    return successResponse(res, null, 200, { message: 'Password updated successfully. Access restored.' });
  } catch (error) { next(error); }
};

module.exports = { register, login, refreshToken, logout, getMe, updateMe, forgotPassword, resetPassword };

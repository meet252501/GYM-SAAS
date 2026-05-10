const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Gym = require('../models/Gym');
const Member = require('../models/Member');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId, family: uuidv4() },
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

    // Create gym first
    const gym = await Gym.create({
      name: gymName,
      phone: gymPhone || '',
      email,
      address: { city: gymCity || '' },
      ownerId: 'temp' // will update
    });

    // Create user (owner)
    const user = await User.create({
      email,
      passwordHash: password, // pre-save hook will hash
      role: 'owner',
      gymId: gym._id
    });

    // Update gym with real ownerId
    gym.ownerId = user._id;
    await gym.save();

    // Create member profile for owner (optional, for tracking)
    await Member.create({
      gymId: gym._id,
      firstName,
      lastName,
      membershipStatus: 'active',
      isActive: true
    });

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

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

    const { accessToken, refreshToken } = generateTokens(user._id);
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

    const tokens = generateTokens(user._id);
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
    if (photo !== undefined) {
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

module.exports = { register, login, refreshToken, logout, getMe, updateMe };

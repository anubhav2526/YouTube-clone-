import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { username, email, password, channelName } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    channelName: channelName || username
  });

  // Generate token
  const token = user.generateAuthToken();

  // Send response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user by credentials
  const user = await User.findByCredentials(email, password);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  // Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token
    }
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('subscribedChannels', 'username avatar channelName subscribers');

  res.status(200).json({
    success: true,
    data: {
      user: user.getPublicProfile()
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, channelName, channelDescription, avatar } = req.body;

  // Check if username is being changed and if it's already taken
  if (username && username !== req.user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already taken'
      });
    }
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      username: username || req.user.username,
      channelName: channelName || req.user.channelName,
      channelDescription: channelDescription || req.user.channelDescription,
      avatar: avatar || req.user.avatar
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/auth/account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required to delete account'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Password is incorrect'
    });
  }

  // Delete user
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
}); 
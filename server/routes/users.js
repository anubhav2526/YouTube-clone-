import express from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Video from '../models/Video.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('channelName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Channel name cannot exceed 50 characters'),
  body('channelDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Channel description cannot exceed 500 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('subscribedChannels', 'username avatar channelName subscribers');

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @desc    Get user's videos
 * @route   GET /api/users/:id/videos
 * @access  Public
 */
const getUserVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if user exists
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get videos
  const videos = await Video.find({
    uploader: req.params.id,
    isPublic: true
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('uploader', 'username avatar channelName subscribers')
    .select('title thumbnailUrl views createdAt duration category');

  // Get total count
  const total = await Video.countDocuments({
    uploader: req.params.id,
    isPublic: true
  });

  res.status(200).json({
    success: true,
    data: {
      videos,
      user: {
        id: user._id,
        username: user.username,
        channelName: user.channelName,
        avatar: user.avatar,
        subscribers: user.subscribers
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private (owner only)
 */
const updateUser = asyncHandler(async (req, res) => {
  // Check if user is updating their own profile
  if (req.params.id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this profile'
    });
  }

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
    req.params.id,
    {
      username: username || req.user.username,
      channelName: channelName || req.user.channelName,
      channelDescription: channelDescription || req.user.channelDescription,
      avatar: avatar || req.user.avatar
    },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * @desc    Subscribe to user
 * @route   POST /api/users/:id/subscribe
 * @access  Private
 */
const subscribeToUser = asyncHandler(async (req, res) => {
  // Can't subscribe to yourself
  if (req.params.id === req.user.id) {
    return res.status(400).json({
      success: false,
      error: 'Cannot subscribe to yourself'
    });
  }

  const userToSubscribe = await User.findById(req.params.id);
  if (!userToSubscribe) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const currentUser = await User.findById(req.user.id);

  // Check if already subscribed
  const isSubscribed = currentUser.subscribedChannels.includes(req.params.id);

  if (isSubscribed) {
    // Unsubscribe
    currentUser.subscribedChannels = currentUser.subscribedChannels.filter(
      id => id.toString() !== req.params.id
    );
    userToSubscribe.subscribers -= 1;
  } else {
    // Subscribe
    currentUser.subscribedChannels.push(req.params.id);
    userToSubscribe.subscribers += 1;
  }

  await Promise.all([currentUser.save(), userToSubscribe.save()]);

  res.status(200).json({
    success: true,
    message: isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully',
    data: {
      isSubscribed: !isSubscribed,
      subscriberCount: userToSubscribe.subscribers
    }
  });
});

/**
 * @desc    Get user's subscriptions
 * @route   GET /api/users/:id/subscriptions
 * @access  Private (owner only)
 */
const getUserSubscriptions = asyncHandler(async (req, res) => {
  // Check if user is requesting their own subscriptions
  if (req.params.id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view these subscriptions'
    });
  }

  const user = await User.findById(req.params.id)
    .populate('subscribedChannels', 'username avatar channelName subscribers');

  res.status(200).json({
    success: true,
    data: {
      subscriptions: user.subscribedChannels
    }
  });
});

// Routes
router.get('/:id', getUser);
router.get('/:id/videos', getUserVideos);
router.get('/:id/subscriptions', protect, getUserSubscriptions);
router.put('/:id', protect, updateUserValidation, updateUser);
router.post('/:id/subscribe', protect, subscribeToUser);

export default router; 
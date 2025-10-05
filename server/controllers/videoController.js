import { asyncHandler } from '../middleware/errorHandler.js';
import Video from '../models/Video.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Get all videos with pagination and filters
 * @route   GET /api/videos
 * @access  Public
 */
export const getVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // Build query
  const query = { isPublic: true };
  if (category && category !== 'All') {
    query.category = category;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder;

  // Execute query
  const videos = await Video.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('uploader', 'username avatar channelName subscribers')
    .select('title thumbnailUrl views createdAt duration category');

  // Get total count
  const total = await Video.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      videos,
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
 * @desc    Get single video by ID
 * @route   GET /api/videos/:id
 * @access  Public
 */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('uploader', 'username avatar channelName subscribers')
    .populate({
      path: 'comments',
      populate: { path: 'user', select: 'username avatar' },
      options: { sort: { createdAt: -1 } }
    });

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Increment views
  await video.incrementViews();

  res.status(200).json({
    success: true,
    data: { video }
  });
});

/**
 * @desc    Upload new video
 * @route   POST /api/videos
 * @access  Private
 */
export const uploadVideo = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { title, description, category, tags, isPublic = true } = req.body;
  const videoUrl = req.file?.path || req.body.videoUrl;
  const thumbnailUrl = req.body.thumbnailUrl;

  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Video file or URL is required'
    });
  }

  // Create video
  const video = await Video.create({
    title,
    description,
    videoUrl,
    thumbnailUrl: thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video',
    uploader: req.user.id,
    channelId: req.user.id,
    category,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    isPublic
  });

  // Populate uploader info
  await video.populate('uploader', 'username avatar channelName');

  res.status(201).json({
    success: true,
    message: 'Video uploaded successfully',
    data: { video }
  });
});

/**
 * @desc    Update video
 * @route   PUT /api/videos/:id
 * @access  Private
 */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check ownership
  if (video.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this video'
    });
  }

  const { title, description, category, tags, isPublic } = req.body;

  // Update video
  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    {
      title: title || video.title,
      description: description || video.description,
      category: category || video.category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : video.tags,
      isPublic: isPublic !== undefined ? isPublic : video.isPublic
    },
    { new: true, runValidators: true }
  ).populate('uploader', 'username avatar channelName');

  res.status(200).json({
    success: true,
    message: 'Video updated successfully',
    data: { video: updatedVideo }
  });
});

/**
 * @desc    Delete video
 * @route   DELETE /api/videos/:id
 * @access  Private
 */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check ownership
  if (video.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this video'
    });
  }

  await Video.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Video deleted successfully'
  });
});

/**
 * @desc    Toggle like on video
 * @route   POST /api/videos/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  await video.toggleLike(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Like toggled successfully',
    data: {
      likes: video.likes.length,
      dislikes: video.dislikes.length
    }
  });
});

/**
 * @desc    Toggle dislike on video
 * @route   POST /api/videos/:id/dislike
 * @access  Private
 */
export const toggleDislike = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  await video.toggleDislike(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Dislike toggled successfully',
    data: {
      likes: video.likes.length,
      dislikes: video.dislikes.length
    }
  });
});

/**
 * @desc    Get trending videos
 * @route   GET /api/videos/trending
 * @access  Public
 */
export const getTrendingVideos = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const videos = await Video.getTrending(limit);

  res.status(200).json({
    success: true,
    data: { videos }
  });
});

/**
 * @desc    Get videos by category
 * @route   GET /api/videos/category/:category
 * @access  Public
 */
export const getVideosByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const videos = await Video.getByCategory(category, page, limit);

  res.status(200).json({
    success: true,
    data: { videos }
  });
});

/**
 * @desc    Search videos
 * @route   GET /api/videos/search
 * @access  Public
 */
export const searchVideos = asyncHandler(async (req, res) => {
  const { q: query, category, sortBy = 'relevance' } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required'
    });
  }

  // Build search query
  const searchQuery = {
    isPublic: true,
    $text: { $search: query }
  };

  if (category && category !== 'All') {
    searchQuery.category = category;
  }

  // Build sort object
  let sort = {};
  switch (sortBy) {
    case 'date':
      sort = { createdAt: -1 };
      break;
    case 'views':
      sort = { views: -1 };
      break;
    case 'rating':
      sort = { likeCount: -1 };
      break;
    default:
      sort = { score: { $meta: 'textScore' } };
  }

  // Execute search
  const videos = await Video.find(searchQuery)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('uploader', 'username avatar channelName subscribers')
    .select('title thumbnailUrl views createdAt duration category');

  // Get total count
  const total = await Video.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      videos,
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
 * @desc    Get user's videos
 * @route   GET /api/videos/user/:userId
 * @access  Public
 */
export const getUserVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get videos
  const videos = await Video.find({
    uploader: userId,
    isPublic: true
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('uploader', 'username avatar channelName subscribers')
    .select('title thumbnailUrl views createdAt duration category');

  // Get total count
  const total = await Video.countDocuments({
    uploader: userId,
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
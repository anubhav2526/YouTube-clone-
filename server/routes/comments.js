import express from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler.js';
import Comment from '../models/Comment.js';
import Video from '../models/Video.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const commentValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

const replyValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reply must be between 1 and 500 characters')
];

/**
 * @desc    Get comments for a video
 * @route   GET /api/comments/video/:videoId
 * @access  Public
 */
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  const comments = await Comment.getVideoComments(videoId, page, limit);

  // Get total count
  const total = await Comment.countDocuments({
    video: videoId,
    parentComment: null,
    isDeleted: false
  });

  res.status(200).json({
    success: true,
    data: {
      comments,
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
 * @desc    Add comment to video
 * @route   POST /api/comments/video/:videoId
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text } = req.body;

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Create comment
  const comment = await Comment.create({
    video: videoId,
    user: req.user.id,
    text
  });

  // Populate user info
  await comment.populate('user', 'username avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: { comment }
  });
});

/**
 * @desc    Update comment
 * @route   PUT /api/comments/:id
 * @access  Private (owner only)
 */
const updateComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }

  // Check ownership
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this comment'
    });
  }

  // Update comment
  comment.text = text;
  await comment.save();

  // Populate user info
  await comment.populate('user', 'username avatar');

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment }
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private (owner or admin)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }

  // Check ownership or admin role
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this comment'
    });
  }

  // Soft delete comment
  await comment.softDelete();

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

/**
 * @desc    Toggle like on comment
 * @route   POST /api/comments/:id/like
 * @access  Private
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }

  await comment.toggleLike(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Comment like toggled successfully',
    data: {
      likes: comment.likes.length,
      dislikes: comment.dislikes.length
    }
  });
});

/**
 * @desc    Toggle dislike on comment
 * @route   POST /api/comments/:id/dislike
 * @access  Private
 */
const toggleCommentDislike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }

  await comment.toggleDislike(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Comment dislike toggled successfully',
    data: {
      likes: comment.likes.length,
      dislikes: comment.dislikes.length
    }
  });
});

/**
 * @desc    Add reply to comment
 * @route   POST /api/comments/:id/reply
 * @access  Private
 */
const addReply = asyncHandler(async (req, res) => {
  const { text } = req.body;

  const parentComment = await Comment.findById(req.params.id);
  if (!parentComment) {
    return res.status(404).json({
      success: false,
      error: 'Parent comment not found'
    });
  }

  // Create reply
  const reply = await Comment.create({
    video: parentComment.video,
    user: req.user.id,
    text,
    parentComment: parentComment._id
  });

  // Add reply to parent comment
  parentComment.replies.push(reply._id);
  await parentComment.save();

  // Populate user info
  await reply.populate('user', 'username avatar');

  res.status(201).json({
    success: true,
    message: 'Reply added successfully',
    data: { reply }
  });
});

/**
 * @desc    Get comment with replies
 * @route   GET /api/comments/:id
 * @access  Public
 */
const getComment = asyncHandler(async (req, res) => {
  const comment = await Comment.getCommentWithReplies(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: 'Comment not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { comment }
  });
});

// Routes
router.get('/video/:videoId', getVideoComments);
router.get('/:id', getComment);
router.post('/video/:videoId', protect, commentValidation, addComment);
router.post('/:id/reply', protect, replyValidation, addReply);
router.put('/:id', protect, commentValidation, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);
router.post('/:id/dislike', protect, toggleCommentDislike);

export default router; 
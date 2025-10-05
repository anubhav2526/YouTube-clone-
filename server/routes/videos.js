import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import {
  getVideos,
  getVideo,
  uploadVideo,
  updateVideo,
  deleteVideo,
  toggleLike,
  toggleDislike,
  getTrendingVideos,
  getVideosByCategory,
  searchVideos,
  getUserVideos
} from '../controllers/videoController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept video files
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  }
});

// Validation middleware
const uploadVideoValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('category')
    .optional()
    .isIn(['Music', 'Gaming', 'Education', 'Entertainment', 'News', 'Sports', 'Technology', 'Travel', 'Cooking', 'Fitness', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

const updateVideoValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('category')
    .optional()
    .isIn(['Music', 'Gaming', 'Education', 'Entertainment', 'News', 'Sports', 'Technology', 'Travel', 'Cooking', 'Fitness', 'Other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// Public routes
router.get('/', optionalAuth, getVideos);
router.get('/trending', getTrendingVideos);
router.get('/category/:category', getVideosByCategory);
router.get('/search', searchVideos);
router.get('/user/:userId', getUserVideos);
router.get('/:id', optionalAuth, getVideo);

// Protected routes
router.post('/', protect, upload.single('video'), uploadVideoValidation, uploadVideo);
router.put('/:id', protect, updateVideoValidation, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);

export default router; 
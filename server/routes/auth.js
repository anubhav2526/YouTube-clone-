import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('channelName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Channel name cannot exceed 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
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

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);
router.delete('/account', protect, deleteAccount);

export default router; 
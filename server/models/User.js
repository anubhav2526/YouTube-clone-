import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150x150?text=User'
  },
  channelName: {
    type: String,
    trim: true,
    maxlength: [50, 'Channel name cannot exceed 50 characters']
  },
  channelDescription: {
    type: String,
    maxlength: [500, 'Channel description cannot exceed 500 characters']
  },
  subscribers: {
    type: Number,
    default: 0
  },
  subscribedChannels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for subscriber count
userSchema.virtual('subscriberCount').get(function() {
  return this.subscribers;
});

// Virtual for subscribed channels count
userSchema.virtual('subscribedCount').get(function() {
  return this.subscribedChannels.length;
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  try {
    return jwt.sign(
      { id: this._id, username: this.username, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  try {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User; 
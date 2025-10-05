import mongoose from 'mongoose';

// Comment subdocument schema
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Reply cannot exceed 500 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Video schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required']
  },
  thumbnailUrl: {
    type: String,
    required: [true, 'Thumbnail URL is required']
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Music', 'Gaming', 'Education', 'Entertainment', 'News', 'Sports', 'Technology', 'Travel', 'Cooking', 'Fitness', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  fileSize: {
    type: Number, // File size in bytes
    default: 0
  },
  resolution: {
    type: String,
    default: '720p'
  },
  language: {
    type: String,
    default: 'en'
  },
  ageRestriction: {
    type: Boolean,
    default: false
  },
  monetization: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
videoSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
videoSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for comment count
videoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for view count formatted
videoSchema.virtual('viewCountFormatted').get(function() {
  if (this.views >= 1000000) {
    return (this.views / 1000000).toFixed(1) + 'M';
  }
  if (this.views >= 1000) {
    return (this.views / 1000).toFixed(1) + 'K';
  }
  return this.views.toString();
});

// Virtual for duration formatted
videoSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Indexes for better query performance
videoSchema.index({ uploader: 1, createdAt: -1 });
videoSchema.index({ category: 1, createdAt: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ 'comments.createdAt': -1 });
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to update channelId if not set
videoSchema.pre('save', function(next) {
  if (!this.channelId) {
    this.channelId = this.uploader;
  }
  next();
});

// Method to increment views
videoSchema.methods.incrementViews = async function() {
  this.views += 1;
  return await this.save();
};

// Method to toggle like
videoSchema.methods.toggleLike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);

  if (likeIndex > -1) {
    // Remove like
    this.likes.splice(likeIndex, 1);
  } else {
    // Add like and remove dislike if exists
    this.likes.push(userId);
    if (dislikeIndex > -1) {
      this.dislikes.splice(dislikeIndex, 1);
    }
  }

  return await this.save();
};

// Method to toggle dislike
videoSchema.methods.toggleDislike = async function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  const dislikeIndex = this.dislikes.indexOf(userId);

  if (dislikeIndex > -1) {
    // Remove dislike
    this.dislikes.splice(dislikeIndex, 1);
  } else {
    // Add dislike and remove like if exists
    this.dislikes.push(userId);
    if (likeIndex > -1) {
      this.likes.splice(likeIndex, 1);
    }
  }

  return await this.save();
};

// Method to add comment
videoSchema.methods.addComment = async function(userId, text) {
  this.comments.push({
    user: userId,
    text: text
  });
  return await this.save();
};

// Method to remove comment
videoSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  return await this.save();
};

// Static method to get trending videos
videoSchema.statics.getTrending = async function(limit = 20) {
  return await this.find({ isPublic: true })
    .sort({ views: -1, createdAt: -1 })
    .limit(limit)
    .populate('uploader', 'username avatar channelName')
    .select('title thumbnailUrl views createdAt duration');
};

// Static method to get videos by category
videoSchema.statics.getByCategory = async function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return await this.find({ category, isPublic: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('uploader', 'username avatar channelName')
    .select('title thumbnailUrl views createdAt duration');
};

const Video = mongoose.model('Video', videoSchema);

export default Video; 
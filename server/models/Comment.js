import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
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
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    text: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for dislike count
commentSchema.virtual('dislikeCount').get(function() {
  return this.dislikes.length;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
  return this.replies.length;
});

// Indexes for better query performance
commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1, createdAt: 1 });

// Pre-save middleware to handle edit history
commentSchema.pre('save', function(next) {
  if (this.isModified('text') && !this.isNew) {
    this.isEdited = true;
    this.editHistory.push({
      text: this.text,
      editedAt: new Date()
    });
  }
  next();
});

// Method to toggle like
commentSchema.methods.toggleLike = async function(userId) {
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
commentSchema.methods.toggleDislike = async function(userId) {
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

// Method to add reply
commentSchema.methods.addReply = async function(userId, text) {
  const reply = new Comment({
    video: this.video,
    user: userId,
    text: text,
    parentComment: this._id
  });

  await reply.save();
  this.replies.push(reply._id);
  return await this.save();
};

// Method to soft delete comment
commentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.text = '[This comment has been deleted]';
  return await this.save();
};

// Static method to get comments for a video
commentSchema.statics.getVideoComments = async function(videoId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return await this.find({ 
    video: videoId, 
    parentComment: null, 
    isDeleted: false 
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username avatar')
    .populate({
      path: 'replies',
      match: { isDeleted: false },
      populate: { path: 'user', select: 'username avatar' },
      options: { sort: { createdAt: 1 } }
    });
};

// Static method to get comment with replies
commentSchema.statics.getCommentWithReplies = async function(commentId) {
  return await this.findById(commentId)
    .populate('user', 'username avatar')
    .populate({
      path: 'replies',
      match: { isDeleted: false },
      populate: { path: 'user', select: 'username avatar' },
      options: { sort: { createdAt: 1 } }
    });
};

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; 
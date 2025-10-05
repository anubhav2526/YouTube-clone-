import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoAPI } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';
import Button from '../components/UI/Button.jsx';
import { formatNumber, formatDate } from '../utils/api.js';
import toast from 'react-hot-toast';

const VideoPage = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');

  // Fetch video data
  const {
    data: videoData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoAPI.getVideo(videoId),
    enabled: !!videoId
  });

  const video = videoData?.data?.video;

  // Defensive: ensure likes, dislikes, comments, tags are always arrays
  const likes = Array.isArray(video?.likes) ? video.likes : [];
  const dislikes = Array.isArray(video?.dislikes) ? video.dislikes : [];
  const comments = Array.isArray(video?.comments) ? video.comments : [];
  const tags = Array.isArray(video?.tags) ? video.tags : [];

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like videos');
      return;
    }
    try {
      await videoAPI.toggleLike(videoId);
      toast.success('Like updated!');
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await videoAPI.addComment(videoId, { text: commentText });
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Video Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The video you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Video Player */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="aspect-video bg-black">
          <video
            src={video.videoUrl}
            controls
            className="w-full h-full"
            poster={video.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Video Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {video.title}
        </h1>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">
                {formatNumber(video.views)} views
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(video.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              disabled={!user}
            >
              👍 {formatNumber(likes.length)}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!user}
            >
              👎 {formatNumber(dislikes.length)}
            </Button>
          </div>
        </div>

        {/* Channel Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <img
            src={video.uploader?.avatar || 'https://via.placeholder.com/40x40?text=U'}
            alt={video.uploader?.username}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {video.uploader?.channelName || video.uploader?.username}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatNumber(video.uploader?.subscribers || 0)} subscribers
            </p>
          </div>
          <Button variant="primary" size="sm">
            Subscribe
          </Button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Description
          </h3>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {video.description || 'No description available.'}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comments ({formatNumber(comments.length)})
        </h3>

        {/* Add Comment */}
        {user && (
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex space-x-4">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-youtube-red dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex space-x-4">
                <img
                  src={comment.user?.avatar || 'https://via.placeholder.com/32x32?text=U'}
                  alt={comment.user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {comment.user?.username}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
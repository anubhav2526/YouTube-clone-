import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { videoAPI } from '../utils/api.js';
import Button from '../components/UI/Button.jsx';
import Input from '../components/UI/Input.jsx';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    tags: '',
    isPublic: true
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'Music', 'Gaming', 'Education', 'Entertainment', 'News', 
    'Sports', 'Technology', 'Travel', 'Cooking', 'Fitness', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'video') {
        setVideoFile(file);
      } else if (type === 'thumbnail') {
        setThumbnailFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to upload videos');
      return;
    }

    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('video', videoFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('isPublic', formData.isPublic);

      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await videoAPI.uploadVideo(formDataToSend);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Video uploaded successfully!');
      navigate(`/video/${response.data.video._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload video');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Please Log In
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You need to be logged in to upload videos.
            </p>
            <Button onClick={() => navigate('/login')} variant="primary">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Upload Video
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video File *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="hidden"
                id="video-upload"
                required
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-youtube-red hover:text-red-700">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    MP4, WebM, or OGG up to 100MB
                  </p>
                </div>
              </label>
            </div>
            {videoFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {videoFile.name}
              </p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thumbnail (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-youtube-red hover:text-red-700">
                      Click to upload
                    </span>{' '}
                    thumbnail image
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, or GIF up to 5MB
                  </p>
                </div>
              </label>
            </div>
            {thumbnailFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {thumbnailFile.name}
              </p>
            )}
          </div>

          {/* Title */}
          <Input
            label="Title *"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter video title"
            required
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="input"
              placeholder="Enter video description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <Input
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="Enter tags separated by commas"
            helperText="Example: tutorial, programming, web development"
          />

          {/* Public/Private */}
          <div className="flex items-center">
            <input
              id="isPublic"
              name="isPublic"
              type="checkbox"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="h-4 w-4 text-youtube-red focus:ring-youtube-red border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Make this video public
            </label>
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-youtube-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Upload Video
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage; 
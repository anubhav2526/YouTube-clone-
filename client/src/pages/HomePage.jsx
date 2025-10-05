import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import VideoCard from '../components/UI/VideoCard.jsx';
import Button from '../components/UI/Button.jsx';
import { videoAPI } from '../utils/api.js';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');

  const categories = [
    'All',
    'Music',
    'Gaming',
    'Education',
    'Entertainment',
    'News',
    'Sports',
    'Technology',
    'Travel',
    'Cooking',
    'Fitness'
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'likeCount', label: 'Most Liked' }
  ];

  // Fetch trending videos
  const {
    data: trendingData,
    isLoading: trendingLoading,
    error: trendingError
  } = useQuery({
    queryKey: ['trendingVideos'],
    queryFn: () => videoAPI.getTrendingVideos(),
  });

  // Fetch main video grid
  const {
    data: videosData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['videos', selectedCategory, sortBy],
    queryFn: () => videoAPI.getVideos({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      sortBy
    }),
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section with Trending Videos */}
      {(!selectedCategory || selectedCategory === 'All') && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trending Videos
          </h2>
          {trendingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : trendingError ? (
            <div className="text-red-500">Failed to load trending videos.</div>
          ) : trendingData?.data?.videos?.length > 0 ? (
            <div className="video-grid">
              {trendingData.data.videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No trending videos found.</div>
          )}
        </section>
      )}

      {/* Category Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {selectedCategory === 'All' ? 'All Videos' : `${selectedCategory} Videos`}
          </h2>
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-youtube-red focus:border-youtube-red dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Video Grid (Backend Data) */}
      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500">Failed to load videos.</div>
        ) : videosData?.data?.videos?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videosData.data.videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No videos found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No videos are available at the moment.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
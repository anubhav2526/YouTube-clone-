import React from 'react';
import { Link } from 'react-router-dom';
import { formatNumber, formatDate } from '../../utils/api.js';
import PropTypes from 'prop-types';

const VideoCard = ({ video, className = '' }) => {
  // Support both sample and backend data
  const {
    _id,
    videoId,
    title,
    thumbnailUrl,
    uploader,
    channelName,
    views,
    createdAt,
    uploadDate
  } = video;

  // Prefer _id or videoId for routing
  const id = _id || videoId;
  const channel = channelName || (typeof uploader === 'object' ? uploader?.username : uploader);
  const date = createdAt || uploadDate;

  return (
    <div className={`video-card bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden ${className}`}>
      <Link to={`/video/${id}`} className="block">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden group">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>
        {/* Video info */}
        <div className="p-3 flex space-x-3">
          {/* Channel avatar (optional) */}
          {video.avatar && (
            <div className="flex-shrink-0">
              <img
                src={video.avatar}
                alt={channel}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700"
                loading="lazy"
              />
            </div>
          )}
          {/* Video details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
              {title}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                {channel}
              </p>
              <p>
                {views ? views.toLocaleString() : 0} views • {date ? new Date(date).toLocaleDateString() : ''}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

VideoCard.propTypes = {
  video: PropTypes.object.isRequired,
  className: PropTypes.string
};

export default VideoCard;
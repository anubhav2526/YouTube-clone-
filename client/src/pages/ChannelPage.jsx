import React from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/UI/LoadingSpinner.jsx';

const ChannelPage = () => {
  const { channelId } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4">
            Channel Page Coming Soon
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Channel ID: {channelId}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChannelPage; 
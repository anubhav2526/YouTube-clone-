import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FaHome, FaFire, FaRegCompass, FaMusic, FaGamepad, FaGraduationCap, FaFilm, FaNewspaper, FaFutbol, FaMicrochip, FaPlane, FaUtensils, FaDumbbell, FaUserCircle, FaUpload } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    { name: 'Home', path: '/', icon: <FaHome className="w-5 h-5" /> },
    { name: 'Trending', path: '/trending', icon: <FaFire className="w-5 h-5" /> },
    { name: 'Explore', path: '/explore', icon: <FaRegCompass className="w-5 h-5" /> },
  ];

  const categories = [
    { name: 'Music', path: '/category/Music', icon: <FaMusic className="w-5 h-5" /> },
    { name: 'Gaming', path: '/category/Gaming', icon: <FaGamepad className="w-5 h-5" /> },
    { name: 'Education', path: '/category/Education', icon: <FaGraduationCap className="w-5 h-5" /> },
    { name: 'Entertainment', path: '/category/Entertainment', icon: <FaFilm className="w-5 h-5" /> },
    { name: 'News', path: '/category/News', icon: <FaNewspaper className="w-5 h-5" /> },
    { name: 'Sports', path: '/category/Sports', icon: <FaFutbol className="w-5 h-5" /> },
    { name: 'Technology', path: '/category/Technology', icon: <FaMicrochip className="w-5 h-5" /> },
    { name: 'Travel', path: '/category/Travel', icon: <FaPlane className="w-5 h-5" /> },
    { name: 'Cooking', path: '/category/Cooking', icon: <FaUtensils className="w-5 h-5" /> },
    { name: 'Fitness', path: '/category/Fitness', icon: <FaDumbbell className="w-5 h-5" /> },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar hidden lg:block w-64 fixed top-16 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-20 pt-6">
        <nav className="px-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors duration-200 font-medium text-base ${
                isActive(item.path)
                  ? 'bg-gray-100 dark:bg-gray-800 text-red-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Categories
            </h3>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className={`flex items-center space-x-4 px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                  isActive(category.path)
                    ? 'bg-gray-100 dark:bg-gray-800 text-red-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </Link>
            ))}
          </div>

          {/* User section */}
          {user && (
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Your Channel
              </h3>
              <Link
                to={`/channel/${user._id}`}
                className={`flex items-center space-x-4 px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                  isActive(`/channel/${user._id}`)
                    ? 'bg-gray-100 dark:bg-gray-800 text-red-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" />
                ) : (
                  <FaUserCircle className="w-6 h-6 text-gray-400" />
                )}
                <span>{user.channelName || user.username}</span>
              </Link>
              <Link
                to="/upload"
                className={`flex items-center space-x-4 px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
                  isActive('/upload')
                    ? 'bg-gray-100 dark:bg-gray-800 text-red-600'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FaUpload className="w-5 h-5" />
                <span>Upload Video</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 pb-6">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Categories */}
            <div className="mt-8">
              <h3 className="px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    onClick={onClose}
                    className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(category.path)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User section */}
            {user && (
              <div className="mt-8">
                <h3 className="px-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Your Channel
                </h3>
                <div className="space-y-1">
                  <Link
                    to={`/channel/${user._id}`}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive(`/channel/${user._id}`)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium">{user.channelName || user.username}</span>
                  </Link>
                  <Link
                    to="/upload"
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                      isActive('/upload')
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium">Upload Video</span>
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
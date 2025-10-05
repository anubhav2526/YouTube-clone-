import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../UI/Button.jsx';
import Input from '../UI/Input.jsx';
import { FaYoutube, FaBars, FaSearch, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header bg-gradient-to-r from-red-600 via-black to-gray-900 shadow-2xl fixed top-0 left-0 right-0 z-30 border-b-4 border-red-700 drop-shadow-lg">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 shadow-md border border-white/20 backdrop-blur"
          >
            <FaBars className="w-7 h-7 text-white" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="relative flex items-center justify-center">
              <FaYoutube className="w-10 h-10 text-white drop-shadow-[0_2px_8px_rgba(255,0,0,0.7)] group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full blur-sm opacity-60"></span>
            </span>
            <span className="text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              YouTube
              <span className="font-light text-red-200 ml-1">3D</span>
            </span>
          </Link>
        </div>

        {/* Center: Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-2 shadow-inner backdrop-blur-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none px-2 py-1 text-white placeholder:text-gray-300 text-lg font-medium"
          />
          <button type="submit" className="p-2 rounded-full bg-red-600 hover:bg-red-700 shadow-lg ml-2 transition-all duration-200">
            <FaSearch className="w-6 h-6 text-white" />
          </button>
        </form>

        {/* Right section: User actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to={`/channel/${user._id}`} className="flex items-center space-x-2 group">
                {user.avatar ? (
                  <span className="relative">
                    <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full border-2 border-red-500 shadow-lg group-hover:scale-105 transition-transform duration-200" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-500 rounded-full blur-sm opacity-60"></span>
                  </span>
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-200 group-hover:text-white transition-colors duration-200" />
                )}
                <span className="hidden md:block text-white font-bold text-lg drop-shadow">{user.channelName || user.username}</span>
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full bg-white/10 hover:bg-red-600 shadow-md border border-white/20 transition-all duration-200" title="Logout">
                <FaSignOutAlt className="w-6 h-6 text-white" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 hover:from-pink-500 hover:to-red-500 transition-all duration-200 border-2 border-white/20">Sign In</Link>
              <Link to="/register" className="px-5 py-2 rounded-full bg-white/10 text-white font-bold border-2 border-red-400 shadow-lg hover:bg-red-600 hover:text-white transition-all duration-200">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong'
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Show error toast
    toast.error(message)
    
    return Promise.reject(error)
  }
)

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

// Video API functions
export const videoAPI = {
  // Get all videos with optional filters
  getVideos: async (params = {}) => {
    const response = await api.get('/videos', { params })
    return response.data
  },

  // Get single video by ID
  getVideo: async (videoId) => {
    const response = await api.get(`/videos/${videoId}`)
    return response.data
  },

  // Upload new video
  uploadVideo: async (videoData) => {
    const response = await api.post('/videos', videoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update video
  updateVideo: async (videoId, videoData) => {
    const response = await api.put(`/videos/${videoId}`, videoData)
    return response.data
  },

  // Delete video
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`)
    return response.data
  },

  // Like/Unlike video
  toggleLike: async (videoId) => {
    const response = await api.post(`/videos/${videoId}/like`)
    return response.data
  },

  // Get video comments
  getComments: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/comments`)
    return response.data
  },

  // Add comment to video
  addComment: async (videoId, commentData) => {
    const response = await api.post(`/videos/${videoId}/comments`, commentData)
    return response.data
  },

  // Delete comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`)
    return response.data
  },

  // Get trending videos
  getTrendingVideos: async () => {
    const response = await api.get('/videos/trending');
    return response.data;
  }
}

// User API functions
export const userAPI = {
  // Get user profile
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  // Get user's videos
  getUserVideos: async (userId) => {
    const response = await api.get(`/users/${userId}/videos`)
    return response.data
  },

  // Update user profile
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  },

  // Subscribe/Unsubscribe to user
  toggleSubscription: async (userId) => {
    const response = await api.post(`/users/${userId}/subscribe`)
    return response.data
  }
}

// Search API functions
export const searchAPI = {
  // Search videos
  searchVideos: async (query, filters = {}) => {
    const response = await api.get('/videos/search', {
      params: { q: query, ...filters }
    })
    return response.data
  }
}

// Utility functions
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export const formatDate = (date) => {
  const now = new Date()
  const videoDate = new Date(date)
  const diffInSeconds = Math.floor((now - videoDate) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
  const years = Math.floor(diffInSeconds / 31536000)
  return `${years} year${years > 1 ? 's' : ''} ago`
}

export default api
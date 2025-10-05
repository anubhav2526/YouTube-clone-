# YouTube Clone - MERN Stack

A full-stack YouTube Clone built with MongoDB, Express.js, React (Vite), and Node.js.

## 🚀 Features

- **User Authentication**: JWT-based login/register system
- **Video Management**: Upload, edit, delete videos
- **Video Player**: Full-featured video player with comments
- **Search & Filters**: Search videos and filter by categories
- **Channel Pages**: User channels with video management
- **Responsive Design**: Mobile-first responsive UI
- **Real-time Comments**: Comment system with real-time updates

## 📁 Project Structure

```
youtube-clone/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS/SCSS files
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
└── package.json          # Root package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Query** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd youtube-clone
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in server directory
   cp server/.env.example server/.env
   # Edit with your MongoDB URI and JWT secret
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📝 Master Prompt for Development

When asking for help with specific components, use this format:

```
"I'm building a full-stack YouTube Clone using the MERN stack (MongoDB, Express.js, React with Vite, Node.js). The project includes user authentication (JWT-based), a video grid homepage, search and category filters, a video player page with comment features, and a channel page where users can upload/manage videos. The app must be fully responsive and follow a modular, scalable folder structure. Please help me build the following component/module:
[Insert your specific need here — e.g., "React component for the Home Page with filter buttons and video grid," or "Express route for registering a new user with password validation and JWT token generation," or "MongoDB schema for videos including comments as subdocuments."]
Follow these constraints:
Use ES Modules (import/export) instead of CommonJS.
Do not use Create React App; use Vite.
Ensure clean, modular folder structure and best practices.
Use JWT for secure authentication and bcrypt for password hashing.
Implement MongoDB models with Mongoose.
Add form validation, error handling, and appropriate HTTP status codes.
Keep code commented and clean.
Once you give the code, also explain:
What each part does.
How to test or integrate it with the rest of the app.
```

## 🎯 Example Prompts

1. **React Home Page UI**: "Help me build a HomePage.jsx React component using Vite. It should have a header with a search bar, a sidebar (toggleable), 6 filter buttons (like Music, Coding, Gaming, etc.), and a grid of video cards displaying title, thumbnail, channel name, and views."

2. **User Registration Route**: "Help me write an Express.js POST /api/auth/register route that accepts username, email, and password, validates input, hashes the password using bcrypt, saves to MongoDB, and returns a JWT token."

3. **MongoDB Schema**: "Write a Mongoose schema for a video document. It should include title, description, videoUrl, thumbnailUrl, uploader, channelId, views, likes, dislikes, comments (subdocuments), and uploadDate."

4. **Protected Route Middleware**: "Give me middleware for Express that verifies a JWT token and attaches the authenticated user to the req.user object."

5. **Channel Page**: "Create a React ChannelPage.jsx that fetches videos from the backend based on channelId and displays them. Authenticated users should be able to upload, edit, and delete videos from here."

## 🔧 Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/youtube-clone
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Videos
- `GET /api/videos` - Get all videos (with pagination/filters)
- `GET /api/videos/:id` - Get single video
- `POST /api/videos` - Upload new video (protected)
- `PUT /api/videos/:id` - Update video (protected)
- `DELETE /api/videos/:id` - Delete video (protected)

### Comments
- `GET /api/videos/:id/comments` - Get video comments
- `POST /api/videos/:id/comments` - Add comment (protected)
- `DELETE /api/comments/:id` - Delete comment (protected)

### Users/Channels
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/videos` - Get user's videos
- `PUT /api/users/:id` - Update user profile (protected)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
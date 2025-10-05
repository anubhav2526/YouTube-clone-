#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying YouTube Clone Setup...\n');

// Define required files and directories
const requiredFiles = [
  // Root files
  'package.json',
  'README.md',
  'setup.sh',
  
  // Server files
  'server/package.json',
  'server/index.js',
  'server/env.example',
  'server/config/database.js',
  'server/middleware/errorHandler.js',
  'server/middleware/auth.js',
  'server/models/User.js',
  'server/models/Video.js',
  'server/models/Comment.js',
  'server/controllers/authController.js',
  'server/controllers/videoController.js',
  'server/routes/auth.js',
  'server/routes/videos.js',
  'server/routes/users.js',
  'server/routes/comments.js',
  
  // Client files
  'client/package.json',
  'client/vite.config.js',
  'client/tailwind.config.js',
  'client/postcss.config.js',
  'client/index.html',
  'client/src/main.jsx',
  'client/src/App.jsx',
  'client/src/index.css',
  'client/src/utils/api.js',
  'client/src/context/AuthContext.jsx',
  'client/src/components/UI/LoadingSpinner.jsx',
  'client/src/components/UI/Button.jsx',
  'client/src/components/UI/Input.jsx',
  'client/src/components/UI/VideoCard.jsx',
  'client/src/components/Layout/Layout.jsx',
  'client/src/components/Layout/Header.jsx',
  'client/src/components/Layout/Sidebar.jsx',
  'client/src/pages/HomePage.jsx',
  'client/src/pages/LoginPage.jsx',
  'client/src/pages/RegisterPage.jsx',
  'client/src/pages/VideoPage.jsx',
  'client/src/pages/ChannelPage.jsx',
  'client/src/pages/SearchPage.jsx',
  'client/src/pages/UploadPage.jsx',
  'client/src/pages/NotFoundPage.jsx'
];

// Check if files exist
let missingFiles = [];
let existingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
  } else {
    missingFiles.push(file);
  }
});

// Display results
console.log(`✅ Found ${existingFiles.length} files`);
console.log(`❌ Missing ${missingFiles.length} files\n`);

if (missingFiles.length > 0) {
  console.log('Missing files:');
  missingFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  console.log('\n❌ Setup is incomplete. Please run the setup script again.');
  process.exit(1);
}

// Check package.json files for required dependencies
console.log('📦 Checking dependencies...\n');

const checkDependencies = (filePath, requiredDeps) => {
  if (!fs.existsSync(filePath)) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    let missing = [];
    requiredDeps.forEach(dep => {
      if (!deps[dep]) {
        missing.push(dep);
      }
    });
    
    if (missing.length > 0) {
      console.log(`❌ ${filePath} missing dependencies: ${missing.join(', ')}`);
      return false;
    } else {
      console.log(`✅ ${filePath} dependencies OK`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
    return false;
  }
};

// Check root dependencies
const rootDeps = ['concurrently'];
checkDependencies('package.json', rootDeps);

// Check server dependencies
const serverDeps = [
  'express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors', 
  'dotenv', 'multer', 'express-validator', 'helmet', 
  'express-rate-limit', 'morgan', 'nodemon'
];
checkDependencies('server/package.json', serverDeps);

// Check client dependencies
const clientDeps = [
  'react', 'react-dom', 'react-router-dom', 'axios', 
  '@tanstack/react-query', 'react-hot-toast', 'react-icons', 
  'react-player', 'date-fns', 'clsx', 'vite', 'tailwindcss'
];
checkDependencies('client/package.json', clientDeps);

console.log('\n🎉 Verification Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Run: chmod +x setup.sh && ./setup.sh');
console.log('2. Create server/.env file with your MongoDB URI and JWT secret');
console.log('3. Start MongoDB (if running locally)');
console.log('4. Run: npm run dev');
console.log('5. Open http://localhost:5173 in your browser');
console.log('\n🚀 Your YouTube Clone is ready to launch!'); 
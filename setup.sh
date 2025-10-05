#!/bin/bash

echo "🚀 Setting up YouTube Clone - MERN Stack"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server/uploads
mkdir -p server/config
mkdir -p server/controllers
mkdir -p server/middleware
mkdir -p server/models
mkdir -p server/routes
mkdir -p server/utils

mkdir -p client/src/components/UI
mkdir -p client/src/components/Layout
mkdir -p client/src/components/Video
mkdir -p client/src/components/Auth
mkdir -p client/src/pages
mkdir -p client/src/hooks
mkdir -p client/src/context
mkdir -p client/src/utils
mkdir -p client/src/styles

echo "✅ Directories created"

# Install dependencies
echo "📦 Installing dependencies..."
echo "Installing root dependencies..."
npm install

echo "Installing server dependencies..."
cd server && npm install && cd ..

echo "Installing client dependencies..."
cd client && npm install && cd ..

echo "✅ Dependencies installed"

# Create environment file
echo "🔧 Setting up environment variables..."
if [ ! -f server/.env ]; then
    cp server/env.example server/.env
    echo "✅ Environment file created at server/.env"
    echo "⚠️  Please edit server/.env with your MongoDB URI and JWT secret"
else
    echo "✅ Environment file already exists"
fi

# Create .gitignore
echo "📝 Creating .gitignore files..."
cat > .gitignore << EOL
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploads
server/uploads/*
!server/uploads/.gitkeep

# MongoDB
*.db
*.sqlite
EOL

echo "✅ .gitignore created"

# Create uploads .gitkeep
echo "📁 Creating uploads directory..."
touch server/uploads/.gitkeep

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your MongoDB URI and JWT secret"
echo "2. Start MongoDB (if running locally)"
echo "3. Run 'npm run dev' to start both servers"
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Check the README.md for more information and the master prompt for development"
echo ""
echo "Happy coding! 🚀" 
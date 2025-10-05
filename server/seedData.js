import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Video from './models/Video.js';

dotenv.config();

const mockUsers = [
  {
    username: 'techguru',
    email: 'techguru@example.com',
    password: 'password123',
    channelName: 'Tech Guru',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    channelDescription: 'Latest tech tutorials and reviews'
  },
  {
    username: 'cookingmaster',
    email: 'cooking@example.com',
    password: 'password123',
    channelName: 'Cooking Master',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    channelDescription: 'Delicious recipes and cooking tips'
  },
  {
    username: 'gamingpro',
    email: 'gaming@example.com',
    password: 'password123',
    channelName: 'Gaming Pro',
    avatar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=150&fit=crop&crop=face',
    channelDescription: 'Gaming content and walkthroughs'
  }
];

const mockVideos = [
  {
    title: 'React Tutorial for Beginners - Complete Course 2024',
    description: 'Learn React from scratch with this comprehensive tutorial. We cover everything from basic concepts to advanced patterns.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=320&h=180&fit=crop',
    category: 'Education',
    tags: ['react', 'javascript', 'tutorial', 'web development'],
    duration: 1800,
    views: 15420,
    likes: 892,
    dislikes: 23
  },
  {
    title: 'How to Make Perfect Pasta Carbonara',
    description: 'Master the art of making authentic Italian pasta carbonara with this step-by-step guide.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=320&h=180&fit=crop',
    category: 'Cooking',
    tags: ['pasta', 'carbonara', 'italian', 'cooking'],
    duration: 900,
    views: 8920,
    likes: 567,
    dislikes: 12
  },
  {
    title: 'Minecraft Survival Guide - Episode 1',
    description: 'Start your Minecraft survival journey with this comprehensive guide for beginners.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=320&h=180&fit=crop',
    category: 'Gaming',
    tags: ['minecraft', 'survival', 'gaming', 'tutorial'],
    duration: 2400,
    views: 23450,
    likes: 1234,
    dislikes: 45
  },
  {
    title: 'JavaScript ES6+ Features You Need to Know',
    description: 'Explore modern JavaScript features including arrow functions, destructuring, and async/await.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=320&h=180&fit=crop',
    category: 'Education',
    tags: ['javascript', 'es6', 'programming', 'web development'],
    duration: 1200,
    views: 18760,
    likes: 945,
    dislikes: 34
  },
  {
    title: 'Quick 15-Minute Workout for Beginners',
    description: 'Get fit with this quick and effective workout routine perfect for beginners.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=180&fit=crop',
    category: 'Fitness',
    tags: ['workout', 'fitness', 'exercise', 'health'],
    duration: 900,
    views: 12560,
    likes: 678,
    dislikes: 15
  },
  {
    title: 'Travel Guide: Tokyo in 3 Days',
    description: 'Experience the best of Tokyo with this comprehensive 3-day travel guide.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=320&h=180&fit=crop',
    category: 'Travel',
    tags: ['tokyo', 'travel', 'japan', 'vacation'],
    duration: 1800,
    views: 9870,
    likes: 456,
    dislikes: 8
  },
  {
    title: 'Latest Tech News - AI Breakthroughs 2024',
    description: 'Stay updated with the latest technology news and AI breakthroughs happening in 2024.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=320&h=180&fit=crop',
    category: 'Technology',
    tags: ['ai', 'technology', 'news', 'breakthroughs'],
    duration: 600,
    views: 45670,
    likes: 2345,
    dislikes: 67
  },
  {
    title: 'Classic Rock Guitar Solos - Learn to Play',
    description: 'Master classic rock guitar solos with this comprehensive tutorial for intermediate players.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=320&h=180&fit=crop',
    category: 'Music',
    tags: ['guitar', 'rock', 'music', 'tutorial'],
    duration: 1500,
    views: 32100,
    likes: 1789,
    dislikes: 89
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Video.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of mockUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Create videos and assign to users
    for (let i = 0; i < mockVideos.length; i++) {
      const videoData = mockVideos[i];
      const user = createdUsers[i % createdUsers.length];
      
      const video = new Video({
        ...videoData,
        uploader: user._id,
        channelId: user._id,
        likes: Array.from({ length: videoData.likes }, () => user._id),
        dislikes: Array.from({ length: videoData.dislikes }, () => user._id)
      });
      
      await video.save();
      console.log(`🎥 Created video: ${video.title}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${mockVideos.length} videos`);
    
    // Display sample data
    console.log('\n📋 Sample Users:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email})`);
    });

    console.log('\n📋 Sample Videos:');
    const videos = await Video.find().populate('uploader', 'username');
    videos.forEach(video => {
      console.log(`  - ${video.title} by ${video.uploader.username}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seed function
seedDatabase(); 
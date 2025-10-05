import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './components/Layout/Layout.jsx'
import LoadingSpinner from './components/UI/LoadingSpinner.jsx'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const VideoPage = lazy(() => import('./pages/VideoPage.jsx'))
const ChannelPage = lazy(() => import('./pages/ChannelPage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'))
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'))
const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/channel/:channelId" element={<ChannelPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/upload" element={<UploadPage />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  )
}

export default App 
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home, { CreateThemeModal } from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import ProfileInfo from './pages/ProfileInfo'
import Leaderboard from './pages/Leaderboard'
import ThemePage from './pages/ThemePage'
import ThemeFeed from './pages/ThemeFeed'
import PostDetail from './pages/PostDetail'
import MoodleThemes from './pages/MoodleThemes'
import RecommendPage from './pages/RecommendPage'
import WeroastPage from './pages/WeroastPage'
import FriendsPlaceholder from './pages/FriendsPlaceholder'
import FeedbackPlaceholder from './pages/FeedbackPlaceholder'
import VipPlaceholder from './pages/VipPlaceholder'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import useAuth from './store/useAuth'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function MessagesPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#888888]">
      <span className="text-5xl mb-4">💬</span>
      <p className="text-lg font-semibold text-[#555555]">消息功能即将上线</p>
      <p className="text-sm mt-1">好友系统正在开发中</p>
    </div>
  )
}

function AppInner() {
  const { token, fetchMe } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { if (token) fetchMe() }, [])

  function handleOpenCreate() {
    navigate('/')
    setShowCreate(true)
  }

  return (
    <div className="min-h-screen bg-[#f5faf5]">
      <Navbar onOpenCreate={handleOpenCreate} />
      <Toast />
      <Routes>
        <Route path="/" element={<Home onOpenCreate={handleOpenCreate} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/theme/:id" element={<ThemePage />} />
        <Route path="/theme-feed/:id" element={<ThemeFeed />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/messages" element={<MessagesPlaceholder />} />
        <Route path="/moodle-themes" element={<MoodleThemes />} />
        <Route path="/recommend" element={<RecommendPage />} />
        <Route path="/weroast" element={<WeroastPage />} />
        <Route path="/friends" element={<FriendsPlaceholder />} />
        <Route path="/feedback" element={<FeedbackPlaceholder />} />
        <Route path="/vip" element={<VipPlaceholder />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/profile-info" element={<PrivateRoute><ProfileInfo /></PrivateRoute>} />
      </Routes>
      {showCreate && (
        <CreateThemeModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

export default App

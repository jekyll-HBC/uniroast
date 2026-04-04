import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home, { CreateThemeModal } from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import ThemePage from './pages/ThemePage'
import ThemeFeed from './pages/ThemeFeed'
import PostDetail from './pages/PostDetail'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import useAuth from './store/useAuth'
import useHomeTab from './store/useHomeTab'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function MessagesPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#4a4a5a]">
      <span className="text-5xl mb-4">💬</span>
      <p className="text-lg font-semibold text-[#8888a0]">消息功能即将上线</p>
      <p className="text-sm mt-1">好友系统正在开发中</p>
    </div>
  )
}

function AppInner() {
  const { token, fetchMe } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const { setTab } = useHomeTab()
  const navigate = useNavigate()

  useEffect(() => { if (token) fetchMe() }, [])

  function handleOpenCreate() {
    navigate('/')
    setShowCreate(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onOpenCreate={handleOpenCreate} />
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/theme/:id" element={<ThemePage />} />
        <Route path="/theme-feed/:id" element={<ThemeFeed />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/messages" element={<MessagesPlaceholder />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
      {showCreate && (
        <CreateThemeModal
          onClose={() => setShowCreate(false)}
          onCreated={t => {
            if (t.active_date) setTab('today')
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

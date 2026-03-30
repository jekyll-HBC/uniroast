import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import ThemePage from './pages/ThemePage'
import PostDetail from './pages/PostDetail'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import useAuth from './store/useAuth'

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

function App() {
  const { token, fetchMe } = useAuth()
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { if (token) fetchMe() }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar onOpenCreate={() => setShowCreate(true)} />
        <Toast />
        <Routes>
          <Route path="/" element={<Home showCreate={showCreate} onCloseCreate={() => setShowCreate(false)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/theme/:id" element={<ThemePage />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/messages" element={<MessagesPlaceholder />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App

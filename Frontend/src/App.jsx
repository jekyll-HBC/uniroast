import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import ThemePage from './pages/ThemePage'
import PostDetail from './pages/PostDetail'
import Navbar, { TopBar, BottomNav } from './components/Navbar'
import useAuth from './store/useAuth'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function App() {
  const { token, fetchMe } = useAuth()
  useEffect(() => { if (token) fetchMe() }, [])
  return (
    <BrowserRouter>
      <div className="flex flex-col h-screen bg-gray-50">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/theme/:id" element={<ThemePage />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
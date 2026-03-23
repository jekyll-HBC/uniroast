import { Link, useNavigate } from 'react-router-dom'
import { Home, User, LogIn, LogOut, Trophy } from 'lucide-react'
import { useEffect } from 'react'
import useAuth from '../store/useAuth'

export default function Navbar() {
  const { user, token, logout, fetchMe } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🔥</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              UniRoast
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600">
              <Home size={20} />
              <span>首页</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600">
              <Trophy size={20} />
              <span>排行榜</span>
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-purple-600">
                  <User size={20} />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                >
                  <LogOut size={20} />
                  <span>退出</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                <LogIn size={20} />
                <span>登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

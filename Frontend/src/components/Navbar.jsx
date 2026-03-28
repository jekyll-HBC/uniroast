import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, User, LogIn, Trophy } from 'lucide-react'
import { useEffect } from 'react'
import useAuth from '../store/useAuth'

export default function Navbar() {
  const { user, token, fetchMe } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [])

  const active = (path) =>
    location.pathname === path
      ? 'text-purple-600'
      : 'text-gray-400'

  return (
    <>
      {/* 顶部 Logo 栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-1.5">
          <span className="text-2xl">🔥</span>
          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            UniRoast
          </span>
        </Link>
        {!user && (
          <Link
            to="/login"
            className="flex items-center space-x-1 bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
          >
            <LogIn size={16} />
            <span>登录</span>
          </Link>
        )}
      </header>

      {/* 底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className={`flex flex-col items-center py-2 px-6 ${active('/')}`}>
            <Home size={24} />
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center py-2 px-6 ${active('/leaderboard')}`}>
            <Trophy size={24} />
            <span className="text-xs mt-0.5">排行榜</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center py-2 px-6 ${active('/profile')}`}
          >
            {user ? (
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                className="w-7 h-7 rounded-full"
                alt=""
                loading="lazy"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` }}
              />
            ) : (
              <User size={24} />
            )}
            <span className="text-xs mt-0.5">{user ? user.username : '我的'}</span>
          </Link>
        </div>
      </nav>

      {/* 底部占位，防止内容被 Tab Bar 遮住 */}
      <div className="h-20" />
    </>
  )
}

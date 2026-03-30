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

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* 顶部 Logo 栏 — 毛玻璃暗底 */}
      <header className="glass-dark card-border border-x-0 border-t-0 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-1.5">
          <span className="text-2xl">🔥</span>
          <span className="text-lg font-bold bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
            UniRoast
          </span>
        </Link>
        {!user && (
          <Link
            to="/login"
            className="flex items-center space-x-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
          >
            <LogIn size={16} />
            <span>登录</span>
          </Link>
        )}
      </header>

      {/* 底部 Tab Bar — 毛玻璃暗底 */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/8 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className={`flex flex-col items-center py-2 px-6 transition-colors ${isActive('/') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}>
            <Home size={24} />
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center py-2 px-6 transition-colors ${isActive('/leaderboard') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}>
            <Trophy size={24} />
            <span className="text-xs mt-0.5">排行榜</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center py-2 px-6 transition-colors ${isActive('/profile') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}
          >
            {user ? (
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                className={`w-7 h-7 rounded-full ${isActive('/profile') ? 'ring-2 ring-[#a855f7]' : ''}`}
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
    </>
  )
}

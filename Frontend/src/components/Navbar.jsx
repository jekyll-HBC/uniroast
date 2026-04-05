import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, User, LogIn, Trophy, MessageCircle } from 'lucide-react'
import { useEffect } from 'react'
import useAuth from '../store/useAuth'

export default function Navbar({ onOpenCreate }) {
  const { user, token, fetchMe } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && !user) fetchMe()
  }, [])

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* 顶部 Logo 栏 */}
      <header className="glass-dark card-border border-x-0 border-t-0 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between relative">
          <div className="w-20" />
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-1.5">
            <span className="text-xl">🔥</span>
            <span className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-[#1a7a1a] via-[#2d8c2d] to-[#3da03d] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(26,122,26,0.3)]">
              WeRoast
            </span>
          </Link>
          {!user && (
            <Link
              to="/login"
              className="flex items-center space-x-1 bg-gradient-to-r from-[#1a7a1a] to-[#2d8c2d] text-white px-4 py-1.5 rounded-lg text-sm font-semibold"
            >
              <LogIn size={16} />
              <span>登录</span>
            </Link>
          )}
          {user && <div className="w-20" />}
        </div>

      </header>

      {/* 底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-black/8 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-1">
          <Link to="/" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/') ? 'text-[#1a7a1a]' : 'text-[#888888]'}`}>
            <Home size={22} />
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/leaderboard') ? 'text-[#1a7a1a]' : 'text-[#888888]'}`}>
            <Trophy size={22} />
            <span className="text-xs mt-0.5">战绩榜</span>
          </Link>

          {/* 中间 ➕ 出题按钮 */}
          <button
            onClick={() => {
              if (!user) { navigate('/login'); return }
              onOpenCreate?.()
            }}
            className="flex flex-col items-center py-1 px-2"
          >
            <span className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1a7a1a] to-[#2d8c2d] flex items-center justify-center shadow-lg shadow-green-700/30 -mt-4">
              <span className="text-white text-2xl font-light leading-none">+</span>
            </span>
          </button>

          <Link to="/messages" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/messages') ? 'text-[#1a7a1a]' : 'text-[#888888]'}`}>
            <MessageCircle size={22} />
            <span className="text-xs mt-0.5">消息</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/profile') ? 'text-[#1a7a1a]' : 'text-[#888888]'}`}
          >
            {user ? (
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                className={`w-6 h-6 rounded-full ${isActive('/profile') ? 'ring-2 ring-[#1a7a1a]' : ''}`}
                alt=""
                loading="lazy"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` }}
              />
            ) : (
              <User size={22} />
            )}
            <span className="text-xs mt-0.5">{user ? user.username : '我的'}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

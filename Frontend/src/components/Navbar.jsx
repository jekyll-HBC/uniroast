import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, User, Trophy, MessageCircle } from 'lucide-react'
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
      {/* 底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-white/10 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-1">
          <Link to="/" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/') ? 'text-[#4CAF50]' : 'text-[#666]'}`}>
            <Home size={22} />
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/leaderboard') ? 'text-[#4CAF50]' : 'text-[#666]'}`}>
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

          <Link to="/messages" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/messages') ? 'text-[#4CAF50]' : 'text-[#666]'}`}>
            <MessageCircle size={22} />
            <span className="text-xs mt-0.5">消息</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/profile') ? 'text-[#4CAF50]' : 'text-[#666]'}`}
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
            <span className="text-xs mt-0.5 text-inherit">{user ? user.username : '我的'}</span>
          </Link>
        </div>
      </nav>
    </>
  )
}

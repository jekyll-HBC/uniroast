import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Home, User, LogIn, Trophy, MessageCircle } from 'lucide-react'
import { useEffect } from 'react'
import useAuth from '../store/useAuth'
import useHomeTab from '../store/useHomeTab'

export default function Navbar({ onOpenCreate }) {
  const { user, token, fetchMe } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { tab, setTab } = useHomeTab()

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
            <span className="text-xl font-black tracking-widest uppercase bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f97316] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
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
          {user && <div className="w-20" />}
        </div>

        {/* 首页 Tab 栏（仅首页显示，X 风格） */}
        {isHome && (
          <div className="flex border-t border-white/8">
            {[['recommend', '推荐'], ['today', '今日主题'], ['all', '全部主题']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-semibold relative transition-colors"
                style={{ color: tab === t ? '#f0f0f5' : '#4a4a5a' }}
              >
                {label}
                {tab === t && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/8 z-50 safe-area-pb">
        <div className="flex items-center justify-around py-1">
          <Link to="/" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}>
            <Home size={22} />
            <span className="text-xs mt-0.5">首页</span>
          </Link>
          <Link to="/leaderboard" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/leaderboard') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}>
            <Trophy size={22} />
            <span className="text-xs mt-0.5">排行榜</span>
          </Link>

          {/* 中间 ➕ 出题按钮 */}
          <button
            onClick={() => {
              if (!user) { navigate('/login'); return }
              onOpenCreate?.()
            }}
            className="flex flex-col items-center py-1 px-2"
          >
            <span className="w-12 h-12 rounded-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] flex items-center justify-center shadow-lg shadow-purple-500/30 -mt-4">
              <span className="text-white text-2xl font-light leading-none">+</span>
            </span>
          </button>

          <Link to="/messages" className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/messages') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}>
            <MessageCircle size={22} />
            <span className="text-xs mt-0.5">消息</span>
          </Link>
          <Link
            to={user ? '/profile' : '/login'}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${isActive('/profile') ? 'text-[#a855f7]' : 'text-[#4a4a5a]'}`}
          >
            {user ? (
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                className={`w-6 h-6 rounded-full ${isActive('/profile') ? 'ring-2 ring-[#a855f7]' : ''}`}
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

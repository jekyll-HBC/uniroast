import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import useHomeTab from '../store/useHomeTab'
import TierBadge from '../components/TierBadge'

export function CreateThemeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', emoji: '🔥', description: '', set_today: false })
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const payload = { title: form.title, emoji: form.emoji, description: form.description || null }
      if (form.set_today) {
        const today = new Date().toISOString().split('T')[0]
        payload.active_date = today
      }
      const { data } = await api.post('/themes/', payload)
      onCreated(data)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] card-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#f0f0f5]">创建新主题</h3>
          <button onClick={onClose}><X size={20} className="text-[#4a4a5a]" /></button>
        </div>
        <div className="flex space-x-2 mb-3">
          <input
            value={form.emoji}
            onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
            className="w-16 bg-[#22222f] border border-white/10 rounded-xl px-3 py-2 text-center text-xl focus:outline-none focus:border-[#a855f7] text-[#f0f0f5]"
            maxLength={2}
          />
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="主题名称"
            className="flex-1 bg-[#22222f] border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#a855f7] text-[#f0f0f5] placeholder-[#4a4a5a]"
          />
        </div>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="描述一下这个主题（可选）"
          rows={2}
          className="w-full bg-[#22222f] border border-white/10 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#a855f7] mb-3 text-[#f0f0f5] placeholder-[#4a4a5a]"
        />
        <label className="flex items-center space-x-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={form.set_today}
            onChange={e => setForm(f => ({ ...f, set_today: e.target.checked }))}
            className="w-4 h-4 accent-[#a855f7]"
          />
          <span className="text-sm text-[#8888a0]">设为今日主题</span>
        </label>
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim() || loading}
          className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? '创建中...' : '创建'}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const [themes, setThemes] = useState([])
  const [todayThemes, setTodayThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const { tab, setTab } = useHomeTab()
  const navigate = useNavigate()

  // 滑动手势
  const touchStartX = useRef(null)
  function onTouchStart(e) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) setTab(dx < 0 ? 'all' : 'today')
    touchStartX.current = null
  }

  useEffect(() => {
    Promise.all([
      api.get('/themes/?today=true'),
      api.get('/themes/'),
    ]).then(([todayRes, allRes]) => {
      setTodayThemes(todayRes.data)
      setThemes(allRes.data)
      if (todayRes.data.length === 0) setTab('all')
    }).finally(() => setLoading(false))
  }, [])

  const displayed = tab === 'today' ? todayThemes : themes

  return (
    <div
      className="max-w-lg mx-auto py-4 px-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#1a1a24] rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(theme => (
            <button
              key={theme.id}
              onClick={() => navigate(`/theme/${theme.id}`)}
              className="w-full bg-[#1a1a24] card-border rounded-2xl p-4 flex items-center space-x-4 hover:bg-[#22222f] transition text-left"
            >
              <span className="text-4xl">{theme.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-[#f0f0f5] truncate">{theme.title}</p>
                  {theme.is_official && (
                    <span className="text-xs bg-[#a855f7]/20 text-[#a855f7] px-2 py-0.5 rounded-full shrink-0">官方</span>
                  )}
                </div>
                {theme.description && (
                  <p className="text-sm text-[#8888a0] truncate mt-0.5">{theme.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[#a855f7]">{theme.post_count}</p>
                <p className="text-xs text-[#4a4a5a]">参战</p>
              </div>
            </button>
          ))}
          {displayed.length === 0 && (
            <div className="text-center py-20 text-[#4a4a5a]">
              {tab === 'today' ? '今日暂无主题，管理员还没出题' : '还没有主题，快来出题！'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

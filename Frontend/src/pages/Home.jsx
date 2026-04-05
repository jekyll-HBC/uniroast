import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import api from '../api'

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function calc() {
      const now = new Date()
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      const diff = end - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])
  return timeLeft
}

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
      <div className="bg-white card-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1a1a1a]">创建新主题</h3>
          <button onClick={onClose}><X size={20} className="text-[#888888]" /></button>
        </div>
        <div className="flex space-x-2 mb-3">
          <input
            value={form.emoji}
            onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
            className="w-16 bg-[#e8f5e8] border border-black/10 rounded-xl px-3 py-2 text-center text-xl focus:outline-none focus:border-[#1a7a1a] text-[#1a1a1a]"
            maxLength={2}
          />
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="主题名称"
            className="flex-1 bg-[#e8f5e8] border border-black/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#1a7a1a] text-[#1a1a1a] placeholder-[#888888]"
          />
        </div>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="描述一下这个主题（可选）"
          rows={2}
          className="w-full bg-[#e8f5e8] border border-black/10 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#1a7a1a] mb-3 text-[#1a1a1a] placeholder-[#888888]"
        />
        <label className="flex items-center space-x-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={form.set_today}
            onChange={e => setForm(f => ({ ...f, set_today: e.target.checked }))}
            className="w-4 h-4 accent-[#1a7a1a]"
          />
          <span className="text-sm text-[#555555]">设为今日主题</span>
        </label>
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim() || loading}
          className="w-full bg-gradient-to-r from-[#1a7a1a] to-[#2d8c2d] text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          {loading ? '创建中...' : '创建'}
        </button>
      </div>
    </div>
  )
}

export default function Home({ onOpenCreate }) {
  const [themes, setThemes] = useState([])
  const [todayThemes, setTodayThemes] = useState([])
  const [themeTab, setThemeTab] = useState('today')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/themes/?today=true'),
      api.get('/themes/'),
    ]).then(([todayRes, allRes]) => {
      setTodayThemes(todayRes.data)
      setThemes(allRes.data)
    })
  }, [])

  async function handleRandomRoast() {
    try {
      const { data } = await api.get('/posts/?limit=100')
      if (!data.length) return
      navigate(`/post/${data[Math.floor(Math.random() * data.length)].id}`)
    } catch {}
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Green header */}
      <div className="bg-gradient-to-r from-[#1a7a1a] to-[#2d8c2d] px-4 pt-4 pb-6">
        <div className="flex items-center justify-center mb-4">
          <span className="text-2xl font-black text-white tracking-widest">WeRoast</span>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 flex justify-around">
          <button onClick={() => navigate('/recommend')} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-[#4CAF50] flex items-center justify-center text-2xl">⭐</div>
            <span className="text-white text-xs">推薦</span>
          </button>
          <button onClick={() => navigate('/weroast')} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35] flex items-center justify-center text-2xl">🔥</div>
            <span className="text-white text-xs">WeRoast</span>
          </button>
        </div>
      </div>

      {/* App icon grid */}
      <div className="bg-white rounded-2xl mx-4 -mt-3 p-4 card-border">
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: '🎓', label: 'Moodle',    onClick: () => navigate('/moodle-themes') },
            { emoji: '📝', label: '我的帖子',  onClick: () => navigate('/profile') },
            { emoji: '🔥', label: '今日最熱',  onClick: () => navigate('/leaderboard') },
            { emoji: '🎲', label: '隨機Roast', onClick: handleRandomRoast },
            { emoji: '✏️', label: '發帖',      onClick: () => onOpenCreate?.() },
            { emoji: '📣', label: '意見反饋',  onClick: () => navigate('/feedback') },
            { emoji: '👥', label: '好友',      onClick: () => navigate('/friends') },
            { emoji: '👑', label: '會員',      onClick: () => navigate('/vip') },
          ].map(({ emoji, label, onClick }) => (
            <button key={label} onClick={onClick} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 flex items-center justify-center text-xl"
                style={{ clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)', background: '#e8f5e8' }}>
                {emoji}
              </div>
              <span className="text-[10px] text-[#333] text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme list */}
      <div className="bg-white rounded-2xl mx-4 mt-3 mb-24 p-4 card-border">
        <div className="flex items-center gap-4 mb-3">
          {[['today','今日主題'],['all','每日主題']].map(([t, label]) => (
            <button key={t} onClick={() => setThemeTab(t)}
              className={`text-sm font-bold pb-1 ${themeTab === t ? 'text-[#1a7a1a] border-b-2 border-[#1a7a1a]' : 'text-[#aaa]'}`}>
              {label}
            </button>
          ))}
          <button onClick={() => navigate('/moodle-themes')} className="ml-auto text-xs text-[#aaa]">更多 ›</button>
        </div>
        {(themeTab === 'today' ? todayThemes : themes).map(theme => (
          <button key={theme.id} onClick={() => navigate(`/theme/${theme.id}`)}
            className="w-full flex items-start gap-2 py-2 border-b border-[#f5f5f5] last:border-0 text-left">
            <span className="w-2 h-2 rounded-full bg-[#1a7a1a] mt-1.5 shrink-0" />
            <div>
              <p className="text-sm text-[#333]">{theme.title}</p>
              <p className="text-xs text-[#aaa] mt-0.5">
                {new Date(theme.created_at).toLocaleDateString('zh-CN')} · 👁 {theme.post_count}
              </p>
            </div>
          </button>
        ))}
        {(themeTab === 'today' ? todayThemes : themes).length === 0 && (
          <p className="text-center text-[#888] py-8 text-sm">暫無主題</p>
        )}
      </div>
    </div>
  )
}

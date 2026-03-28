import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'

function CreateThemeModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', emoji: '🔥', description: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/themes/', form)
      onCreated(data)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">创建新主题</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="flex space-x-2 mb-3">
          <input
            value={form.emoji}
            onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
            className="w-16 border border-gray-200 rounded-xl px-3 py-2 text-center text-xl focus:outline-none focus:border-purple-400"
            maxLength={2}
          />
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="主题名称"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400"
          />
        </div>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="描述一下这个主题（可选）"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-purple-400 mb-4"
        />
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim() || loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
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
  const [tab, setTab] = useState('today') // 'today' | 'all'
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/themes/?today=true'),
      api.get('/themes/'),
    ]).then(([todayRes, allRes]) => {
      setTodayThemes(todayRes.data)
      setThemes(allRes.data)
      // 如果没有今日主题，默认显示全部
      if (todayRes.data.length === 0) setTab('all')
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">🔥 主题</h1>
        {user && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            <Plus size={16} />
            <span>出题</span>
          </button>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setTab('today')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'today' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          今日主题
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          全部主题
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : (
        <div className="space-y-3">
          {(tab === 'today' ? todayThemes : themes).map(theme => (
            <button
              key={theme.id}
              onClick={() => navigate(`/theme/${theme.id}`)}
              className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4 hover:shadow-md transition text-left"
            >
              <span className="text-4xl">{theme.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-gray-800 truncate">{theme.title}</p>
                  {theme.is_official && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full shrink-0">官方</span>
                  )}
                </div>
                {theme.description && (
                  <p className="text-sm text-gray-400 truncate mt-0.5">{theme.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-purple-600">{theme.post_count}</p>
                <p className="text-xs text-gray-400">参战</p>
              </div>
            </button>
          ))}
          {(tab === 'today' ? todayThemes : themes).length === 0 && (
            <div className="text-center py-20 text-gray-400">
              {tab === 'today' ? '今日暂无主题，管理员还没出题' : '还没有主题，快来出题！'}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateThemeModal
          onClose={() => setShowCreate(false)}
          onCreated={t => setThemes(ts => [t, ...ts])}
        />
      )}
    </div>
  )
}

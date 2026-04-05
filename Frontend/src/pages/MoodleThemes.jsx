import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function MoodleThemes() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => { api.get('/themes/').then(r => setThemes(r.data)).finally(() => setLoading(false)) }, [])
  if (loading) return <div className="px-4 py-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-[#e8eaf6] rounded-lg animate-pulse" />)}</div>
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#3b5998] px-4 py-3 flex items-center gap-3">
        <span className="text-white font-bold text-lg">≡</span>
        <span className="text-white font-bold flex-1 text-center">Dashboard</span>
        <span className="text-white text-sm">🔔 ✉ 👤</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-sm text-[#555] mb-3">Course overview</p>
        <div className="flex gap-2 mb-4 text-xs flex-wrap">
          <span className="border border-[#aaa] rounded px-2 py-1">▼ In progress</span>
          <span className="border border-[#aaa] rounded px-2 py-1">↕ Theme name</span>
          <span className="border border-[#aaa] rounded px-2 py-1">⊞ List</span>
        </div>
        <div className="space-y-3 pb-24">
          {themes.map(theme => (
            <button key={theme.id} onClick={() => navigate(`/theme-feed/${theme.id}`)}
              className="w-full border border-[#ddd] rounded-lg p-3 text-left hover:bg-[#f5f5f5] transition">
              <p className="text-xs text-[#3b5998] font-semibold uppercase mb-1">FACULTY OF INNOVATION ENGINEERING (FIE)</p>
              <p className="font-bold text-[#333] mb-2">{theme.emoji} {theme.title}</p>
              <div className="w-full bg-[#e0e0e0] rounded-full h-2 mb-1">
                <div className="bg-[#3b5998] h-2 rounded-full"
                  style={{ width: `${Math.min(100, (theme.post_count / 20) * 100)}%` }} />
              </div>
              <p className="text-xs text-[#555]">{theme.post_count} 人参战</p>
            </button>
          ))}
          {themes.length === 0 && <p className="text-center text-[#888] py-20">No courses found</p>}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function WeroastPage() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    api.get('/themes/?today=true')
      .then(r => setThemes(r.data))
      .finally(() => setLoading(false))
  }, [])
  if (loading) return <div className="space-y-3 px-4 py-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-[#e8f5e8] rounded-2xl animate-pulse" />)}</div>
  return (
    <div className="max-w-lg mx-auto py-4 px-4 space-y-3">
      {themes.map(theme => (
        <button key={theme.id} onClick={() => navigate(`/theme/${theme.id}`)}
          className="w-full bg-white card-border rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-[#e8f5e8] transition">
          <span className="text-4xl">{theme.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#1a1a1a] truncate">{theme.title}</p>
            {theme.description && <p className="text-sm text-[#555] truncate mt-0.5">{theme.description}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-[#1a7a1a]">{theme.post_count}</p>
            <p className="text-xs text-[#888]">参战</p>
          </div>
        </button>
      ))}
      {themes.length === 0 && <p className="text-center text-[#888] py-20">今日暫無主題</p>}
    </div>
  )
}

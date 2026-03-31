import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import api from '../api'
import TierBadge from '../components/TierBadge'

export default function Leaderboard() {
  const [entries, setEntries] = useState([])
  const [themes, setThemes] = useState([])
  const [seasons, setSeasons] = useState([])
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [selectedSeason, setSelectedSeason] = useState(null) // null = 当前赛季
  const [currentSeason, setCurrentSeason] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/themes/'),
      api.get('/seasons/current'),
      api.get('/seasons/history'),
    ]).then(([themesRes, curRes, histRes]) => {
      setThemes(themesRes.data)
      setCurrentSeason(curRes.data)
      setSeasons(histRes.data)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedSeason
      ? `/seasons/${selectedSeason}/leaderboard`
      : `/seasons/current/leaderboard${selectedTheme ? `?theme_id=${selectedTheme}` : ''}`
    api.get(url)
      .then(({ data }) => setEntries(data))
      .finally(() => setLoading(false))
  }, [selectedTheme, selectedSeason])

  const medal = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className="max-w-lg mx-auto py-4 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="text-yellow-500" size={24} />
          <h1 className="text-xl font-bold text-[#f0f0f5]">排行榜</h1>
        </div>
        {currentSeason && (
          <span className="text-xs text-[#8888a0]">
            第 {currentSeason.number} 赛季 · {currentSeason.end_date} 截止
          </span>
        )}
      </div>

      {/* 赛季切换 */}
      {seasons.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setSelectedSeason(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition
              ${!selectedSeason ? 'bg-[#a855f7] text-white' : 'bg-[#22222f] text-[#8888a0]'}`}
          >
            本赛季
          </button>
          {seasons.filter(s => !s.is_active).map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition
                ${selectedSeason === s.id ? 'bg-[#a855f7] text-white' : 'bg-[#22222f] text-[#8888a0]'}`}
            >
              第 {s.number} 赛季
            </button>
          ))}
        </div>
      )}

      {/* 主题筛选（仅当前赛季） */}
      {!selectedSeason && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedTheme(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition
              ${!selectedTheme ? 'bg-[#a855f7] text-white' : 'bg-[#22222f] text-[#8888a0]'}`}
          >
            全部
          </button>
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(t.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition
                ${selectedTheme === t.id ? 'bg-[#a855f7] text-white' : 'bg-[#22222f] text-[#8888a0]'}`}
            >
              {t.emoji} {t.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-[#1a1a24] rounded-2xl animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-[#4a4a5a]">还没有数据</div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <button
              key={entry.post.id}
              onClick={() => navigate(`/post/${entry.post.id}`)}
              className={`w-full bg-[#1a1a24] rounded-2xl p-3 flex items-center space-x-3 card-border text-left hover:bg-[#22222f] transition
                ${entry.rank <= 3 ? 'ring-1 ring-yellow-500/30' : ''}`}
            >
              <span className="text-2xl w-8 text-center shrink-0">
                {medal[entry.rank] ?? <span className="text-[#4a4a5a] font-bold text-sm">#{entry.rank}</span>}
              </span>
              <img src={entry.post.image_url} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#f0f0f5] truncate">{entry.post.author.username}</p>
                {entry.post.ai_comment && (
                  <p className="text-xs text-[#a855f7] truncate mt-0.5">🤖 {entry.post.ai_comment}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                <TierBadge tier={entry.tier} />
                <p className="text-xs text-[#4a4a5a]">⭐ {entry.avg_score?.toFixed(1) ?? '-'} · {entry.vote_count} 票</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

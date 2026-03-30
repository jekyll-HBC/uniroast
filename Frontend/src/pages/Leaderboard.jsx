import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import api from '../api'
import TierBadge from '../components/TierBadge'

export default function Leaderboard() {
  const [posts, setPosts] = useState([])
  const [themes, setThemes] = useState([])
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/themes/').then(({ data }) => setThemes(data))
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedTheme ? `/posts/?theme_id=${selectedTheme}&limit=50` : '/posts/?limit=50'
    api.get(url)
      .then(({ data }) => {
        setPosts([...data].sort((a, b) => b.avg_score - a.avg_score || b.vote_count - a.vote_count))
      })
      .finally(() => setLoading(false))
  }, [selectedTheme])

  const medal = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="max-w-lg mx-auto py-4 px-4">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="text-yellow-500" size={24} />
        <h1 className="text-xl font-bold text-[#f0f0f5]">排行榜</h1>
      </div>

      {/* 主题筛选 */}
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

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-[#1a1a24] rounded-2xl animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-[#4a4a5a]">还没有数据</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div
              key={post.id}
              className={`bg-[#1a1a24] rounded-2xl p-3 flex items-center space-x-3 card-border
                ${idx < 3 ? 'ring-1 ring-yellow-500/30' : ''}`}
            >
              <span className="text-2xl w-8 text-center shrink-0">
                {medal[idx] ?? <span className="text-[#4a4a5a] font-bold text-sm">#{idx + 1}</span>}
              </span>
              <img src={post.image_url} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#f0f0f5] truncate">{post.author.username}</p>
                {post.ai_comment && (
                  <p className="text-xs text-[#a855f7] truncate mt-0.5">🤖 {post.ai_comment}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                <TierBadge tier={post.tier || '未评级'} />
                <p className="text-xs text-[#4a4a5a]">⭐ {post.avg_score?.toFixed(1) ?? '-'} · {post.vote_count} 票</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

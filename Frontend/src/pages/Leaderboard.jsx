import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import api from '../api'

const TIER_BADGE = {
  '夯':     'bg-red-500 text-white',
  '顶级':   'bg-orange-400 text-white',
  '人上人': 'bg-yellow-300 text-gray-800',
  'NPC':    'bg-gray-100 text-gray-600',
  '拉完了': 'bg-white text-gray-400 border border-gray-200',
  '未评级': 'bg-gray-100 text-gray-400',
}

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
        <h1 className="text-xl font-bold">排行榜</h1>
      </div>

      {/* 主题筛选 */}
      <div className="flex space-x-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedTheme(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition
            ${!selectedTheme ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          全部
        </button>
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTheme(t.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition
              ${selectedTheme === t.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {t.emoji} {t.title}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">还没有数据</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post.id} className={`bg-white rounded-2xl shadow-sm p-3 flex items-center space-x-3 ${idx < 3 ? 'ring-2 ring-yellow-200' : ''}`}>
              <span className="text-2xl w-8 text-center shrink-0">
                {medal[idx] ?? <span className="text-gray-400 font-bold">#{idx + 1}</span>}
              </span>
              <img src={post.image_url} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{post.author.username}</p>
                {post.ai_comment && (
                  <p className="text-xs text-purple-500 truncate mt-0.5">🤖 {post.ai_comment}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full block ${TIER_BADGE[post.tier || '未评级']}`}>
                  {post.tier || '未评级'}
                </span>
                <p className="text-xs text-gray-400">{post.vote_count} 票</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

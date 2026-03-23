import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import api from '../api'

export default function Leaderboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/posts/?limit=20')
      .then(({ data }) => {
        const sorted = [...data].sort((a, b) => b.avg_score - a.avg_score || b.vote_count - a.vote_count)
        setPosts(sorted)
      })
      .finally(() => setLoading(false))
  }, [])

  const medal = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      <div className="flex items-center space-x-2 mb-6">
        <Trophy className="text-yellow-500" size={28} />
        <h1 className="text-2xl font-bold">排行榜</h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">还没有数据</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post.id} className={`bg-white rounded-2xl shadow-sm p-4 flex items-center space-x-4 ${idx < 3 ? 'ring-2 ring-yellow-200' : ''}`}>
              <span className="text-2xl w-8 text-center shrink-0">
                {medal[idx] ?? <span className="text-gray-400 font-bold text-lg">#{idx + 1}</span>}
              </span>
              <img
                src={post.image_url}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{post.author.username}</p>
                <p className="text-xs text-gray-400 truncate">{post.theme}</p>
                {post.ai_comment && (
                  <p className="text-xs text-purple-500 truncate mt-0.5">🤖 {post.ai_comment}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-purple-600">{post.avg_score.toFixed(1)}</p>
                <p className="text-xs text-gray-400">{post.vote_count} 票</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

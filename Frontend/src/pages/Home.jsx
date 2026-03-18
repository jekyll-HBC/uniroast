import { useState, useEffect } from 'react'
import { Trophy, Upload } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'

const VOTE_OPTIONS = [
  { emoji: '😐', label: '一般' },
  { emoji: '😊', label: '还行' },
  { emoji: '😄', label: '不错' },
  { emoji: '😍', label: '很赞' },
  { emoji: '🤩', label: '绝了' },
]

const rankBadge = { 1: '🥇', 2: '🥈', 3: '🥉' }

const todayTheme = {
  title: "最难以名状的食堂美食",
  emoji: "🍜",
  description: "展示你在食堂吃到的最离谱的饭菜"
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [votes, setVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/posts/').then(({ data }) => {
      setPosts(data)
    }).finally(() => setLoading(false))
  }, [])

  async function handleVote(postId, index) {
    if (votes[postId] !== undefined) return
    setVotes(v => ({ ...v, [postId]: index }))
    try {
      const { data } = await api.post(`/posts/${postId}/vote`, { score: index + 1 })
      setPosts(ps => ps.map(p => p.id === postId
        ? { ...p, avg_score: data.new_avg, vote_count: data.vote_count }
        : p
      ))
    } catch {
      setVotes(v => { const n = { ...v }; delete n[postId]; return n })
    }
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* 今日主题横幅 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-4xl">{todayTheme.emoji}</span>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">今日挑战</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{todayTheme.title}</h2>
            <p className="text-white/90 text-sm">{todayTheme.description}</p>
          </div>
          <button className="bg-white text-purple-600 px-5 py-3 rounded-xl font-bold hover:bg-purple-50 transition flex items-center space-x-2 shrink-0 ml-4">
            <Upload size={18} />
            <span>参战</span>
          </button>
        </div>
      </div>

      {/* 今日战况 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          今日战况
        </h3>
        <span className="text-sm text-gray-400">实时更新中...</span>
      </div>

      {/* 帖子列表 */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">还没有人参战，快来第一个！</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* 用户信息 */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
                    className="w-9 h-9 rounded-full"
                    alt=""
                  />
                  <span className="font-semibold text-gray-800">{post.author.username}</span>
                </div>
                {rankBadge[idx + 1] && <span className="text-2xl">{rankBadge[idx + 1]}</span>}
              </div>

              {/* 图片 */}
              <img src={post.image_url} className="w-full aspect-[4/3] object-cover" alt="" />

              {/* AI 评论区 */}
              <div className="mx-4 mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-1">AI 毒舌评委</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {post.ai_comment || 'AI 评委正在思考中...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 投票区 */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs text-gray-400 mb-2 text-center">你觉得这道菜怎么样？</p>
                <div className="flex justify-between gap-1">
                  {VOTE_OPTIONS.map((opt, i) => {
                    const selected = votes[post.id] === i
                    return (
                      <button
                        key={i}
                        onClick={() => handleVote(post.id, i)}
                        disabled={!user || votes[post.id] !== undefined}
                        className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all
                          ${selected ? 'bg-purple-100 scale-110 shadow-sm' : 'hover:bg-gray-50 active:scale-95'}
                          disabled:opacity-50`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <span className={`text-xs mt-0.5 ${selected ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                          {opt.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {post.vote_count > 0 && (
                  <p className="text-xs text-center text-gray-400 mt-1">
                    {post.vote_count} 人投票 · 平均 {post.avg_score.toFixed(1)} 分
                  </p>
                )}
              </div>

              {/* 配文 */}
              <div className="px-4 pb-4 pt-2">
                {post.caption && <p className="text-sm text-gray-600">{post.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

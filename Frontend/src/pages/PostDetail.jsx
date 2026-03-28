import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import { TIERS, TIER_SCORES, TIER_STYLE } from '../constants/tier'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastVote, setLastVote] = useState(null)   // 本次会话最后一次投的等级
  const [showHeart, setShowHeart] = useState(false) // 双击动效
  const tapTimer = useRef(null)

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(r => setPost(r.data))
      .finally(() => setLoading(false))
  }, [id])

  async function vote(score) {
    if (!user) { navigate('/login'); return }
    try {
      const { data } = await api.post(`/posts/${id}/vote`, { score })
      setPost(p => ({ ...p, avg_score: data.new_avg, vote_count: data.vote_count, tier: data.tier }))
      setLastVote(score)
    } catch {}
  }

  function handleImageTap() {
    if (tapTimer.current) {
      // double tap
      clearTimeout(tapTimer.current)
      tapTimer.current = null
      vote(5) // 夯
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    } else {
      tapTimer.current = setTimeout(() => { tapTimer.current = null }, 300)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>
  if (!post) return null

  const tier = post.tier || '未评级'
  const style = TIER_STYLE[tier] || TIER_STYLE['未评级']

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center px-4 py-3 sticky top-0 bg-white/90 backdrop-blur z-10">
        <button onClick={() => navigate(-1)} className="text-gray-500 mr-3">
          <ArrowLeft size={22} />
        </button>
        <img
          src={post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
          className="w-8 h-8 rounded-full mr-2"
          alt=""
        />
        <span className="font-semibold text-gray-800 flex-1">{post.author.username}</span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge}`}>{tier}</span>
      </div>

      {/* 图片（双击投夯） */}
      <div className="relative" onClick={handleImageTap}>
        <img src={post.image_url} className="w-full aspect-square object-cover" alt="" />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl animate-ping" style={{ animationDuration: '0.6s' }}>🔥</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          双击投夯
        </div>
      </div>

      {/* 配文 */}
      {post.caption && (
        <div className="px-4 pt-4">
          <p className="text-sm text-gray-700">{post.caption}</p>
        </div>
      )}

      {/* AI 评语 */}
      {post.ai_comment && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs font-bold text-purple-600 mb-1">🤖 AI 毒舌评委</p>
          <p className="text-sm text-gray-700 leading-relaxed">{post.ai_comment}</p>
        </div>
      )}

      {/* 投票区 */}
      <div className="px-4 mt-5">
        <p className="text-xs text-gray-400 mb-2 text-center">
          {post.vote_count > 0 ? `${post.vote_count} 次投票 · 当前 ${tier}` : '还没有人投票'}
          {lastVote && <span className="ml-1 text-purple-500">· 你刚投了 {Object.keys(TIER_SCORES).find(k => TIER_SCORES[k] === lastVote)}</span>}
        </p>
        <div className="flex gap-2">
          {TIERS.map(t => {
            const score = TIER_SCORES[t]
            const isLast = lastVote === score
            return (
              <button
                key={t}
                onClick={() => vote(score)}
                disabled={!user}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95
                  ${isLast ? TIER_STYLE[t].badge + ' scale-105 shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                  disabled:opacity-40 disabled:cursor-default`}
              >
                {t}
              </button>
            )
          })}
        </div>
        {!user && (
          <p className="text-center text-xs text-gray-400 mt-2">
            <button onClick={() => navigate('/login')} className="text-purple-500 underline">登录</button>后才能投票
          </p>
        )}
      </div>
    </div>
  )
}

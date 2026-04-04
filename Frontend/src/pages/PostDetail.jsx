import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import useToast from '../store/useToast'
import TierBadge from '../components/TierBadge'

const VOTE_FEEDBACK = {
  heng: { anim: 'animate-[shake_0.35s_ease-out]',    msg: '你封神了 🔥', particles: ['🔥','💥','⚡','🔥','💥'] },
  la:   { anim: 'animate-[sink_0.3s_ease-out]',      msg: '送走了 💀',   particles: [] },
}

function VoteParticle({ emoji, onDone }) {
  const style = {
    left: `${30 + Math.random() * 40}%`,
    animationDuration: `${0.5 + Math.random() * 0.3}s`,
  }
  useEffect(() => {
    const t = setTimeout(onDone, 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <span
      className="absolute text-2xl pointer-events-none animate-[float-up_0.7s_ease-out_forwards]"
      style={{ ...style, bottom: '100%' }}
    >
      {emoji}
    </span>
  )
}

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast(s => s.show)
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastVote, setLastVote] = useState(null)
  const [showHeart, setShowHeart] = useState(false)
  const [votingTier, setVotingTier] = useState(null)
  const [prevTier, setPrevTier] = useState(null)
  const [tierChanging, setTierChanging] = useState(false)
  const [particles, setParticles] = useState([])
  const [nextPost, setNextPost] = useState(null)
  const tapTimer = useRef(null)
  const voteAreaRef = useRef(null)

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(r => {
        setPost(r.data)
        setPrevTier(r.data.tier)
        // 预加载同主题下一个作品
        api.get(`/posts/?theme_id=${r.data.theme_id}&limit=20`)
          .then(({ data }) => {
            const others = data.filter(p => p.id !== parseInt(id))
            if (others.length > 0) setNextPost(others[Math.floor(Math.random() * others.length)])
          })
      })
      .finally(() => setLoading(false))
  }, [id])

  async function vote(voteType) {
    if (!user) { navigate('/login'); return }
    const fb = VOTE_FEEDBACK[voteType]

    setVotingTier(voteType)
    setTimeout(() => setVotingTier(null), 400)

    if (fb.particles.length) {
      setParticles(fb.particles.map((e, i) => ({ id: Date.now() + i, emoji: e })))
    }

    try {
      const { data } = await api.post(`/posts/${id}/vote`, { vote_type: voteType })
      const newTier = data.tier

      if (newTier !== prevTier) {
        setTierChanging(true)
        setTimeout(() => {
          setPost(p => ({ ...p, heng_count: data.heng_count, la_count: data.la_count, vote_count: data.vote_count, tier: newTier }))
          setPrevTier(newTier)
          setTierChanging(false)
        }, 220)
      } else {
        setPost(p => ({ ...p, heng_count: data.heng_count, la_count: data.la_count, vote_count: data.vote_count, tier: newTier }))
      }
      setLastVote({ type: voteType, msg: fb.msg })
    } catch { toast('投票失败，请重试') }
  }

  function handleImageTap() {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current)
      tapTimer.current = null
      vote('heng')
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 800)
    } else {
      tapTimer.current = setTimeout(() => { tapTimer.current = null }, 300)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-[#4a4a5a]">
      <div className="flex space-x-2 text-lg">
        {['夯','人上人','拉完了'].map((t, i) => (
          <span key={t} className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{t}</span>
        ))}
      </div>
      <p className="text-sm">AI 评委正在组织毒舌语言...</p>
    </div>
  )
  if (!post) return null

  const tier = post.tier || '未评级'

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* 顶部导航 */}
      <div className="flex items-center px-4 py-3 sticky top-0 glass-dark z-10 border-b border-white/8">
        <button onClick={() => navigate(-1)} className="text-[#8888a0] mr-3">
          <ArrowLeft size={22} />
        </button>
        <img
          src={post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
          className="w-8 h-8 rounded-full mr-2"
          alt=""
          loading="lazy"
          onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}` }}
        />
        <span className="font-semibold text-[#f0f0f5] flex-1">{post.author.username}</span>
        {/* Tier 徽章 — 变化时有动画 */}
        <div className="relative overflow-hidden">
          <div className={tierChanging ? 'animate-[tier-out_0.2s_ease-in_forwards]' : 'animate-[tier-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]'}>
            <TierBadge tier={tier} size="md" />
          </div>
        </div>
      </div>

      {/* 图片（双击投夯） */}
      <div className="relative" onClick={handleImageTap}>
        <img src={post.image_url} className="w-full aspect-square object-cover" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-7xl animate-ping" style={{ animationDuration: '0.6s' }}>🔥</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white/70 text-xs px-2 py-1 rounded-full">
          双击投夯
        </div>
      </div>

      {/* 配文 */}
      {post.caption && (
        <div className="px-4 pt-4">
          <p className="text-sm text-[#8888a0]">{post.caption}</p>
        </div>
      )}

      {/* AI 评语 — 宣判风格 */}
      {post.ai_comment && (
        <div className="mx-4 mt-4 bg-[#1e1a2e] rounded-xl p-4 border-l-2 border-[#a855f7]">
          <p className="text-xs font-bold text-[#a855f7] mb-1 italic">🤖 AI 评委宣判</p>
          <p className="text-sm text-[#8888a0] leading-relaxed italic">{post.ai_comment}</p>
        </div>
      )}

      {/* 投票区 */}
      <div className="px-4 mt-5" ref={voteAreaRef}>
        <p className="text-xs text-[#4a4a5a] mb-3 text-center">
          {post.vote_count > 0 ? `${post.vote_count} 次投票 · 当前 ${tier}` : '还没有人投票，你来定'}
          {lastVote && <span className="ml-1 text-[#a855f7]">· {lastVote.msg}</span>}
        </p>

        <div className="flex gap-3">
          {/* 夯 */}
          <div className="flex-1 relative">
            {votingTier === 'heng' && particles.map(p => (
              <VoteParticle key={p.id} emoji={p.emoji} onDone={() => setParticles([])} />
            ))}
            <button
              onClick={() => vote('heng')}
              disabled={!user}
              className={`w-full py-5 rounded-xl text-base font-bold transition-all disabled:opacity-40
                ${votingTier === 'heng' ? VOTE_FEEDBACK.heng.anim : ''}
                ${lastVote?.type === 'heng' ? 'bg-[#ff3b3b] text-white glow-heng scale-105' : 'bg-[#22222f] text-[#8888a0] hover:bg-[#ff3b3b]/20 hover:text-[#ff3b3b]'}`}
            >
              🔥 夯
              {post.heng_count > 0 && <span className="ml-1 text-sm font-normal opacity-80">{post.heng_count}</span>}
            </button>
          </div>

          {/* 拉完了 */}
          <div className="flex-1">
            <button
              onClick={() => vote('la')}
              disabled={!user}
              className={`w-full py-5 rounded-xl text-base font-bold transition-all disabled:opacity-40
                ${votingTier === 'la' ? VOTE_FEEDBACK.la.anim : ''}
                ${lastVote?.type === 'la' ? 'bg-[#1a1a24] text-[#4a4a5a] border border-white/20 scale-105' : 'bg-[#1a1a24] text-[#4a4a5a] hover:bg-[#22222f]'}`}
            >
              💀 拉完了
              {(post.la_count ?? 0) > 0 && <span className="ml-1 text-sm font-normal opacity-80">{post.la_count}</span>}
            </button>
          </div>
        </div>

        {!user && (
          <p className="text-center text-xs text-[#4a4a5a] mt-2">
            <button onClick={() => navigate('/login')} className="text-[#a855f7] underline">登录</button>后才能投票
          </p>
        )}
      </div>

      {/* 下一个作品引导 */}
      {nextPost && lastVote && (
        <div className="mx-4 mt-6">
          <p className="text-xs text-[#4a4a5a] mb-2">继续评判下一个</p>
          <button
            onClick={() => navigate(`/post/${nextPost.id}`)}
            className="w-full bg-[#1a1a24] card-border rounded-2xl overflow-hidden flex items-center space-x-3 p-3 hover:bg-[#22222f] transition text-left"
          >
            <img src={nextPost.image_url} className="w-16 h-16 rounded-xl object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#f0f0f5] truncate">{nextPost.author.username}</p>
              {nextPost.ai_comment && <p className="text-xs text-[#a855f7] truncate mt-0.5">🤖 {nextPost.ai_comment}</p>}
            </div>
            <span className="text-[#4a4a5a] text-lg">›</span>
          </button>
        </div>
      )}
    </div>
  )
}

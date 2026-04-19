import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, Share2 } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import useToast from '../store/useToast'
import TierBadge from './TierBadge'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

export default function FeedCard({ post: initialPost }) {
  const [post, setPost] = useState(initialPost)
  const [imgIndex, setImgIndex] = useState(0)
  const [voting, setVoting] = useState(null)
  const { user } = useAuth()
  const toast = useToast(s => s.show)
  const navigate = useNavigate()

  const images = post.images?.length ? post.images : (post.image_url ? [post.image_url] : [])
  const avatarSeed = post.author.id
  const avatarUrl = post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`

  async function handleVote(voteType) {
    if (!user) { navigate('/login'); return }
    if (voting) return
    setVoting(voteType)
    try {
      const { data } = await api.post(`/posts/${post.id}/vote`, { vote_type: voteType })
      setPost(p => ({
        ...p,
        heng_count: data.heng_count,
        la_count: data.la_count,
        vote_count: data.vote_count,
        tier: data.tier,
      }))
      toast(voteType === 'heng' ? '夯！🔥' : '送走了 💀')
    } catch {
      toast('投票失败，请重试')
    } finally {
      setVoting(null)
    }
  }

  function handleShare() {
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      navigator.share({ title: 'UniRoast', url })
    } else {
      navigator.clipboard?.writeText(url)
      toast('链接已复制')
    }
  }

  return (
    <article className="bg-white border-b border-black/[0.06]">
      {/* Header: avatar + username/date + tier badge */}
      <div className="flex items-start px-4 pt-4 pb-2">
        <button onClick={() => navigate(`/post/${post.id}`)}>
          <img
            src={avatarUrl}
            className="w-10 h-10 rounded-full mr-3 mt-0.5 object-cover"
            alt=""
            loading="lazy"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}` }}
          />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1a1a1a] text-sm leading-tight">{post.author.username}</p>
          <p className="text-xs text-[#888888] mt-0.5">{formatDate(post.created_at)}</p>
        </div>
        <div className="flex items-center space-x-2 ml-2 shrink-0">
          <TierBadge tier={post.tier} size="sm" />
          <span className="text-[#888888] text-lg leading-none px-1">···</span>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="px-4 pb-3 text-sm text-[#1a1a1a] leading-relaxed">{post.caption}</p>
      )}

      {/* Multi-image carousel */}
      {images.length > 0 && (
        <div className="relative">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            onScroll={e => {
              const idx = Math.round(e.target.scrollLeft / e.target.clientWidth)
              setImgIndex(idx)
            }}
          >
            {images.map((url, i) => (
              <button
                key={i}
                className="w-full shrink-0 snap-start"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <img
                  src={url}
                  className="w-full aspect-[4/3] object-cover"
                  alt=""
                  loading="lazy"
                  onError={e => { e.target.parentElement.style.display = 'none' }}
                />
              </button>
            ))}
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-2 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full pointer-events-none">
              {imgIndex + 1}/{images.length}
            </div>
          )}
        </div>
      )}

      {/* AI 锐评 box */}
      {post.ai_comment && (
        <div className="mx-4 mt-3 bg-[#e8f5e8] rounded-xl p-3 border-l-2 border-[#1a7a1a] relative">
          <div className="absolute top-2 right-2">
            <TierBadge tier={post.tier} size="sm" />
          </div>
          <p className="text-xs font-bold text-[#1a7a1a] mb-1 italic pr-16">🤖 AI 锐评</p>
          <p className="text-sm text-[#555555] leading-relaxed italic pr-16 line-clamp-3">{post.ai_comment}</p>
          <button
            onClick={() => navigate(`/post/${post.id}`)}
            className="text-xs text-[#1a7a1a] mt-1.5 block"
          >
            查看完整内容 &rsaquo;
          </button>
        </div>
      )}

      {/* Theme tag */}
      {post.theme_title && (
        <div className="px-4 mt-2">
          <span className="text-xs text-[#555555] bg-[#e8f5e8] px-2 py-1 rounded-full">
            {post.theme_emoji} {post.theme_title}
          </span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center px-4 py-3 mt-1 space-x-1">
        <button
          onClick={() => handleVote('heng')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all
            ${voting === 'heng' ? 'scale-95 opacity-70' : 'hover:bg-[#ff3b3b]/20'}
            bg-[#ff3b3b]/10 text-[#ff3b3b]`}
        >
          <span>🔥</span>
          <span>夯</span>
          {post.heng_count > 0 && <span className="text-xs font-normal opacity-80">{post.heng_count}</span>}
        </button>

        <button
          onClick={() => handleVote('la')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all
            ${voting === 'la' ? 'scale-95 opacity-70' : 'hover:bg-[#e8f5e8]'}
            bg-[#e8f5e8] text-[#888888]`}
        >
          <span>💀</span>
          <span>拉完了</span>
          {post.la_count > 0 && <span className="text-xs font-normal opacity-80">{post.la_count}</span>}
        </button>

        <div className="flex-1" />

        <button
          onClick={() => navigate(`/post/${post.id}`)}
          className="flex items-center space-x-1 text-[#888888] px-2 py-2 hover:text-[#555555] transition-colors"
        >
          <MessageCircle size={18} />
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-1 text-[#888888] px-2 py-2 hover:text-[#555555] transition-colors"
        >
          <Share2 size={18} />
        </button>
      </div>
    </article>
  )
}

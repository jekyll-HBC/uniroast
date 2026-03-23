import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, ArrowLeft } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'

const TIERS = ['夯', '顶级', '人上人', 'NPC', '拉完了']
const TIER_SCORES = { '夯': 5, '顶级': 4, '人上人': 3, 'NPC': 2, '拉完了': 1 }
const TIER_STYLE = {
  '夯':    { bar: 'bg-red-500',    badge: 'bg-red-500 text-white' },
  '顶级':  { bar: 'bg-orange-400', badge: 'bg-orange-400 text-white' },
  '人上人':{ bar: 'bg-yellow-300', badge: 'bg-yellow-300 text-gray-800' },
  'NPC':   { bar: 'bg-gray-200',   badge: 'bg-gray-100 text-gray-600' },
  '拉完了':{ bar: 'bg-gray-100',   badge: 'bg-white text-gray-400 border border-gray-200' },
  '未评级':{ bar: 'bg-gray-100',   badge: 'bg-gray-100 text-gray-400' },
}

// 分布表：每个等级的帖子头像缩略图，点击滚动到帖子
function TierDistribution({ posts, postRefs }) {
  const grouped = TIERS.reduce((acc, t) => ({ ...acc, [t]: [] }), {})
  posts.forEach(p => { if (grouped[p.tier]) grouped[p.tier].push(p) })

  const hasAny = TIERS.some(t => grouped[t].length > 0)
  if (!hasAny) return null

  function scrollTo(postId) {
    postRefs.current[postId]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
      {TIERS.map(tier => (
        <div key={tier} className="flex items-center border-b border-gray-50 last:border-0">
          <div className={`w-16 shrink-0 py-2 px-3 text-sm font-bold ${TIER_STYLE[tier].badge} flex items-center justify-center`}>
            {tier}
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-2 overflow-x-auto scrollbar-hide flex-1">
            {grouped[tier].length === 0 ? (
              <span className="text-xs text-gray-300">暂无</span>
            ) : grouped[tier].map(p => (
              <button key={p.id} onClick={() => scrollTo(p.id)} className="shrink-0">
                <img
                  src={p.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.author.id}`}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm hover:scale-110 transition"
                  alt={p.author.username}
                  title={p.author.username}
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// 打字机效果 hook
function useTypewriter(text, active) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    if (!active || !text) return
    setDisplayed('')
    let i = 0
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++i))
      if (i >= text.length) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [text, active])
  return displayed
}

// 发帖弹窗
function SubmitModal({ theme, onClose, onPosted }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  // status: idle | uploading | posting | reveal
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null) // 发布成功的 post
  const inputRef = useRef()

  const aiText = useTypewriter(result?.ai_comment, status === 'reveal')

  function pickFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit() {
    if (!file) return
    setStatus('uploading')
    try {
      const form = new FormData()
      form.append('file', file)
      const { data: uploadData } = await api.post('/upload/', form)
      setStatus('posting')
      const { data: post } = await api.post('/posts/', {
        theme_id: theme.id,
        image_url: uploadData.image_url,
        caption: caption || null,
      })
      setResult(post)
      setStatus('reveal')
      onPosted(post)
    } catch {
      setStatus('idle')
    }
  }

  const tierStyle = result ? (TIER_STYLE[result.tier] || TIER_STYLE['未评级']) : null

  // 开奖界面
  if (status === 'reveal' && result) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          {/* 图片（清晰） */}
          <div className="relative">
            <img src={result.image_url} className="w-full aspect-square object-cover" alt="" />
            <div className="absolute top-3 right-3">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full shadow ${tierStyle.badge}`}>
                {result.tier || '未评级'}
              </span>
            </div>
          </div>

          {/* AI 评语打字机 */}
          <div className="p-5">
            <div className="flex items-start space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 mb-4">
              <span className="text-xl shrink-0">🤖</span>
              <div>
                <p className="text-xs font-bold text-purple-600 mb-1">AI 毒舌评委</p>
                <p className="text-sm text-gray-700 leading-relaxed min-h-[3rem]">
                  {aiText}<span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold"
            >
              好的，去看排名 🔥
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 等待界面
  if (status === 'uploading' || status === 'posting') {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          <div className="relative">
            <img src={preview} className="w-full aspect-square object-cover blur-sm scale-105" alt="" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <p className="text-white font-bold text-lg mb-2">
                {status === 'uploading' ? '上传中...' : '🤖 AI 评委正在吐槽中...'}
              </p>
              <div className="w-32 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          </div>
          <div className="p-5 text-center text-gray-400 text-sm">请稍候，评委正在认真审阅...</div>
        </div>
      </div>
    )
  }

  // 正常填写界面
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{theme.emoji} {theme.title}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        {preview ? (
          <img src={preview} className="w-full aspect-[4/3] object-cover rounded-xl mb-2" alt="" />
        ) : (
          <button
            onClick={() => inputRef.current.click()}
            className="w-full aspect-[4/3] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-400 transition mb-4"
          >
            <Upload size={32} className="mb-2" />
            <span>点击选择图片</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        {preview && (
          <button onClick={() => { setFile(null); setPreview(null) }} className="text-xs text-gray-400 mb-3 hover:text-red-400">
            重新选择
          </button>
        )}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="写点配文？（可选）"
          maxLength={300}
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-400 mb-4"
        />
        <button
          onClick={handleSubmit}
          disabled={!file}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          发布参战
        </button>
      </div>
    </div>
  )
}

// 单个帖子卡片
function PostCard({ post, myVote, onVote, postRef }) {
  const tier = post.tier || '未评级'
  const style = TIER_STYLE[tier] || TIER_STYLE['未评级']

  return (
    <div ref={postRef} className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
            className="w-9 h-9 rounded-full"
            alt=""
          />
          <span className="font-semibold text-gray-800">{post.author.username}</span>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge}`}>{tier}</span>
      </div>

      {/* 图片 */}
      <img src={post.image_url} className="w-full aspect-square object-cover" alt="" />

      {/* 配文 */}
      {post.caption && (
        <div className="px-4 pt-3">
          <p className="text-sm text-gray-700">{post.caption}</p>
        </div>
      )}

      {/* AI 评论（折叠，点击展开） */}
      <AIComment comment={post.ai_comment} />

      {/* 投票区 */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex gap-1.5">
          {TIERS.map(t => {
            const selected = myVote === TIER_SCORES[t]
            return (
              <button
                key={t}
                onClick={() => onVote(post.id, TIER_SCORES[t])}
                disabled={myVote !== undefined}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all
                  ${selected ? style.badge + ' scale-105 shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                  disabled:cursor-default`}
              >
                {t}
              </button>
            )
          })}
        </div>
        {post.vote_count > 0 && (
          <p className="text-xs text-center text-gray-400 mt-1.5">
            {post.vote_count} 人投票
          </p>
        )}
      </div>
    </div>
  )
}

function AIComment({ comment }) {
  const [open, setOpen] = useState(false)
  if (!comment) return null
  return (
    <div className="mx-4 mt-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center space-x-1.5 text-xs text-purple-500 font-semibold"
      >
        <span>🤖</span>
        <span>{open ? '收起 AI 评语' : '查看 AI 评语'}</span>
      </button>
      {open && (
        <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
          <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
        </div>
      )}
    </div>
  )
}

export default function ThemePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [theme, setTheme] = useState(null)
  const [posts, setPosts] = useState([])
  const [votes, setVotes] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const postRefs = useRef({})

  useEffect(() => {
    Promise.all([
      api.get(`/themes/${id}`),
      api.get(`/posts/?theme_id=${id}`),
    ]).then(([themeRes, postsRes]) => {
      setTheme(themeRes.data)
      setPosts(postsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  async function handleVote(postId, score) {
    if (votes[postId] !== undefined) return
    setVotes(v => ({ ...v, [postId]: score }))
    try {
      const { data } = await api.post(`/posts/${postId}/vote`, { score })
      setPosts(ps => ps.map(p => p.id === postId
        ? { ...p, avg_score: data.new_avg, vote_count: data.vote_count, tier: data.tier }
        : p
      ))
    } catch {
      setVotes(v => { const n = { ...v }; delete n[postId]; return n })
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>
  if (!theme) return null

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* 顶부 */}
      <div className="flex items-center space-x-3 mb-4">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={22} />
        </button>
        <span className="text-3xl">{theme.emoji}</span>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{theme.title}</h1>
          {theme.description && <p className="text-sm text-gray-400">{theme.description}</p>}
        </div>
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shrink-0"
          >
            <Upload size={15} />
            <span>参战</span>
          </button>
        )}
      </div>

      {/* 夯到拉分布表 */}
      <TierDistribution posts={posts} postRefs={postRefs} />

      {/* 帖子列表 */}
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">还没有人参战，快来第一个！</div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              myVote={votes[post.id]}
              onVote={handleVote}
              postRef={el => postRefs.current[post.id] = el}
            />
          ))}
        </div>
      )}

      {showModal && (
        <SubmitModal
          theme={theme}
          onClose={() => setShowModal(false)}
          onPosted={post => setPosts(ps => [post, ...ps])}
        />
      )}
    </div>
  )
}

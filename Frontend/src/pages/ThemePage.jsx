import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import useToast from '../store/useToast'
import TierBadge from '../components/TierBadge'

const TIERS = ['夯', '顶级', '人上人', 'NPC', '拉完了']

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

function SubmitModal({ theme, onClose, onPosted }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | posting | reveal
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState(null)
  const inputRef = useRef()
  const toast = useToast(s => s.show)

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
      toast('发布失败，请重试')
    }
  }

  if (status === 'reveal' && result) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a24] card-border rounded-2xl w-full max-w-md overflow-hidden">
          <div className="relative">
            <img src={result.image_url} className="w-full aspect-square object-cover" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
            <div className="absolute top-3 right-3">
              <TierBadge tier={result.tier || '未评级'} size="md" />
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start space-x-3 bg-[#1e1a2e] rounded-xl p-4 border-l-2 border-[#a855f7] mb-4">
              <span className="text-xl shrink-0">🤖</span>
              <div>
                <p className="text-xs font-bold text-[#a855f7] mb-1 italic">AI 评委宣判</p>
                <p className="text-sm text-[#8888a0] leading-relaxed min-h-[3rem] italic">
                  {aiText}<span className="animate-pulse">|</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white py-3 rounded-xl font-bold"
            >
              好的，去看排名 🔥
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'uploading' || status === 'posting') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#1a1a24] card-border rounded-2xl w-full max-w-md overflow-hidden">
          <div className="relative">
            <img src={preview} className="w-full aspect-square object-cover blur-sm scale-105" alt="" loading="lazy" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
              <p className="text-white font-bold text-lg mb-2">
                {status === 'uploading' ? '上传中...' : '🤖 AI 评委正在吐槽中...'}
              </p>
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-full animate-pulse w-2/3" />
              </div>
            </div>
          </div>
          <div className="p-5 text-center text-[#4a4a5a] text-sm">请稍候，评委正在认真审阅...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] card-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#f0f0f5]">{theme.emoji} {theme.title}</h3>
          <button onClick={onClose}><X size={20} className="text-[#4a4a5a]" /></button>
        </div>
        {preview ? (
          <img src={preview} className="w-full aspect-[4/3] object-cover rounded-xl mb-2" alt="" loading="lazy" />
        ) : (
          <button
            onClick={() => inputRef.current.click()}
            className="w-full aspect-[4/3] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-[#4a4a5a] hover:border-[#a855f7]/50 hover:text-[#a855f7] transition mb-4"
          >
            <Upload size={32} className="mb-2" />
            <span>点击选择图片</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        {preview && (
          <button onClick={() => { setFile(null); setPreview(null) }} className="text-xs text-[#4a4a5a] mb-3 hover:text-red-400">
            重新选择
          </button>
        )}
        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="写点配文？（可选）"
          maxLength={300}
          rows={2}
          className="w-full bg-[#22222f] border border-white/10 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#a855f7] mb-4 text-[#f0f0f5] placeholder-[#4a4a5a]"
        />
        <button
          onClick={handleSubmit}
          disabled={!file}
          className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white py-3 rounded-xl font-bold disabled:opacity-50"
        >
          发布参战
        </button>
      </div>
    </div>
  )
}

function PostGridCard({ post }) {
  const tier = post.tier || '未评级'
  return (
    <Link to={`/post/${post.id}`} className="block bg-[#1a1a24] card-border rounded-2xl overflow-hidden active:scale-95 transition-transform">
      <img src={post.image_url} className="w-full aspect-square object-cover" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
      <div className="p-2 flex items-center justify-between">
        <span className="text-xs text-[#8888a0] truncate mr-1">{post.author.username}</span>
        <TierBadge tier={tier} />
      </div>
    </Link>
  )
}

export default function ThemePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [theme, setTheme] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/themes/${id}`),
      api.get(`/posts/?theme_id=${id}`),
    ]).then(([themeRes, postsRes]) => {
      setTheme(themeRes.data)
      setPosts(postsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-[#4a4a5a]">
      <div className="flex space-x-2 text-lg">
        {['夯','人上人','拉完了'].map((t, i) => (
          <span key={t} className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{t}</span>
        ))}
      </div>
      <p className="text-sm">正在从互联网深处打捞数据...</p>
    </div>
  )
  if (!theme) return null

  const grouped = TIERS.reduce((acc, t) => ({ ...acc, [t]: [] }), { '未评级': [] })
  posts.forEach(p => { const t = p.tier || '未评级'; if (grouped[t]) grouped[t].push(p) })

  return (
    <div className="pb-24">
      {/* Hero 区域 */}
      <div className="relative bg-gradient-to-br from-[#1e1a2e] via-[#2d1b4e] to-[#1a1a24] px-6 pt-12 pb-8 border-b border-white/8">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-[#8888a0] hover:text-[#f0f0f5] transition-colors"
        >
          ← 返回
        </button>
        <div className="text-center">
          <div className="text-6xl mb-3">{theme.emoji}</div>
          <h1 className="text-2xl font-bold text-[#f0f0f5] mb-1">{theme.title}</h1>
          {theme.description && (
            <p className="text-[#8888a0] text-sm mb-3">{theme.description}</p>
          )}
          <p className="text-[#4a4a5a] text-xs">{posts.length} 人已参战</p>
        </div>
      </div>

      {/* 帖子内容区 */}
      <div className="px-3 pt-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#4a4a5a]">
            <p>还没有人参战</p>
            <p className="text-xs mt-1 text-[#4a4a5a]/60">第一个上场的人，往往最勇敢</p>
          </div>
        ) : (
          TIERS.map(tier => {
            const tierPosts = grouped[tier]
            if (tierPosts.length === 0) return null
            return (
              <div key={tier} className="mb-6">
                <div className="flex items-center mb-2 px-1">
                  <TierBadge tier={tier} className="mr-2" />
                  <span className="text-xs text-[#4a4a5a]">{tierPosts.length} 人</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tierPosts.map(post => (
                    <PostGridCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 参战 FAB */}
      {user && (
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-[#a855f7] to-[#ec4899] text-white rounded-full shadow-lg shadow-[#a855f7]/30 flex items-center justify-center text-2xl z-40 active:scale-95 transition-transform"
        >
          <Upload size={22} />
        </button>
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

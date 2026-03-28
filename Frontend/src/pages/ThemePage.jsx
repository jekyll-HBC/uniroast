import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import api from '../api'
import useAuth from '../store/useAuth'
import useToast from '../store/useToast'

const TIERS = ['夯', '顶级', '人上人', 'NPC', '拉完了']
const TIER_STYLE = {
  '夯':    { badge: 'bg-red-500 text-white' },
  '顶级':  { badge: 'bg-orange-400 text-white' },
  '人上人':{ badge: 'bg-yellow-300 text-gray-800' },
  'NPC':   { badge: 'bg-gray-100 text-gray-600' },
  '拉完了':{ badge: 'bg-white text-gray-400 border border-gray-200' },
  '未评级':{ badge: 'bg-gray-100 text-gray-400' },
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

// 发帖弹窗（保持原有逻辑不变）
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

  const tierStyle = result ? (TIER_STYLE[result.tier] || TIER_STYLE['未评级']) : null

  if (status === 'reveal' && result) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
          <div className="relative">
            <img src={result.image_url} className="w-full aspect-square object-cover" alt="" />
            <div className="absolute top-3 right-3">
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full shadow ${tierStyle.badge}`}>
                {result.tier || '未评级'}
              </span>
            </div>
          </div>
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
          className="w-full border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-purple-400 mb-4"
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

// 双列瀑布流卡片（只显示图片 + 用户名 + 评级）
function PostGridCard({ post }) {
  const tier = post.tier || '未评级'
  const style = TIER_STYLE[tier] || TIER_STYLE['未评级']
  return (
    <Link to={`/post/${post.id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform">
      <img src={post.image_url} className="w-full aspect-square object-cover" alt="" />
      <div className="p-2 flex items-center justify-between">
        <span className="text-xs text-gray-600 truncate mr-1">{post.author.username}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>{tier}</span>
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

  if (loading) return <div className="text-center py-20 text-gray-400">加载中...</div>
  if (!theme) return null

  // 按等级分组，夯排最前
  const grouped = TIERS.reduce((acc, t) => ({ ...acc, [t]: [] }), { '未评级': [] })
  posts.forEach(p => { const t = p.tier || '未评级'; if (grouped[t]) grouped[t].push(p) })

  return (
    <div className="pb-24">
      {/* Hero 区域 */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 px-6 pt-12 pb-8">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-white/70 hover:text-white"
        >
          ← 返回
        </button>
        <div className="text-center">
          <div className="text-6xl mb-3">{theme.emoji}</div>
          <h1 className="text-2xl font-bold text-white mb-1">{theme.title}</h1>
          {theme.description && (
            <p className="text-white/70 text-sm mb-3">{theme.description}</p>
          )}
          <p className="text-white/60 text-xs">{posts.length} 人已参战</p>
        </div>
      </div>

      {/* 帖子内容区 */}
      <div className="px-3 pt-4">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">还没有人参战，快来第一个！</div>
        ) : (
          TIERS.map(tier => {
            const tierPosts = grouped[tier]
            if (tierPosts.length === 0) return null
            const style = TIER_STYLE[tier]
            return (
              <div key={tier} className="mb-6">
                {/* 等级标题 */}
                <div className="flex items-center mb-2 px-1">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full mr-2 ${style.badge}`}>{tier}</span>
                  <span className="text-xs text-gray-400">{tierPosts.length} 人</span>
                </div>
                {/* 双列网格 */}
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
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 active:scale-95 transition-transform"
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

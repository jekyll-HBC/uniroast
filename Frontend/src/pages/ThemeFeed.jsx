import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import api from '../api'
import FeedCard from '../components/FeedCard'

export default function ThemeFeed() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [theme, setTheme] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/themes/${id}`),
      api.get(`/themes/${id}/posts?limit=50`),
    ]).then(([themeRes, postsRes]) => {
      setTheme(themeRes.data)
      setPosts(postsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Theme header */}
      <div className="flex items-center px-4 py-3 sticky top-[57px] glass-dark z-10 border-b border-black/8">
        <button onClick={() => navigate(-1)} className="text-[#555555] mr-3">
          <ArrowLeft size={22} />
        </button>
        {theme && (
          <>
            <span className="text-2xl mr-2">{theme.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1a1a1a] truncate">{theme.title}</p>
              {theme.description && (
                <p className="text-xs text-[#888888] truncate">{theme.description}</p>
              )}
            </div>
            <span className="text-xs text-[#555555] shrink-0 ml-2">{theme.post_count} 参战</span>
          </>
        )}
      </div>

      {loading ? (
        <div className="space-y-0 mt-0">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border-b border-black/[0.06] p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#e8f5e8] animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-[#e8f5e8] rounded animate-pulse w-24" />
                  <div className="h-2.5 bg-[#e8f5e8] rounded animate-pulse w-14" />
                </div>
              </div>
              <div className="h-48 bg-[#e8f5e8] rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-[#888888]">
          <p className="text-4xl mb-3">{theme?.emoji || '🔥'}</p>
          <p>这个主题还没有参战作品</p>
        </div>
      ) : (
        posts.map(post => <FeedCard key={post.id} post={post} />)
      )}
    </div>
  )
}

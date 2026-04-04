import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api'
import FeedCard from '../components/FeedCard'

export default function RecommendFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef(null)
  const LIMIT = 20

  useEffect(() => {
    api.get(`/posts/feed?page=1&limit=${LIMIT}`)
      .then(r => {
        setPosts(r.data)
        setHasMore(r.data.length === LIMIT)
      })
      .finally(() => setLoading(false))
  }, [])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    api.get(`/posts/feed?page=${nextPage}&limit=${LIMIT}`)
      .then(r => {
        setPosts(prev => [...prev, ...r.data])
        setHasMore(r.data.length === LIMIT)
        setPage(nextPage)
      })
      .finally(() => setLoadingMore(false))
  }, [page, loadingMore, hasMore])

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMore])

  if (loading) {
    return (
      <div className="space-y-0">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#1a1a24] border-b border-white/[0.06] p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#22222f] animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[#22222f] rounded animate-pulse w-24" />
                <div className="h-2.5 bg-[#22222f] rounded animate-pulse w-14" />
              </div>
            </div>
            <div className="h-48 bg-[#22222f] rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-[#4a4a5a]">
        <p className="text-4xl mb-3">🔥</p>
        <p>还没有帖子，去参战吧！</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map(post => (
        <FeedCard key={post.id} post={post} />
      ))}
      <div ref={sentinelRef} className="py-4 text-center text-xs text-[#4a4a5a]">
        {loadingMore && '加载中...'}
        {!hasMore && !loading && posts.length > 0 && '没有更多了'}
      </div>
    </div>
  )
}

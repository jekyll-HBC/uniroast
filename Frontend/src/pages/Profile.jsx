import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import api from '../api'
import TierBadge from '../components/TierBadge'

export default function Profile() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get(`/posts/?user_id=${user.id}`),
      api.get('/auth/me/activity'),
    ]).then(([postsRes, actRes]) => {
      setPosts(postsRes.data)
      setActivities(actRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const totalVotes = posts.reduce((sum, p) => sum + p.vote_count, 0)
  const bestTier = posts.find(p => p.tier === '夯') ? '夯' : posts.find(p => p.tier === '顶级') ? '顶级' : null

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* 个人信息卡 */}
      <div className="bg-gradient-to-br from-[#1a7a1a] to-[#2d8c2d] rounded-2xl p-6 mb-6">
        <div className="flex items-center space-x-4 mb-5">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-20 h-20 rounded-full ring-2 ring-white/40"
            alt=""
            loading="lazy"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` }}
          />
          <div>
            <h2 className="text-2xl font-bold text-white">{user.username}</h2>
            <p className="text-white/70 text-sm">{user.email}</p>
            {user.streak > 0 && (
              <p className="text-sm text-orange-300 mt-1">🔥 连战 {user.streak} 天</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-white/15 rounded-xl py-3">
            <p className="text-2xl font-bold text-white">{posts.length}</p>
            <p className="text-xs text-white/70 mt-0.5">参战次数</p>
          </div>
          <div className="text-center bg-white/15 rounded-xl py-3">
            <p className="text-2xl font-bold text-white">{totalVotes}</p>
            <p className="text-xs text-white/70 mt-0.5">获得投票</p>
          </div>
          <div className="text-center bg-white/15 rounded-xl py-3">
            {bestTier
              ? <TierBadge tier={bestTier} size="md" className="mt-1" />
              : <p className="text-2xl font-bold text-white/40">-</p>
            }
            <p className="text-xs text-white/70 mt-1">最高等级</p>
          </div>
        </div>
      </div>

      {/* 最近动态 */}
      {activities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#555555] mb-3">最近动态</h3>
          <div className="space-y-2">
            {activities.slice(0, 5).map(a => (
              <button
                key={a.id}
                onClick={() => navigate(`/post/${a.post_id}`)}
                className="w-full bg-white card-border rounded-xl p-3 flex items-center space-x-3 text-left hover:bg-[#e8f5e8] transition"
              >
                <img src={a.post_image_url} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1a1a1a] truncate">{a.post_caption || '你的作品'}</p>
                  <p className="text-xs text-[#1a7a1a] mt-0.5">新增投票 · 当前 {a.new_tier} · 共 {a.new_vote_count} 票</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 text-[#1a1a1a]">我的战绩</h3>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#e8f5e8] rounded-2xl animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-[#888888] py-12">
          <p className="mb-1">还没有参战记录</p>
          <p className="text-xs text-[#888888]/60 mb-4">就像你的简历一样空</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#1a7a1a] to-[#2d8c2d] text-white font-semibold py-2 px-6 rounded-xl"
          >
            去参加今日挑战
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white card-border rounded-2xl overflow-hidden flex">
              <img src={post.image_url} className="w-24 h-24 object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
              <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <TierBadge tier={post.tier || '未评级'} />
                  {post.caption && <p className="text-sm text-[#555555] mt-1 truncate">{post.caption}</p>}
                </div>
                <p className="text-xs text-[#888888]">{post.vote_count} 票 · 均分 {post.avg_score?.toFixed(1) ?? '-'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

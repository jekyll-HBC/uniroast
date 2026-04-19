import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import api from '../api'
import TierBadge from '../components/TierBadge'

export default function Profile() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [activities, setActivities] = useState([])
  const [followCounts, setFollowCounts] = useState({ following: 0, followers: 0 })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    Promise.all([
      api.get(`/posts/?user_id=${user.id}`),
      api.get('/auth/me/activity'),
      api.get(`/users/${user.id}/following`),
      api.get(`/users/${user.id}/followers`),
    ]).then(([postsRes, actRes, followingRes, followersRes]) => {
      setPosts(postsRes.data)
      setActivities(actRes.data)
      setFollowCounts({ following: followingRes.data.length, followers: followersRes.data.length })
    }).finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const totalVotes = posts.reduce((sum, p) => sum + p.vote_count, 0)

  return (
    <div className="max-w-lg mx-auto">
      {/* Instagram-style green header */}
      <div className="bg-gradient-to-br from-[#1a7a1a] to-[#2d8c2d] px-4 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-5">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-16 h-16 rounded-full ring-2 ring-white/40" alt=""
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` }}
          />
          <div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-white/70 text-sm">MUST 創新工程學院</p>
          </div>
        </div>
        <div className="flex justify-around">
          {[
            { num: posts.length, label: '帖子' },
            { num: totalVotes, label: '獲票' },
            { num: user.streak || 0, label: '連戰天' },
            { num: followCounts.following, label: '關注' },
            { num: followCounts.followers, label: '粉絲' },
          ].map(({ num, label }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold text-white">{num}</p>
              <p className="text-xs text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Page body */}
      <div className="px-4 -mt-4 mb-6">
        <button onClick={() => navigate('/profile-info')}
          className="w-full bg-[#1a7a1a] text-white rounded-xl px-4 py-3 flex items-center justify-between mb-3">
          <span className="font-semibold">✦ 個人信息</span>
          <span>›</span>
        </button>
        <div className="flex gap-3 mb-3">
          {[
            { emoji: '📣', label: '意見反饋', path: '/feedback', bg: '#e8f5e8' },
            { emoji: '👑', label: '會員',     path: '/vip',      bg: '#fff3e0' },
          ].map(({ emoji, label, path, bg }) => (
            <button key={label} onClick={() => navigate(path)}
              className="flex-1 bg-white card-border rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: bg }}>{emoji}</div>
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
        <div className="bg-white card-border rounded-xl overflow-hidden">
          {[
            { emoji: '📝', label: '我的帖子', path: null,       bg: '#e8f5e8' },
            { emoji: '⭐', label: '我的收藏', path: null,       bg: '#fce4ec' },
            { emoji: '👥', label: '好友',     path: '/friends', bg: '#e3f2fd' },
            { emoji: '⚙️', label: '設置',     path: null,       bg: '#f3e5f5' },
          ].map(({ emoji, label, path, bg }) => (
            <button key={label} onClick={() => path && navigate(path)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0] last:border-0 hover:bg-[#f9f9f9] transition">
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm" style={{ background: bg }}>{emoji}</div>
              <span className="text-sm text-[#333]">{label}</span>
              <span className="ml-auto text-[#ccc]">›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities - keep existing logic */}
      {activities.length > 0 && (
        <div className="mb-6 px-4">
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

      {/* Posts list - keep existing logic */}
      <div className="px-4">
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
          <div className="space-y-3 pb-24">
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
    </div>
  )
}

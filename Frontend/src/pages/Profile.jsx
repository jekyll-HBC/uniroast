import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import api from '../api'
import TierBadge from '../components/TierBadge'

export default function Profile() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    api.get(`/posts/?user_id=${user.id}`)
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return null

  const totalVotes = posts.reduce((sum, p) => sum + p.vote_count, 0)
  const bestTier = posts.find(p => p.tier === '夯') ? '夯' : posts.find(p => p.tier === '顶级') ? '顶级' : null

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* 个人信息卡 */}
      <div className="bg-[#1a1a24] card-border rounded-2xl p-6 mb-6">
        <div className="flex items-center space-x-4 mb-5">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-20 h-20 rounded-full ring-2 ring-[#a855f7]/40"
            alt=""
            loading="lazy"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` }}
          />
          <div>
            <h2 className="text-2xl font-bold text-[#f0f0f5]">{user.username}</h2>
            <p className="text-[#8888a0] text-sm">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-[#22222f] rounded-xl py-3">
            <p className="text-2xl font-bold text-[#a855f7]">{posts.length}</p>
            <p className="text-xs text-[#8888a0] mt-0.5">参战次数</p>
          </div>
          <div className="text-center bg-[#22222f] rounded-xl py-3">
            <p className="text-2xl font-bold text-[#ec4899]">{totalVotes}</p>
            <p className="text-xs text-[#8888a0] mt-0.5">获得投票</p>
          </div>
          <div className="text-center bg-[#22222f] rounded-xl py-3">
            {bestTier
              ? <TierBadge tier={bestTier} size="md" className="mt-1" />
              : <p className="text-2xl font-bold text-[#4a4a5a]">-</p>
            }
            <p className="text-xs text-[#8888a0] mt-1">最高等级</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-[#f0f0f5]">我的战绩</h3>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-[#1a1a24] rounded-2xl animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center text-[#4a4a5a] py-12">
          <p className="mb-1">还没有参战记录</p>
          <p className="text-xs text-[#4a4a5a]/60 mb-4">就像你的简历一样空</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white font-semibold py-2 px-6 rounded-xl"
          >
            去参加今日挑战
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-[#1a1a24] card-border rounded-2xl overflow-hidden flex">
              <img src={post.image_url} className="w-24 h-24 object-cover shrink-0" alt="" loading="lazy" onError={e => { e.target.style.display='none' }} />
              <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <TierBadge tier={post.tier || '未评级'} />
                  {post.caption && <p className="text-sm text-[#8888a0] mt-1 truncate">{post.caption}</p>}
                </div>
                <p className="text-xs text-[#4a4a5a]">{post.vote_count} 票 · 均分 {post.avg_score.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

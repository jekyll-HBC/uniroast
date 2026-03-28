import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import api from '../api'

const TIER_BADGE = {
  '夯':     'bg-red-500 text-white',
  '顶级':   'bg-orange-400 text-white',
  '人上人': 'bg-yellow-300 text-gray-800',
  'NPC':    'bg-gray-100 text-gray-600',
  '拉完了': 'bg-white text-gray-400 border border-gray-200',
  '未评级': 'bg-gray-100 text-gray-400',
}

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
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            className="w-20 h-20 rounded-full"
            alt=""
          />
          <div>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{posts.length}</p>
            <p className="text-sm text-gray-600">参战次数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">{totalVotes}</p>
            <p className="text-sm text-gray-600">获得投票</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{bestTier ?? '-'}</p>
            <p className="text-sm text-gray-600">最高等级</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">我的战绩</h3>
      {loading ? (
        <div className="text-center text-gray-400 py-12">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>还没有参战记录</p>
          <button onClick={() => navigate('/')} className="mt-3 text-purple-600 font-medium py-2 px-4">
            去参加今日挑战 →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex">
              <img src={post.image_url} className="w-24 h-24 object-cover shrink-0" alt="" />
              <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_BADGE[post.tier || '未评级']}`}>
                    {post.tier || '未评级'}
                  </span>
                  {post.caption && <p className="text-sm text-gray-700 mt-1 truncate">{post.caption}</p>}
                </div>
                <p className="text-xs text-gray-400">{post.vote_count} 票 · 均分 {post.avg_score.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

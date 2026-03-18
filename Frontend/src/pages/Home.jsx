import { useState } from 'react'
import { Trophy, Upload } from 'lucide-react'

const VOTE_OPTIONS = [
  { emoji: '😐', label: '一般' },
  { emoji: '😊', label: '还行' },
  { emoji: '😄', label: '不错' },
  { emoji: '😍', label: '很赞' },
  { emoji: '🤩', label: '绝了' },
]

const rankBadge = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Home() {
  const [votes, setVotes] = useState({})
  const [likes, setLikes] = useState({ 1: 42, 2: 38 })
  const [liked, setLiked] = useState({})

  const todayTheme = {
    title: "最难以名状的食堂美食",
    emoji: "🍜",
    description: "展示你在食堂吃到的最离谱的饭菜"
  }

  const mockPosts = [
    {
      id: 1,
      username: "张三",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
      image: "https://picsum.photos/400/300?random=1",
      caption: "我觉得这应该是土豆炖牛肉...吧？",
      aiRoast: "这份菜成功证明了食堂阿姨是色盲，因为这个颜色在自然界根本不存在 🤢",
      rank: 1
    },
    {
      id: 2,
      username: "李四",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
      image: "https://picsum.photos/400/300?random=2",
      caption: "这是啥我真看不出来",
      aiRoast: "AI已被你的食物送进ICU抢救，建议你也去挂个号 💀",
      rank: 2
    }
  ]

  function handleVote(postId, index) {
    setVotes(v => ({ ...v, [postId]: index }))
  }

  function handleLike(postId) {
    if (liked[postId]) return
    setLiked(l => ({ ...l, [postId]: true }))
    setLikes(l => ({ ...l, [postId]: l[postId] + 1 }))
  }

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* 今日主题横幅 */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-4xl">{todayTheme.emoji}</span>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">今日挑战</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{todayTheme.title}</h2>
            <p className="text-white/90 text-sm">{todayTheme.description}</p>
          </div>
          <button className="bg-white text-purple-600 px-5 py-3 rounded-xl font-bold hover:bg-purple-50 transition flex items-center space-x-2 shrink-0 ml-4">
            <Upload size={18} />
            <span>参战</span>
          </button>
        </div>
      </div>

      {/* 今日战况 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Trophy className="text-yellow-500 mr-2" size={20} />
          今日战况
        </h3>
        <span className="text-sm text-gray-400">实时更新中...</span>
      </div>

      {/* 帖子列表 */}
      <div className="space-y-6">
        {mockPosts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* 用户信息 */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <img src={post.avatar} className="w-9 h-9 rounded-full" alt="" />
                <span className="font-semibold text-gray-800">{post.username}</span>
              </div>
              {rankBadge[post.rank] && (
                <span className="text-2xl">{rankBadge[post.rank]}</span>
              )}
            </div>

            {/* 图片 */}
            <img src={post.image} className="w-full aspect-[4/3] object-cover" alt="" />

            {/* AI 评论区 — 视觉核心 */}
            <div className="mx-4 mt-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-start space-x-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-600 mb-1">AI 毒舌评委</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{post.aiRoast}</p>
                </div>
              </div>
            </div>

            {/* 投票区 — emoji 横排大按钮 */}
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-gray-400 mb-2 text-center">你觉得这道菜怎么样？</p>
              <div className="flex justify-between gap-1">
                {VOTE_OPTIONS.map((opt, i) => {
                  const selected = votes[post.id] === i
                  return (
                    <button
                      key={i}
                      onClick={() => handleVote(post.id, i)}
                      className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all
                        ${selected
                          ? 'bg-purple-100 scale-110 shadow-sm'
                          : 'hover:bg-gray-50 active:scale-95'
                        }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`text-xs mt-0.5 ${selected ? 'text-purple-600 font-semibold' : 'text-gray-400'}`}>
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 底部：配文 + 点赞评论 */}
            <div className="px-4 pb-4 pt-2">
              <p className="text-sm text-gray-600 mb-3">{post.caption}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 transition ${liked[post.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                >
                  <span>{liked[post.id] ? '❤️' : '🤍'}</span>
                  <span className="text-sm font-medium">{likes[post.id]}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition">
                  <span>💬</span>
                  <span className="text-sm">评论</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

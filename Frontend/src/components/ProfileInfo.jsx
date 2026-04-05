import TierBadge from './TierBadge'

export default function ProfileInfo({ user, posts }) {
  const totalVotes = posts.reduce((sum, p) => sum + p.vote_count, 0)
  const bestTier = posts.find(p => p.tier === '夯') ? '夯' : posts.find(p => p.tier === '顶级') ? '顶级' : null

  return (
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
  )
}

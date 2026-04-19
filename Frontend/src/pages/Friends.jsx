import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useAuth from '../store/useAuth'

function UserCard({ u, onToggle }) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      await onToggle(u)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0] last:border-0">
      <img
        src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
        className="w-10 h-10 rounded-full shrink-0"
        alt=""
        onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#333] truncate">{u.username}</p>
        {u.bio && <p className="text-xs text-[#888] truncate">{u.bio}</p>}
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 disabled:opacity-50 transition ${
          u.is_following
            ? 'bg-[#f0f0f0] text-[#555]'
            : 'bg-[#1a7a1a] text-white'
        }`}
      >
        {u.is_following ? '已關注' : '關注'}
      </button>
    </div>
  )
}

export default function Friends() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('following') // 'following' | 'followers' | 'search'
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchFollowing()
    fetchFollowers()
  }, [user])

  async function fetchFollowing() {
    const { data } = await api.get(`/users/${user.id}/following`)
    setFollowing(data)
  }

  async function fetchFollowers() {
    const { data } = await api.get(`/users/${user.id}/followers`)
    setFollowers(data)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(query.trim())}`)
      setSearchResults(data)
      setTab('search')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleFollow(u) {
    if (u.is_following) {
      await api.delete(`/users/${u.id}/follow`)
    } else {
      await api.post(`/users/${u.id}/follow`)
    }
    const updated = { ...u, is_following: !u.is_following }
    setSearchResults(prev => prev.map(x => x.id === u.id ? updated : x))
    setFollowing(prev => {
      if (u.is_following) return prev.filter(x => x.id !== u.id)
      return [...prev, updated]
    })
    setFollowers(prev => prev.map(x => x.id === u.id ? updated : x))
  }

  const tabs = [
    { key: 'following', label: `關注 ${following.length}` },
    { key: 'followers', label: `粉絲 ${followers.length}` },
  ]

  const listMap = { following, followers, search: searchResults }
  const currentList = listMap[tab] || []

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-[#e0e0e0]">
        <button onClick={() => navigate(-1)} className="text-[#1a7a1a] text-sm">‹ 返回</button>
        <span className="font-semibold text-sm flex-1 text-center">好友</span>
        <span className="w-8" />
      </div>

      <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索用戶名…"
            className="flex-1 bg-white rounded-xl px-4 py-2 text-sm border border-[#e0e0e0] outline-none focus:border-[#1a7a1a]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a7a1a] text-white text-sm px-4 rounded-xl disabled:opacity-50"
          >
            搜索
          </button>
        </div>
      </form>

      <div className="flex px-4 gap-2 mb-2">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-1.5 rounded-full font-semibold transition ${
              tab === t.key ? 'bg-[#1a7a1a] text-white' : 'bg-white text-[#555]'
            }`}
          >
            {t.label}
          </button>
        ))}
        {tab === 'search' && (
          <button
            onClick={() => setTab('following')}
            className="text-sm px-4 py-1.5 rounded-full font-semibold bg-[#1a7a1a] text-white"
          >
            搜索結果
          </button>
        )}
      </div>

      <div className="bg-white mx-4 rounded-xl overflow-hidden">
        {currentList.length === 0 ? (
          <p className="text-center text-[#888] text-sm py-10">
            {tab === 'search' ? '無搜索結果' : tab === 'following' ? '還沒有關注任何人' : '還沒有粉絲'}
          </p>
        ) : (
          currentList.map(u => (
            <UserCard key={u.id} u={u} onToggle={handleToggleFollow} />
          ))
        )}
      </div>
    </div>
  )
}

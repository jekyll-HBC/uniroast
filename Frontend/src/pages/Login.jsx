import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-white/15 border border-white/30 rounded-xl focus:outline-none focus:border-white text-white placeholder-white/50"

  return (
    <div className="min-h-screen bg-[#1a7a1a] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 装饰圆圈 */}
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-1">登录</h2>
          <p className="text-white/80">
            {isLogin ? '烤肉人，歡迎您～' : '加入 WeRoast'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">用户名</label>
              <input type="text" required className={inputClass} placeholder="输入用户名"
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">邮箱</label>
            <input type="email" required className={inputClass} placeholder="your@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">密码</label>
            <input type="password" required className={inputClass} placeholder="输入密码"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          {error && <p className="text-red-300 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-[#1a7a1a] py-3 rounded-xl font-bold disabled:opacity-60 transition mt-2"
          >
            {loading ? '请稍候...' : isLogin ? '使用账号密码' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-white/70 font-medium py-3 px-4"
          >
            {isLogin ? '还没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </div>
  )
}

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

  const inputClass = "w-full px-4 py-3 bg-[#22222f] border border-white/10 rounded-xl focus:outline-none focus:border-[#a855f7] text-[#f0f0f5] placeholder-[#4a4a5a]"

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-[#1a1a24] card-border p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#f0f0f5]">
            {isLogin ? '欢迎回来' : '加入UniRoast'}
          </h2>
          <p className="text-[#8888a0]">
            {isLogin ? '继续你的吐槽之旅' : '开始你的校园社交'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#8888a0] mb-1">用户名</label>
              <input type="text" required className={inputClass} placeholder="输入用户名"
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#8888a0] mb-1">邮箱</label>
            <input type="email" required className={inputClass} placeholder="your@email.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8888a0] mb-1">密码</label>
            <input type="password" required className={inputClass} placeholder="输入密码"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white py-3 rounded-xl font-bold disabled:opacity-60 transition"
          >
            {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-[#a855f7] font-medium py-3 px-4"
          >
            {isLogin ? '还没有账号？去注册' : '已有账号？去登录'}
          </button>
        </div>
      </div>
    </div>
  )
}

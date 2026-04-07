import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../store/useAuth'
import api from '../api'

export default function ProfileInfo() {
  const { user, fetchMe } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    private_email: user?.private_email || '',
    phone: user?.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || null)
  const [uploading, setUploading] = useState(false)

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await api.post('/upload/', fd)
      setAvatarUrl(data.image_url)
      await api.patch('/auth/me', { avatar_url: data.image_url })
      await fetchMe()
    } catch {
      alert('頭像上傳失敗，請重試')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/auth/me', form)
      await fetchMe()
      navigate(-1)
    } catch {
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-[#e0e0e0]">
        <button onClick={() => navigate(-1)} className="text-[#1a7a1a] text-sm">‹ 返回</button>
        <span className="font-semibold text-sm">個人信息</span>
        <button onClick={handleSave} disabled={saving}
          className="text-[#1a7a1a] font-semibold text-sm disabled:opacity-50">
          {saving ? '保存中' : '保存'}
        </button>
      </div>

      <div className="bg-white mx-4 mt-4 rounded-xl p-4 flex flex-col items-center gap-2">
        <label className="cursor-pointer relative">
          <img src={avatarUrl || defaultAvatar}
            className="w-16 h-16 rounded-full" alt=""
            onError={e => { e.target.src = defaultAvatar }} />
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs">上傳中</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
        </label>
        <span className="text-xs text-[#1a7a1a]">點擊更換頭像</span>
      </div>

      <p className="text-xs text-[#888] px-6 mt-4 mb-1">基本信息</p>
      <div className="bg-white mx-4 rounded-xl overflow-hidden">
        {[
          { label: '用戶名', value: form.username, editable: true, key: 'username' },
          { label: '個人簡介', value: form.bio, editable: true, key: 'bio' },
          { label: '性別', value: user.gender || '未設置', editable: false },
          { label: '學院', value: user.college || '未設置', editable: false },
        ].map(({ label, value, editable, key }) => (
          <div key={label} className="flex items-center px-4 py-3 border-b border-[#f0f0f0] last:border-0">
            <span className="text-sm text-[#333] w-20 shrink-0">{label}</span>
            {editable
              ? <input value={value} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="flex-1 text-sm text-right text-[#1a7a1a] outline-none bg-transparent" />
              : <span className="flex-1 text-sm text-[#888] text-right">{value}</span>
            }
          </div>
        ))}
      </div>

      <p className="text-xs text-[#888] px-6 mt-4 mb-1">聯繫方式</p>
      <div className="bg-white mx-4 rounded-xl overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-[#f0f0f0]">
          <span className="text-sm text-[#333] w-20 shrink-0">大學郵箱</span>
          <span className="flex-1 text-xs text-[#888] text-right">{user.email}</span>
        </div>
        <div className="flex items-center px-4 py-3 border-b border-[#f0f0f0]">
          <span className="text-sm text-[#333] w-20 shrink-0">私人郵箱</span>
          <input value={form.private_email} onChange={e => setForm(f => ({ ...f, private_email: e.target.value }))}
            className="flex-1 text-sm text-right text-[#1a7a1a] outline-none bg-transparent" placeholder="未設置" />
        </div>
        <div className="flex items-center px-4 py-3">
          <span className="text-sm text-[#333] w-20 shrink-0">手機號</span>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="flex-1 text-sm text-right text-[#1a7a1a] outline-none bg-transparent" placeholder="未設置" />
        </div>
      </div>

      <p className="text-xs text-[#888] px-6 mt-4 mb-1">賬號安全</p>
      <div className="bg-white mx-4 rounded-xl overflow-hidden mb-8">
        <button onClick={() => alert('修改密碼功能即將上線')} className="w-full flex items-center px-4 py-3">
          <span className="text-sm text-[#333]">修改密碼</span>
          <span className="ml-auto text-[#1a7a1a] text-sm">›</span>
        </button>
      </div>
    </div>
  )
}

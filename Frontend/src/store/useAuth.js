import { create } from 'zustand'
import api from '../api'

const useAuth = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    const me = await api.get('/auth/me')
    set({ token: data.access_token, user: me.data })
  },

  register: async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('token', data.access_token)
    const me = await api.get('/auth/me')
    set({ token: data.access_token, user: me.data })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data })
    } catch {
      localStorage.removeItem('token')
      set({ token: null, user: null })
    }
  },
}))

export default useAuth

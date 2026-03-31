import { create } from 'zustand'

const useToast = create(set => ({
  message: null,
  show: (message) => {
    set({ message })
    setTimeout(() => set({ message: null }), 3000)
  },
}))

export default useToast

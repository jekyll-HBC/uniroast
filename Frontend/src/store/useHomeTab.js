import { create } from 'zustand'

const useHomeTab = create(set => ({
  tab: 'today',
  setTab: (tab) => set({ tab }),
}))

export default useHomeTab

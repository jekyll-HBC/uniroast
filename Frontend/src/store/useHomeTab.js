import { create } from 'zustand'

export const HOME_TABS = ['recommend', 'today', 'all']

const useHomeTab = create(set => ({
  tab: 'recommend',
  setTab: (tab) => set({ tab }),
}))

export default useHomeTab

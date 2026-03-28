export const TIERS = ['夯', '顶级', '人上人', 'NPC', '拉完了']

export const TIER_SCORES = { '夯': 5, '顶级': 4, '人上人': 3, 'NPC': 2, '拉完了': 1 }

// badge: Tailwind class string for tier badge
export const TIER_STYLE = {
  '夯':    { badge: 'bg-red-500 text-white' },
  '顶级':  { badge: 'bg-orange-400 text-white' },
  '人上人':{ badge: 'bg-yellow-300 text-gray-800' },
  'NPC':   { badge: 'bg-gray-100 text-gray-600' },
  '拉完了':{ badge: 'bg-white text-gray-400 border border-gray-200' },
  '未评级':{ badge: 'bg-gray-100 text-gray-400' },
}

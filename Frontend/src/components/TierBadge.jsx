// 统一的 Tier 徽章组件，替代各页面重复的 TIER_STYLE/TIER_BADGE 定义
const TIER_CONFIG = {
  '夯':    { bg: 'bg-[#ff3b3b]', text: 'text-white', glow: 'glow-heng' },
  '顶级':  { bg: 'bg-[#ff8c00]', text: 'text-white', glow: 'glow-top' },
  '人上人':{ bg: 'bg-[#ffd700]', text: 'text-gray-900', glow: 'glow-above' },
  'NPC':   { bg: 'bg-[#2a2a38]', text: 'text-[#8888a0]', glow: '' },
  '拉完了':{ bg: 'bg-[#1a1a24]', text: 'text-[#4a4a5a]', glow: '', extra: 'border border-white/10 line-through' },
  '未评级':{ bg: 'bg-[#1a1a24]', text: 'text-[#4a4a5a]', glow: '' },
}

export function getTierConfig(tier) {
  return TIER_CONFIG[tier] || TIER_CONFIG['未评级']
}

// size: 'sm' | 'md'
export default function TierBadge({ tier, size = 'sm', className = '' }) {
  const cfg = getTierConfig(tier)
  const sizeClass = size === 'md' ? 'text-sm px-3 py-1 font-bold' : 'text-xs px-2 py-0.5 font-bold'
  return (
    <span className={`rounded-full inline-block ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.glow} ${cfg.extra ?? ''} ${className}`}>
      {tier}
    </span>
  )
}

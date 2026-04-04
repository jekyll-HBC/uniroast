/**
 * Maps heng/total vote counts to a tier label.
 * Mirrors the backend schemas.ratio_to_tier logic.
 */
export function ratioToTier(hengCount, totalVotes) {
  if (totalVotes < 3) return '未评级'
  const rate = hengCount / totalVotes
  if (rate >= 0.92) return '夯'
  if (rate >= 0.75) return '顶级'
  if (rate >= 0.50) return '人上人'
  if (rate >= 0.25) return 'NPC'
  return '拉完了'
}

// Backward-compat alias (avg_score now stores heng_rate)
export function scoreToTier(hengRate, voteCount) {
  return ratioToTier(Math.round(hengRate * voteCount), voteCount)
}

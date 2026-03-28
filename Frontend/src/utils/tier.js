/**
 * Maps average score + vote count to a tier label.
 * Mirrors the backend schemas.score_to_tier logic.
 */
export function scoreToTier(avg, voteCount) {
  if (voteCount === 0) return '未评级'
  if (avg >= 4.5) return '夯'
  if (avg >= 3.5) return '顶级'
  if (avg >= 2.5) return '人上人'
  if (avg >= 1.5) return 'NPC'
  return '拉完了'
}

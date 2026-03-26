import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scoreToTier } from '../utils/tier'

// ── scoreToTier ───────────────────────────────────────────────────────────────

describe('scoreToTier', () => {
  it('returns 未评级 when no votes', () => {
    expect(scoreToTier(0, 0)).toBe('未评级')
  })
  it('returns 夯 for avg >= 4.5', () => {
    expect(scoreToTier(4.5, 1)).toBe('夯')
    expect(scoreToTier(5.0, 10)).toBe('夯')
  })
  it('returns 顶级 for avg in [3.5, 4.5)', () => {
    expect(scoreToTier(3.5, 1)).toBe('顶级')
    expect(scoreToTier(4.4, 1)).toBe('顶级')
  })
  it('returns 人上人 for avg in [2.5, 3.5)', () => {
    expect(scoreToTier(2.5, 1)).toBe('人上人')
  })
  it('returns NPC for avg in [1.5, 2.5)', () => {
    expect(scoreToTier(1.5, 1)).toBe('NPC')
  })
  it('returns 拉完了 for avg < 1.5', () => {
    expect(scoreToTier(1.0, 1)).toBe('拉完了')
  })
})

// ── api module ────────────────────────────────────────────────────────────────

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: { request: { use: vi.fn() } },
    get: vi.fn(),
    post: vi.fn(),
  }
  return { default: mockAxios }
})

describe('api module', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exports a default axios instance', async () => {
    const { default: api } = await import('../api.js')
    expect(api).toBeDefined()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ratioToTier, scoreToTier } from '../utils/tier'

describe('ratioToTier', () => {
  it('returns 未评级 when < 3 votes', () => {
    expect(ratioToTier(0, 0)).toBe('未评级')
    expect(ratioToTier(2, 2)).toBe('未评级')
  })
  it('returns 夯 for rate >= 92%', () => {
    expect(ratioToTier(3, 3)).toBe('夯')
    expect(ratioToTier(10, 10)).toBe('夯')
  })
  it('returns 顶级 for rate in [75%, 92%)', () => {
    expect(ratioToTier(3, 4)).toBe('顶级')
  })
  it('returns 人上人 for rate in [50%, 75%)', () => {
    expect(ratioToTier(2, 4)).toBe('人上人')
  })
  it('returns NPC for rate in [25%, 50%)', () => {
    expect(ratioToTier(1, 4)).toBe('NPC')
  })
  it('returns 拉完了 for rate < 25%', () => {
    expect(ratioToTier(0, 4)).toBe('拉完了')
  })
})

describe('scoreToTier (backward compat)', () => {
  it('returns 未评级 when no votes', () => {
    expect(scoreToTier(0, 0)).toBe('未评级')
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

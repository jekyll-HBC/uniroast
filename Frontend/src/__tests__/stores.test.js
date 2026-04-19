// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── useHomeTab ────────────────────────────────────────────────────────────────

describe('useHomeTab store', () => {
  let useHomeTab, HOME_TABS

  beforeEach(async () => {
    vi.resetModules()
    ;({ default: useHomeTab, HOME_TABS } = await import('../store/useHomeTab'))
  })

  it('has default tab "recommend"', () => {
    expect(useHomeTab.getState().tab).toBe('recommend')
  })

  it('HOME_TABS contains expected values', () => {
    expect(HOME_TABS).toEqual(['recommend', 'today', 'all'])
  })

  it('setTab updates the tab', () => {
    useHomeTab.getState().setTab('today')
    expect(useHomeTab.getState().tab).toBe('today')
  })

  it('setTab to "all" works', () => {
    useHomeTab.getState().setTab('all')
    expect(useHomeTab.getState().tab).toBe('all')
  })
})

// ── useToast ──────────────────────────────────────────────────────────────────

describe('useToast store', () => {
  let useToast

  beforeEach(async () => {
    vi.resetModules()
    vi.useFakeTimers()
    ;({ default: useToast } = await import('../store/useToast'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts with null message', () => {
    expect(useToast.getState().message).toBeNull()
  })

  it('show sets the message', () => {
    useToast.getState().show('Hello!')
    expect(useToast.getState().message).toBe('Hello!')
  })

  it('message clears after 3 seconds', () => {
    useToast.getState().show('Bye!')
    expect(useToast.getState().message).toBe('Bye!')
    vi.advanceTimersByTime(3000)
    expect(useToast.getState().message).toBeNull()
  })

  it('message still present before 3 seconds', () => {
    useToast.getState().show('Still here')
    vi.advanceTimersByTime(2999)
    expect(useToast.getState().message).toBe('Still here')
  })
})

// ── useAuth store ─────────────────────────────────────────────────────────────

vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    interceptors: { request: { use: vi.fn() } },
    get: vi.fn(),
    post: vi.fn(),
  }
  return { default: mockAxios }
})

describe('useAuth store', () => {
  let useAuth, mockAxios

  beforeEach(async () => {
    vi.resetModules()
    localStorage.clear()
    mockAxios = (await import('axios')).default
    vi.clearAllMocks()
    ;({ default: useAuth } = await import('../store/useAuth'))
  })

  it('starts with null user and reads token from localStorage', () => {
    const state = useAuth.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
  })

  it('login sets token and user', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { access_token: 'tok123' } })
    mockAxios.get.mockResolvedValueOnce({ data: { id: 1, username: 'alice' } })

    await useAuth.getState().login('alice@test.com', 'pass')

    expect(localStorage.getItem('token')).toBe('tok123')
    expect(useAuth.getState().token).toBe('tok123')
    expect(useAuth.getState().user).toEqual({ id: 1, username: 'alice' })
  })

  it('register sets token and user', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { access_token: 'reg_tok' } })
    mockAxios.get.mockResolvedValueOnce({ data: { id: 2, username: 'bob' } })

    await useAuth.getState().register('bob', 'bob@test.com', 'pass')

    expect(localStorage.getItem('token')).toBe('reg_tok')
    expect(useAuth.getState().user).toEqual({ id: 2, username: 'bob' })
  })

  it('logout clears token and user', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { access_token: 'tok' } })
    mockAxios.get.mockResolvedValueOnce({ data: { id: 1, username: 'alice' } })
    await useAuth.getState().login('alice@test.com', 'pass')

    useAuth.getState().logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(useAuth.getState().token).toBeNull()
    expect(useAuth.getState().user).toBeNull()
  })

  it('fetchMe updates user on success', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { id: 1, username: 'alice' } })

    await useAuth.getState().fetchMe()

    expect(useAuth.getState().user).toEqual({ id: 1, username: 'alice' })
  })

  it('fetchMe clears token on error', async () => {
    localStorage.setItem('token', 'stale_tok')
    mockAxios.get.mockRejectedValueOnce(new Error('401'))

    await useAuth.getState().fetchMe()

    expect(localStorage.getItem('token')).toBeNull()
    expect(useAuth.getState().token).toBeNull()
    expect(useAuth.getState().user).toBeNull()
  })
})

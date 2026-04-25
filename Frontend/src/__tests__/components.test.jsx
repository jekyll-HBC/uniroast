// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TierBadge, { getTierConfig } from '../components/TierBadge'

describe('TierBadge', () => {
  it('renders 夯 tier text', () => {
    render(<TierBadge tier="夯" />)
    expect(screen.getByText('夯')).toBeDefined()
  })

  it('renders 未评级 tier text', () => {
    render(<TierBadge tier="未评级" />)
    expect(screen.getByText('未评级')).toBeDefined()
  })

  it('renders NPC tier text', () => {
    render(<TierBadge tier="NPC" />)
    expect(screen.getByText('NPC')).toBeDefined()
  })

  it('renders 顶级 tier text', () => {
    render(<TierBadge tier="顶级" />)
    expect(screen.getByText('顶级')).toBeDefined()
  })

  it('renders 拉完了 tier text', () => {
    render(<TierBadge tier="拉完了" />)
    expect(screen.getByText('拉完了')).toBeDefined()
  })

  it('renders 人上人 tier text', () => {
    render(<TierBadge tier="人上人" />)
    expect(screen.getByText('人上人')).toBeDefined()
  })

  it('defaults to sm size class', () => {
    const { container } = render(<TierBadge tier="NPC" />)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-xs')
  })

  it('applies md size class when size=md', () => {
    const { container } = render(<TierBadge tier="夯" size="md" />)
    const span = container.querySelector('span')
    expect(span.className).toContain('text-sm')
  })

  it('applies extra line-through class for 拉完了', () => {
    const { container } = render(<TierBadge tier="拉完了" />)
    const span = container.querySelector('span')
    expect(span.className).toContain('line-through')
  })
})

describe('getTierConfig', () => {
  it('returns red bg for 夯', () => {
    expect(getTierConfig('夯').bg).toBe('bg-[#ff3b3b]')
  })

  it('falls back to 未评级 config for unknown tier', () => {
    const fallback = getTierConfig('unknown')
    const unrated = getTierConfig('未评级')
    expect(fallback).toEqual(unrated)
  })
})

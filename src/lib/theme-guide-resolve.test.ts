import { describe, expect, it } from 'vitest'
import {
  getClassesForLayoutKey,
  getThemeInputClasses,
  isLayoutThemeKey,
} from './theme-guide-resolve'

describe('theme-guide-resolve', () => {
  it('resolves heading.h2 with brand text classes', () => {
    const c = getClassesForLayoutKey('heading.h2')
    expect(c).toContain('text-brandcolor-textstrong')
  })

  it('isLayoutThemeKey accepts known keys only', () => {
    expect(isLayoutThemeKey('heading.h1')).toBe(true)
    expect(isLayoutThemeKey('profileCard.title')).toBe(true)
    expect(isLayoutThemeKey('unknown.key')).toBe(false)
  })

  it('getThemeInputClasses returns brand input utilities', () => {
    const c = getThemeInputClasses()
    expect(c).toContain('rounded-md')
    expect(c).toContain('border-brandcolor')
  })
})

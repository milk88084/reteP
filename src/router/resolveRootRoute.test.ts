import { describe, it, expect } from 'vitest'
import { resolveRootRoute } from './resolveRootRoute'

describe('resolveRootRoute', () => {
  it('shows loading while Clerk has not loaded yet', () => {
    expect(resolveRootRoute(false, false)).toBe('loading')
    expect(resolveRootRoute(false, true)).toBe('loading')
  })

  it('shows the app for a signed-in user', () => {
    expect(resolveRootRoute(true, true)).toBe('app')
  })

  it('shows the landing page for a signed-out user', () => {
    expect(resolveRootRoute(true, false)).toBe('landing')
  })
})

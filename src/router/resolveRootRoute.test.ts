import { describe, it, expect } from 'vitest'
import { resolveRootRoute } from './resolveRootRoute'

describe('resolveRootRoute', () => {
  it('shows the app for a signed-in user', () => {
    expect(resolveRootRoute(true, true, true)).toBe('app')
  })

  it('shows the landing page for a signed-out user', () => {
    expect(resolveRootRoute(true, false, false)).toBe('landing')
  })

  it('waits while Clerk loads if a session cookie is present', () => {
    // A returning signed-in user: don't flash the landing page at them.
    expect(resolveRootRoute(false, false, true)).toBe('loading')
  })

  it('shows the landing page immediately while Clerk loads with no session cookie', () => {
    // Guests and crawlers (prerender) get real content on first paint, no spinner.
    expect(resolveRootRoute(false, false, false)).toBe('landing')
  })
})

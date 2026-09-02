import { describe, it, expect, vi } from 'vitest'
import { trackRouterPageViews } from './usePageViews'

type Listener = (state: {
  navigation: { state: 'idle' | 'loading' | 'submitting' }
  location: { pathname: string; search: string }
}) => void

function fakeRouter(pathname: string, search = '') {
  let listener: Listener | undefined
  return {
    state: { location: { pathname, search } },
    subscribe(cb: Listener) {
      listener = cb
      return () => {
        listener = undefined
      }
    },
    emit(pathname: string, search: string, navState: 'idle' | 'loading') {
      listener?.({ navigation: { state: navState }, location: { pathname, search } })
    },
    get hasListener() {
      return listener !== undefined
    },
  }
}

describe('trackRouterPageViews', () => {
  it('sends a page view for the current location on start', () => {
    const trackPageView = vi.fn()
    const router = fakeRouter('/support')
    trackRouterPageViews(router as never, { trackPageView })
    expect(trackPageView).toHaveBeenCalledWith('/support')
  })

  it('sends a page view after each settled navigation', () => {
    const trackPageView = vi.fn()
    const router = fakeRouter('/')
    trackRouterPageViews(router as never, { trackPageView })
    trackPageView.mockClear()

    router.emit('/history', '?day=2026-09-02', 'idle')
    expect(trackPageView).toHaveBeenCalledWith('/history?day=2026-09-02')
  })

  it('ignores in-flight navigations (state !== idle)', () => {
    const trackPageView = vi.fn()
    const router = fakeRouter('/')
    trackRouterPageViews(router as never, { trackPageView })
    trackPageView.mockClear()

    router.emit('/history', '', 'loading')
    expect(trackPageView).not.toHaveBeenCalled()
  })

  it('returns the router unsubscribe function', () => {
    const router = fakeRouter('/')
    const cleanup = trackRouterPageViews(router as never, { trackPageView: vi.fn() })
    expect(router.hasListener).toBe(true)
    cleanup()
    expect(router.hasListener).toBe(false)
  })
})

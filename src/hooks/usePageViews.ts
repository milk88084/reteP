import { useEffect } from 'react'
// Static import is safe: App.tsx already imports `router` eagerly, and
// src/router/index.tsx imports only page modules (never App / analytics /
// this hook), so `router` is fully initialised by the time this effect runs.
// If router/index.tsx ever imports a non-page module, switch to a dynamic
// import('@/router') inside the effect.
import { router } from '@/router'
import { initGA, trackPageView } from '@/lib/analytics'

type RouterLike = {
  state: { location: { pathname: string; search: string } }
  subscribe: (listener: (state: {
    navigation: { state: string }
    location: { pathname: string; search: string }
  }) => void) => () => void
}

/**
 * Report the current location, then a page view after every settled navigation.
 * Pure and dependency-injected so it can be tested without React or a real router.
 * Returns the router's unsubscribe function.
 */
export function trackRouterPageViews(
  r: RouterLike,
  deps: { trackPageView: (path: string) => void } = { trackPageView },
): () => void {
  const here = r.state.location
  deps.trackPageView(here.pathname + here.search)

  return r.subscribe((state) => {
    if (state.navigation.state === 'idle') {
      deps.trackPageView(state.location.pathname + state.location.search)
    }
  })
}

/** Mount once (in App): initialise GA and send a page_view on every route change. */
export function usePageViews(): void {
  useEffect(() => {
    initGA()
    return trackRouterPageViews(router as RouterLike)
  }, [])
}

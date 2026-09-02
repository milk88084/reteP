export type RootRouteDecision = 'loading' | 'landing' | 'app'

/**
 * What `/` should render, given Clerk's auth state.
 *
 * `hasSession` is a cheap synchronous hint (a Clerk session cookie exists) used
 * only while Clerk is still loading: with no cookie we show the landing page
 * immediately — real content on first paint for guests and for the build-time
 * prerender crawler, instead of a spinner. With a cookie we wait, so a returning
 * signed-in user never sees the landing page flash.
 */
export const resolveRootRoute = (
  isLoaded: boolean,
  isSignedIn: boolean,
  hasSession: boolean,
): RootRouteDecision => {
  if (!isLoaded) return hasSession ? 'loading' : 'landing'
  return isSignedIn ? 'app' : 'landing'
}

export type RootRouteDecision = 'loading' | 'landing' | 'app'

/** What `/` should render, given Clerk's auth state. */
export const resolveRootRoute = (isLoaded: boolean, isSignedIn: boolean): RootRouteDecision => {
  if (!isLoaded) return 'loading'
  return isSignedIn ? 'app' : 'landing'
}

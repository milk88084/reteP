/**
 * Google Analytics 4 — thin wrapper.
 *
 * Measurement ID resolution:
 *   1. VITE_GA_MEASUREMENT_ID env var (set one on Vercel to override, or set it
 *      empty on a given environment to turn GA off there).
 *   2. Otherwise, in production builds only, the default property below.
 *   3. Otherwise (local dev) → undefined, and every function here is a no-op.
 *
 * A Measurement ID is not a secret — it ships in the client bundle of every
 * GA-enabled site — so keeping the default in source is fine.
 *
 * SPA page views: gtag's automatic page_view is disabled (`send_page_view:false`)
 * and `trackPageView` is called from the router (see `usePageViews`).
 */

const DEFAULT_GA_ID = 'G-6HN3WXEM9C'

function gaId(): string | undefined {
  const fromEnv = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (fromEnv !== undefined) return fromEnv ? String(fromEnv) : undefined
  return import.meta.env.PROD ? DEFAULT_GA_ID : undefined
}

let initialised = false

/** Strip the query string (and any auth tickets in it); keep only the pathname. */
export function sanitizePath(pathAndQuery: string): string {
  const [path] = pathAndQuery.split('?')
  return path || '/'
}

/** Inject the gtag script once. No-op without a Measurement ID or outside the browser. */
export function initGA(): void {
  // TODO(consent): this project has no cookie/consent mechanism yet. Once one
  // exists, bail out here when analytics consent is not granted, or switch to
  // gtag('consent', 'default', { analytics_storage: 'denied' }) before config.
  const id = gaId()
  if (initialised || !id || typeof window === 'undefined') return
  initialised = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // gtag pushes `arguments` verbatim onto dataLayer.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

/** Send a page_view for a route change. Path is always sanitized (no query string). */
export function trackPageView(pathAndQuery: string): void {
  if (!gaId() || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'page_view', { page_path: sanitizePath(pathAndQuery) })
}

/** Send a custom event. No-op when GA is not configured. */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!gaId() || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}

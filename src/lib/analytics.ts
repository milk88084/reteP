/**
 * Google Analytics 4 — thin wrapper.
 *
 * The Measurement ID comes from VITE_GA_MEASUREMENT_ID. When it is unset every
 * function here is a no-op: no script is injected and nothing throws. This keeps
 * local dev and preview builds free of analytics unless explicitly configured.
 *
 * SPA page views: gtag's automatic page_view is disabled (`send_page_view:false`)
 * and `trackPageView` is called from the router (see `usePageViews`).
 */

function gaId(): string | undefined {
  const id = import.meta.env.VITE_GA_MEASUREMENT_ID
  return id ? String(id) : undefined
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

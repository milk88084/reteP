/**
 * Single source of truth for site-wide identity, canonical URLs and SEO metadata.
 * Imported by both the app (Seo component, pages) and the build-time prerender script.
 */

/** Production origin, no trailing slash. */
export const SITE_URL = 'https://rete-p.vercel.app'
export const SITE_NAME = 'reteP'
export const APP_STORE_URL = 'https://apps.apple.com/tw/app/id6798490139'
export const CONTACT_EMAIL = 'milk88084@gmail.com'
export const DEVELOPER_NAME = 'Li KO CHUAN'

/** Open Graph share image, absolute URL. */
export const OG_IMAGE = `${SITE_URL}/og-cover.jpg`

/** Routes rendered at build time (scripts/prerender.mjs) and listed in sitemap.xml. */
export const PUBLIC_ROUTES = ['/', '/support', '/privacy', '/about'] as const

/** Routes that must never be indexed. */
export const NOINDEX_ROUTES = ['/login', '/sso-callback'] as const

export type PublicRoute = (typeof PUBLIC_ROUTES)[number]

/**
 * Last content update per public route (YYYY-MM-DD). Drives the visible
 * "最後更新日期", WebPage schema `dateModified`, and sitemap.xml `<lastmod>`.
 * Update the relevant entry whenever a page's content changes.
 */
export const LAST_UPDATED: Record<PublicRoute, string> = {
  '/': '2026-09-02',
  '/support': '2026-09-02',
  '/privacy': '2026-08-28',
  '/about': '2026-09-02',
}

/** Absolute canonical URL for a route. Root keeps its trailing slash. */
export function canonicalUrl(path: string): string {
  return path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`
}

/** '2026-08-28' → '2026 年 8 月 28 日' for display. */
export function formatUpdated(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${y} 年 ${m} 月 ${d} 日`
}

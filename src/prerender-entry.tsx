import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { LandingPage } from './pages/LandingPage'
import { SupportPage } from './pages/SupportPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { AboutPage } from './pages/AboutPage'

/**
 * Build-time renderer used by scripts/prerender.mjs. Each public route's page
 * component is rendered directly to an HTML string (no browser, no ClerkProvider
 * — none of these pages use Clerk hooks). react-helmet-async collects the <head>
 * tags via its SSR context.
 */
const PAGES: Record<string, () => JSX.Element> = {
  '/': LandingPage,
  '/support': SupportPage,
  '/privacy': PrivacyPage,
  '/about': AboutPage,
}

export function render(path: string): { html: string; head: string } {
  const Page = PAGES[path]
  if (!Page) throw new Error(`prerender-entry: no page for "${path}"`)

  const helmetContext: { helmet?: HelmetServerState } = {}
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={path}>
        <Page />
      </StaticRouter>
    </HelmetProvider>,
  )

  const h = helmetContext.helmet!
  const head = [h.title, h.meta, h.link, h.script].map((t) => t.toString()).join('')
  return { html, head }
}

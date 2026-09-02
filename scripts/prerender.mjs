/**
 * Build-time prerender for public routes.
 *
 * After `vite build`, this serves `dist/` with `vite preview`, visits each public
 * route in headless Chromium, waits for the page's `[data-prerender-ready]`
 * marker, and writes the fully-rendered HTML back into `dist/` so crawlers get
 * real content (body + JSON-LD) instead of an empty `<div id="root">`.
 *
 * Disable with `PRERENDER=false` (e.g. a Vercel env var) — `dist/` then stays a
 * plain SPA build and the `vercel.json` rewrite serves index.html for everything.
 */
import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { preview } from 'vite'
import { chromium } from 'playwright'

if (process.env.PRERENDER === 'false') {
  console.log('[prerender] skipped (PRERENDER=false)')
  process.exit(0)
}

// CI/Vercel installs the `playwright` package but not the browser binary; this is
// a no-op once the binary is present. Skip with PRERENDER_SKIP_INSTALL=1 locally.
if (process.env.PRERENDER_SKIP_INSTALL !== '1') {
  try {
    execFileSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', shell: true })
  } catch {
    console.warn('[prerender] "playwright install chromium" failed; continuing (binary may already exist)')
  }
}

// Keep in sync with PUBLIC_ROUTES in src/constants/site.ts.
// Maps route -> output file relative to dist/.
const ROUTES = {
  '/': 'index.html',
  '/support': 'support.html',
  '/privacy': 'privacy.html',
  '/about': 'about.html',
}

const SITE_URL = 'https://rete-p.vercel.app'
const canonical = (route) => (route === '/' ? SITE_URL + '/' : SITE_URL + route)

const distDir = fileURLToPath(new URL('../dist', import.meta.url))
const EMPTY_ROOT = /<div id="root">\s*<\/div>/

function assertRendered(route, html) {
  if (!html.includes('data-prerender-ready')) {
    throw new Error(`[prerender] ${route}: missing [data-prerender-ready] marker`)
  }
  if (EMPTY_ROOT.test(html)) {
    throw new Error(`[prerender] ${route}: #root is still empty`)
  }
}

let server
let browser
try {
  server = await preview({ preview: { port: 0 }, logLevel: 'warn' })
  const base = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '')
  if (!base) throw new Error('[prerender] could not resolve preview server URL')

  browser = await chromium.launch()

  // Fetch every route first, then write — so writing dist/index.html can't change
  // what the SPA fallback serves for a route fetched later.
  const rendered = {}
  for (const route of Object.keys(ROUTES)) {
    const page = await browser.newPage()
    await page.addInitScript(() => {
      try {
        localStorage.clear()
      } catch {
        /* ignore */
      }
    })
    await page.goto(base + route, { waitUntil: 'load' })
    await page.waitForSelector('[data-prerender-ready]', { timeout: 15000 })
    // Wait for react-helmet-async to write this route's canonical <link>.
    await page.waitForFunction(
      (want) => document.querySelector('link[rel="canonical"]')?.getAttribute('href') === want,
      canonical(route),
      { timeout: 15000 },
    )
    const html = await page.content()
    assertRendered(route, html)
    rendered[route] = html
    await page.close()
    console.log(`[prerender] rendered ${route}`)
  }

  for (const [route, file] of Object.entries(ROUTES)) {
    const out = `${distDir}/${file}`
    await writeFile(out, rendered[route], 'utf8')
    assertRendered(route, await readFile(out, 'utf8'))
    console.log(`[prerender] wrote dist/${file}`)
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
} finally {
  await browser?.close()
  await server?.httpServer?.close()
}

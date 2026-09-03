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
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { preview } from 'vite'
import { chromium } from 'playwright'

if (process.env.PRERENDER === 'false') {
  console.log('[prerender] skipped (PRERENDER=false)')
  process.exit(0)
}

// A CI/Vercel build has the `playwright` package but may lack the browser binary
// and/or its system libraries. Try with OS deps first (works as root on Vercel),
// then without. No-op once everything is present. Skip locally with
// PRERENDER_SKIP_INSTALL=1.
if (process.env.PRERENDER_SKIP_INSTALL !== '1') {
  const cmds = [
    'npx --yes playwright install --with-deps chromium',
    'npx --yes playwright install chromium',
  ]
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: 'inherit' })
      break
    } catch {
      console.warn(`[prerender] "${cmd}" failed`)
    }
  }
}

// Keep in sync with PUBLIC_ROUTES in src/constants/site.ts.
// Maps route -> output file relative to dist/. Sub-routes use <route>/index.html
// so Vercel serves them at the clean path with no cleanUrls redirect needed;
// when prerender is skipped the files are simply absent and the SPA rewrite runs.
const ROUTES = {
  '/': 'index.html',
  '/support': 'support/index.html',
  '/privacy': 'privacy/index.html',
  '/about': 'about/index.html',
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

// Launching headless Chromium / binding the preview server can fail in a build
// sandbox (missing system libs, no browser binary). That is an environment
// limitation, not a code regression, so degrade to the plain SPA build (exit 0)
// — helmet still injects per-route <head> client-side and the static index.html
// JSON-LD, robots.txt, sitemap.xml, headers all still ship.
let server
let browser
try {
  browser = await chromium.launch()
  server = await preview({ preview: { port: 0 }, logLevel: 'warn' })
} catch (err) {
  console.warn(
    '[prerender] cannot prerender in this environment (browser/preview launch failed) — shipping plain SPA build.',
  )
  console.warn('[prerender]', err instanceof Error ? err.message : String(err))
  await browser?.close().catch(() => {})
  process.exit(0)
}

// From here on, a failure means a genuinely broken page — fail the build (exit 1).
try {
  const base = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '')
  if (!base) throw new Error('[prerender] could not resolve preview server URL')

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
    await mkdir(dirname(out), { recursive: true })
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

/**
 * Build-time prerender for public routes.
 *
 * After `vite build`, this renders each public page component to an HTML string
 * with react-dom/server (via Vite's SSR module loader — no browser) and injects
 * the markup + react-helmet-async <head> tags into the built dist/index.html
 * template, writing one file per route so crawlers get real content (body +
 * JSON-LD) instead of an empty `<div id="root">`.
 *
 * Disable with `PRERENDER=false` — `dist/` then stays a plain SPA build and the
 * vercel.json rewrite serves index.html for everything.
 */
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

if (process.env.PRERENDER === 'false') {
  console.log('[prerender] skipped (PRERENDER=false)')
  process.exit(0)
}

// Keep in sync with PUBLIC_ROUTES in src/constants/site.ts. Route -> output file
// under dist/. Sub-routes use <route>/index.html so Vercel serves them at the
// clean path; when prerender is skipped the files are absent and the SPA rewrite
// runs instead.
const ROUTES = {
  '/': 'index.html',
  '/support': 'support/index.html',
  '/privacy': 'privacy/index.html',
  '/about': 'about/index.html',
}

const distDir = fileURLToPath(new URL('../dist', import.meta.url))
const EMPTY_ROOT = '<div id="root"></div>'

function assertRendered(route, html) {
  if (!html.includes('data-prerender-ready')) {
    throw new Error(`[prerender] ${route}: missing [data-prerender-ready] marker`)
  }
  if (html.includes(EMPTY_ROOT)) {
    throw new Error(`[prerender] ${route}: #root is still empty`)
  }
}

const rawTemplate = await readFile(`${distDir}/index.html`, 'utf8')
if (!rawTemplate.includes(EMPTY_ROOT)) {
  throw new Error('[prerender] dist/index.html has no empty <div id="root"> to fill')
}
// Drop the static fallback <title> so the route's helmet <title> is the only one.
const template = rawTemplate.replace(/\s*<title>[^<]*<\/title>/, '')

function injectHead(tpl, head) {
  if (tpl.includes('<!--app-head-->')) return tpl.replace('<!--app-head-->', head)
  return tpl.replace('</head>', `${head}</head>`)
}

const vite = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'warn',
})

try {
  const { render } = await vite.ssrLoadModule('/src/prerender-entry.tsx')

  for (const [route, file] of Object.entries(ROUTES)) {
    const { html, head } = render(route)
    const page = injectHead(template, head).replace(
      EMPTY_ROOT,
      `<div id="root">${html}</div>`,
    )
    assertRendered(route, page)

    const out = `${distDir}/${file}`
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, page, 'utf8')
    assertRendered(route, await readFile(out, 'utf8'))
    console.log(`[prerender] wrote dist/${file}`)
  }
} catch (err) {
  console.error('[prerender]', err instanceof Error ? err.stack || err.message : err)
  process.exitCode = 1
} finally {
  await vite.close()
}

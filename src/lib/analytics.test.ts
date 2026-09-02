import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * analytics.ts reads import.meta.env at call time and keeps a module-level
 * "initialised" flag, so each test re-imports a fresh copy after stubbing env.
 */
async function freshModule() {
  vi.resetModules()
  return import('./analytics')
}

function gtagScripts() {
  return [...document.querySelectorAll('script')].filter((s) =>
    s.src.includes('googletagmanager.com/gtag/js'),
  )
}

describe('sanitizePath', () => {
  it('strips the query string, including auth tickets', async () => {
    const { sanitizePath } = await freshModule()
    expect(sanitizePath('/home?day=2026-09-02&__clerk_ticket=abc')).toBe('/home')
  })

  it('keeps the root path as "/"', async () => {
    const { sanitizePath } = await freshModule()
    expect(sanitizePath('/')).toBe('/')
  })

  it('returns "/" for an empty string', async () => {
    const { sanitizePath } = await freshModule()
    expect(sanitizePath('')).toBe('/')
  })
})

describe('initGA / trackPageView / trackEvent — no Measurement ID', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '')
    document.head.innerHTML = ''
  })
  afterEach(() => vi.unstubAllEnvs())

  it('initGA injects no gtag script', async () => {
    const { initGA } = await freshModule()
    initGA()
    expect(gtagScripts()).toHaveLength(0)
  })

  it('trackPageView and trackEvent do not throw', async () => {
    const { trackPageView, trackEvent } = await freshModule()
    expect(() => trackPageView('/history')).not.toThrow()
    expect(() => trackEvent('add_meal', { meal: 'lunch' })).not.toThrow()
  })
})

describe('initGA / trackPageView — with Measurement ID', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
    document.head.innerHTML = ''
    delete (window as { dataLayer?: unknown }).dataLayer
    delete (window as { gtag?: unknown }).gtag
  })
  afterEach(() => vi.unstubAllEnvs())

  it('injects exactly one async gtag script, even when called twice', async () => {
    const { initGA } = await freshModule()
    initGA()
    initGA()
    const scripts = gtagScripts()
    expect(scripts).toHaveLength(1)
    expect(scripts[0].src).toContain('id=G-TEST123')
    expect(scripts[0].async).toBe(true)
  })

  it('configures gtag with send_page_view disabled', async () => {
    const { initGA } = await freshModule()
    initGA()
    const calls = (window.dataLayer as unknown[][]) ?? []
    const configCall = calls.find((c) => c[0] === 'config')
    expect(configCall).toBeDefined()
    expect(configCall?.[1]).toBe('G-TEST123')
    expect(configCall?.[2]).toMatchObject({ send_page_view: false })
  })

  it('trackPageView sends a page_view event with the sanitized path', async () => {
    const { initGA, trackPageView } = await freshModule()
    initGA()
    ;(window.dataLayer as unknown[][]).length = 0
    trackPageView('/settings?tab=goals')
    // gtag pushes the raw `arguments` object; normalise to arrays for comparison.
    const calls = (window.dataLayer as ArrayLike<unknown>[]).map((a) => Array.from(a))
    expect(calls).toContainEqual(['event', 'page_view', { page_path: '/settings' }])
  })
})

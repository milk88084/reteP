// @vitest-environment node
// react-helmet-async only populates the SSR context (context.helmet) when there
// is no DOM; under jsdom it takes the client path and the context stays null.
import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { Seo } from './Seo'

function head(node: ReactElement) {
  const ctx: { helmet?: HelmetServerState } = {}
  renderToStaticMarkup(<HelmetProvider context={ctx}>{node}</HelmetProvider>)
  const h = ctx.helmet!
  return {
    title: h.title.toString(),
    meta: h.meta.toString(),
    link: h.link.toString(),
  }
}

describe('Seo', () => {
  it('renders the given title', () => {
    const { title } = head(<Seo title="支援與聯絡｜reteP" description="x" path="/support" />)
    expect(title).toContain('支援與聯絡｜reteP')
  })

  it('canonical for "/" is the origin with a trailing slash', () => {
    const { link } = head(<Seo title="t" description="d" path="/" />)
    expect(link).toContain('rel="canonical"')
    expect(link).toContain('href="https://rete-p.vercel.app/"')
  })

  it('canonical for a sub-route appends the path', () => {
    const { link } = head(<Seo title="t" description="d" path="/privacy" />)
    expect(link).toContain('href="https://rete-p.vercel.app/privacy"')
  })

  it('emits absolute og:url matching the canonical', () => {
    const { meta } = head(<Seo title="t" description="d" path="/support" />)
    expect(meta).toContain('property="og:url"')
    expect(meta).toContain('content="https://rete-p.vercel.app/support"')
  })

  it('og:url for "/" carries the trailing slash', () => {
    const { meta } = head(<Seo title="t" description="d" path="/" />)
    expect(meta).toContain('content="https://rete-p.vercel.app/"')
  })

  it('defaults og:image and twitter:image to the absolute OG cover', () => {
    const { meta } = head(<Seo title="t" description="d" path="/" />)
    expect(meta).toContain('property="og:image"')
    expect(meta).toContain('name="twitter:image"')
    const matches = meta.match(/https:\/\/rete-p\.vercel\.app\/og-cover\.png/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  it('uses the large summary card', () => {
    const { meta } = head(<Seo title="t" description="d" path="/" />)
    expect(meta).toMatch(/name="twitter:card"[^>]*content="summary_large_image"/)
  })

  it('adds a noindex robots meta only when asked', () => {
    const without = head(<Seo title="t" description="d" path="/" />)
    expect(without.meta).not.toContain('name="robots"')

    const withNoindex = head(<Seo title="t" description="d" path="/login" noindex />)
    expect(withNoindex.meta).toMatch(/name="robots"[^>]*content="noindex, nofollow"/)
  })

  it('writes the description into name=description and og:description', () => {
    const { meta } = head(<Seo title="t" description="測試描述" path="/" />)
    expect(meta).toContain('name="description"')
    expect(meta).toContain('property="og:description"')
    expect(meta).toContain('測試描述')
  })
})

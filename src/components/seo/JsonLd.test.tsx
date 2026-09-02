// @vitest-environment node
import { describe, it, expect } from 'vitest'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { JsonLd } from './JsonLd'

function scripts(node: ReactElement) {
  const ctx: { helmet?: HelmetServerState } = {}
  renderToStaticMarkup(<HelmetProvider context={ctx}>{node}</HelmetProvider>)
  return ctx.helmet!.script.toString()
}

describe('JsonLd', () => {
  it('emits an application/ld+json script with the serialized data', () => {
    const out = scripts(<JsonLd data={{ '@type': 'WebPage', name: 'x' }} />)
    expect(out).toContain('type="application/ld+json"')
    expect(out).toContain('"@type":"WebPage"')
    expect(out).toContain('"name":"x"')
  })

  it('escapes "<" so a value can never close the script tag', () => {
    const out = scripts(<JsonLd data={{ note: '</script><script>alert(1)</script>' }} />)
    expect(out).not.toContain('</script><script>')
    expect(out).toContain('\\u003c/script')
  })
})

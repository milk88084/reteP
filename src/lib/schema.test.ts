import { describe, it, expect } from 'vitest'
import { faqPageSchema, webPageSchema } from './schema'

describe('faqPageSchema', () => {
  it('maps each item to a Question with an acceptedAnswer', () => {
    const s = faqPageSchema([
      { q: '要錢嗎？', a: '免費。' },
      { q: '怎麼登入？', a: '用 Google。' },
    ])
    expect(s['@type']).toBe('FAQPage')
    expect(s.mainEntity).toHaveLength(2)
    expect(s.mainEntity[0]).toMatchObject({
      '@type': 'Question',
      name: '要錢嗎？',
      acceptedAnswer: { '@type': 'Answer', text: '免費。' },
    })
  })
})

describe('webPageSchema', () => {
  it('carries dateModified, canonical url, website link and speakable', () => {
    const s = webPageSchema({ path: '/privacy', name: '隱私權政策｜reteP' })
    expect(s).toMatchObject({
      '@type': 'WebPage',
      url: 'https://rete-p.vercel.app/privacy',
      name: '隱私權政策｜reteP',
      inLanguage: 'zh-Hant',
      dateModified: '2026-08-28',
      isPartOf: { '@id': 'https://rete-p.vercel.app/#website' },
    })
    expect(s.speakable).toMatchObject({
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    })
  })
})

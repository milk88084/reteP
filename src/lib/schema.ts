import { SITE_URL, canonicalUrl, LAST_UPDATED, type PublicRoute } from '@/constants/site'

const SPEAKABLE = {
  '@type': 'SpeakableSpecification',
  cssSelector: ['h1', '[data-speakable]'],
} as const

/** FAQPage schema from a list of question/answer pairs. */
export function faqPageSchema(items: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

/** WebPage schema for a public route, with dateModified and speakable. */
export function webPageSchema({ path, name }: { path: PublicRoute; name: string }) {
  return {
    '@type': 'WebPage',
    '@id': `${canonicalUrl(path)}#webpage`,
    url: canonicalUrl(path),
    name,
    inLanguage: 'zh-Hant',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    dateModified: LAST_UPDATED[path],
    speakable: SPEAKABLE,
  }
}

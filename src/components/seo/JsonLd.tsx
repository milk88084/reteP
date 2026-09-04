import { Helmet } from 'react-helmet-async'

/**
 * Renders one JSON-LD <script> into <head> (baked into public routes by the
 * prerender step). `<` is escaped so no string value can close the script tag.
 * Site-wide types (Organization / SoftwareApplication / WebSite) live in
 * index.html — use this only for per-page types (WebPage, FAQPage).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(
    /</g,
    '\\u003c',
  )
  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  )
}

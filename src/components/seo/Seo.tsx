import { Helmet } from 'react-helmet-async'
import { SITE_NAME, OG_IMAGE, canonicalUrl } from '@/constants/site'

interface SeoProps {
  /** Full <title> text. */
  title: string
  /** Meta description (also used for og/twitter description). */
  description: string
  /** Route path, e.g. '/support' — turned into an absolute canonical URL. */
  path: string
  /** Absolute image URL for og/twitter. Defaults to the site OG cover. */
  image?: string
  /** Emit robots="noindex, nofollow". */
  noindex?: boolean
  /** Open Graph type. */
  type?: 'website' | 'article'
}

/**
 * Per-page <head> tags: title, description, canonical, Open Graph, Twitter card.
 * Site-wide JSON-LD (Organization / SoftwareApplication / WebSite) lives only in
 * index.html — this component never emits those.
 */
export function Seo({
  title,
  description,
  path,
  image = OG_IMAGE,
  noindex = false,
  type = 'website',
}: SeoProps) {
  const url = canonicalUrl(path)

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="zh_TW" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}

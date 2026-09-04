import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { HelmetProvider } from 'react-helmet-async'
import { App } from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env.local')
}

const rootEl = document.getElementById('root')!

// Public routes are prerendered at build time (scripts/prerender.mjs) so crawlers
// get real HTML. That snapshot is a browser-serialized DOM, not React SSR output
// (normalized inline styles, merged text nodes), so we do NOT hydrate it — we
// clear it and client-render. Users get a clean render (the landing page's intro
// animation covers it); static pages re-render in a single frame.
rootEl.replaceChildren()

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </HelmetProvider>
  </React.StrictMode>,
)

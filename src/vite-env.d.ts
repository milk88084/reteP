/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '*.svg' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_N8N_WEBHOOK_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

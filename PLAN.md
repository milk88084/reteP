# PLAN — reteP 網頁版 GA / SEO / GEO / AEO 一次到位

**分支**：`feature/marketing-site`（直接續作，最後一起進 `develop → master`）
**部署驗收**：Vercel 對 `feature/marketing-site` 的 Preview URL
**線上正式站**：<https://rete-p.vercel.app>（Production 接 `master`）

---

## 0. 背景與已確認事實

| 項目 | 現況 |
| --- | --- |
| Stack | Vite 5 + React 18 + TS 5 SPA，`react-router-dom` 6（`createBrowserRouter` 陣列式、element-based），`vite-plugin-pwa`，`lang=zh-TW`，部署 Vercel |
| `vercel.json` | 僅一條 rewrite：`/(.*) → /index.html` |
| 公開路由 | `/`（`RootRoute` 分流：訪客→`LandingPage`、已登入→`AppShell`）、`/login`、`/support`、`/privacy`、`/sso-callback` |
| 登入後路由 | `/*` → `AppShell`（Home / History / Settings，Clerk 守衛） |
| 伺服器 HTML | 空殼 `<div id="root">`，無 SSR / 預渲染，爬蟲只讀得到 `<title>` |
| robots / sitemap / llms | 皆不存在；路徑被 rewrite 成回傳首頁 HTML（`200 text/html`，錯誤 content-type） |
| JSON-LD | 完全沒有 |
| og:image / twitter:image | 相對路徑 `/icons/icon-512.png`（512×512 方形 App icon）；`twitter:card` 為 `summary` |
| canonical | 沒有 |
| manifest（`vite.config.ts` PWA 區塊） | 未設 `lang`（外掛預設 `en`）、`name` 為「每日飲食記錄」、`theme_color` `#BDF2DE` ≠ `index.html` 的 `#0D0B09` |
| 安全標頭 | 僅 HSTS；缺 `X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`、CSP |
| 既有測試 | `src/router/resolveRootRoute.test.ts`、`src/services/transform.test.ts`（Vitest，`tsc` strict） |
| **部署落後** | Production `master` 的 `index.html` 是舊定位（「拍一張，記下來 / AI 辨識」）。`feature/marketing-site` 已重寫 `index.html`、`LandingPage.tsx`（+444 行）、README，**尚未合併**。本計畫全部疊在此分支。 |
| 有利條件 | `playwright` 已是 devDependency；Vercel `rewrites` 在檔案系統比對**之後**才套用 → 實體 `public/robots.txt`、`dist/support.html` 會優先命中，不被 rewrite 吃掉 |

### 已拍板決策

1. **預渲染方案 = A**：build 後自製 Playwright 腳本，逐一訪問公開路由、擷取 `outerHTML` 覆寫 `dist/*.html`。零新框架。
2. **CSP = 先 Report-Only 再轉正**：本次上 `Content-Security-Policy-Report-Only`，觀察後另一次 commit 改強制。
3. **`/about` = 獨立路由**（`/about`），進 router / sitemap / 預渲染。
4. **分支 = 直接在 `feature/marketing-site` 續作**。

### 待你提供的素材（P3 前給即可，不阻擋 P1）

- `public/og-cover.png` 1200×630 品牌 OG 圖。**預設**：由本計畫先產一版品牌色 + wordmark 占位圖，你之後替換。
- App Store 評分數據（`aggregateRating` 用）。**預設**：無數據則整個 `aggregateRating` 欄位省略。
- Google Search Console 網域驗證由你本人操作，本計畫只寫步驟。

### 全域常數

新增 `src/constants/site.ts`：

```ts
export const SITE_URL = 'https://rete-p.vercel.app'        // 無尾斜線
export const SITE_NAME = 'reteP'
export const APP_STORE_URL = 'https://apps.apple.com/tw/app/id6798490139'
export const CONTACT_EMAIL = 'milk88084@gmail.com'
export const OG_IMAGE = `${SITE_URL}/og-cover.png`         // 1200x630 絕對網址
export const PUBLIC_ROUTES = ['/', '/support', '/privacy', '/about'] as const
export const NOINDEX_ROUTES = ['/login', '/sso-callback'] as const

// 單一事實來源：各頁「最後更新日期」，同時供頁面顯示、WebPage schema 的 dateModified、
// 與 sitemap.xml 的 <lastmod>。格式 YYYY-MM-DD。
export const LAST_UPDATED: Record<'/' | '/support' | '/privacy' | '/about', string> = {
  '/': '2026-09-02',
  '/support': '2026-09-02',
  '/privacy': '2026-08-28',
  '/about': '2026-09-02',
}
```

`LandingPage.tsx` 內現有的 `APP_STORE_URL` / `SUPPORT_HREF` 等改為 import 此檔（`SupportPage`/`PrivacyPage` 的 `CONTACT_EMAIL`、`PrivacyPage` 的 `LAST_UPDATED` 常數同步改讀此 map；`sitemap.xml` 產出時亦讀此 map，人工維護時三處一起改）。

---

## P0 — 前置（無程式碼變更）

- [ ] 確認 Vercel Production 分支 = `master`、Build Command = `tsc && vite build`（既有 `npm run build`）。
- [ ] 確認 `feature/marketing-site` 已在 Vercel 產生 Preview 部署；取得 Preview URL 作為後續所有驗收目標。
- [ ] 在 `package.json` 確認 Node 版本無特殊限制（Playwright 預渲染腳本需 Node ≥ 18；Vercel 預設符合）。

**驗收**：能對一個 `https://feature-marketing-site-*.vercel.app` 形式的 URL 發 curl。

---

## P1 — GA4（低風險，先落地，不依賴任何決策）　✅ 完成 2026-09-02

> 實作結果：`src/lib/analytics.ts`（+ 8 測試）、`src/hooks/usePageViews.ts`（`trackRouterPageViews` 純函式 + 4 測試）、`src/types/gtag.d.ts`、`App.tsx` 掛 `usePageViews()`、`.env.example` / README 更新、`vite.config.ts` 加 `test`（jsdom）區塊、devDep `jsdom`。
> 驗證：26 測試全綠、`tsc --noEmit` 乾淨、`npm run build` 成功。未設 `VITE_GA_MEASUREMENT_ID` → GA 程式碼被 tree-shake 完全移除（bundle 0 byte、不可能發請求）；設了 `G-XXXX` → gtag loader + `send_page_view:false` 進 bundle。

### 檔案

**新增 `src/lib/analytics.ts`**

```ts
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let initialised = false

/** 剝除 query string 與已知敏感參數，只留 pathname。 */
export function sanitizePath(pathAndQuery: string): string {
  const [path] = pathAndQuery.split('?')
  return path || '/'
}

/** async 動態注入 gtag。未設 VITE_GA_MEASUREMENT_ID 時為 no-op，不報錯。 */
export function initGA(): void {
  if (initialised || !GA_ID || typeof window === 'undefined') return
  initialised = true

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // SPA：關閉自動 page_view，改由 router 監聽手動送
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageView(pathAndQuery: string): void {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'page_view', { page_path: sanitizePath(pathAndQuery) })
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!GA_ID || typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', name, params)
}
```

- `window.dataLayer` / `window.gtag` 型別：新增 `src/types/gtag.d.ts`（`declare global`）。
- **隱私**：`trackPageView` 一律 `sanitizePath` → 送出的 `page_path` 永遠不含 query string，因此 `/home?...`、`/sso-callback?__clerk_ticket=...` 等登入後 / 回跳網址不會外洩參數。
- **Consent TODO**：`initGA` 開頭加註解

  ```ts
  // TODO(consent): 專案目前無 cookie / consent 機制。導入後在此檢查同意狀態，
  // 未同意則 return，或改用 gtag('consent', 'default', { analytics_storage: 'denied' })。
  ```

**新增 `src/hooks/usePageViews.ts`**

```ts
import { useEffect } from 'react'
import { router } from '@/router'
import { initGA, trackPageView } from '@/lib/analytics'

/** 掛一次；初始化 GA 並在每次 router 導航後送 page_view。 */
export function usePageViews(): void {
  useEffect(() => {
    initGA()
    trackPageView(router.state.location.pathname + router.state.location.search)
    const unsub = router.subscribe((state) => {
      if (state.navigation.state === 'idle') {
        trackPageView(state.location.pathname + state.location.search)
      }
    })
    return unsub
  }, [])
}
```

> 用 `router.subscribe()` 而非新增 layout route → 不動 route 樹、不影響既有 `createBrowserRouter` 結構與 `RootRoute` 分流。

**模組載入順序（避免循環）**：`usePageViews.ts` 使用**靜態** `import { router } from '@/router'`。安全性依據：`src/App.tsx` 現已靜態 `import { router }`，`src/router/index.tsx` 不 import `App` / `analytics` / `usePageViews`，因此載入圖為 `main → App → { router, usePageViews }`，`usePageViews` 執行 `useEffect` 時 `router` 早已初始化。實作時在 `usePageViews.ts` 頂部加一行註解記錄此依據；若日後 `router/index.tsx` 反向 import 任何 page 以外的模組，改為 `useEffect` 內動態 `import('@/router')`。

**改 `src/App.tsx`**：呼叫 `usePageViews()`。

```tsx
export const App = () => {
  usePageViews()
  return (<><ApiAuthSync /><RouterProvider router={router} /></>)
}
```

**改 `.env.example`**：新增

```
# ── Google Analytics 4 (optional) ─────────────────────────────────
# GA4 Admin → Data streams → Measurement ID（G-XXXXXXXXXX）。未設則不載入 GA。
VITE_GA_MEASUREMENT_ID=
```

**改 `README.md`**：`Quick Start` 變數表加一列 `VITE_GA_MEASUREMENT_ID`（選填，未設不載入 GA），並在文末新增「## Analytics」小節說明 `src/lib/analytics.ts` 三個 API 與 SPA page_view 機制。

### 測試

**新增 `src/lib/analytics.test.ts`**（Vitest，jsdom）

- `VITE_GA_MEASUREMENT_ID` 未設時：`initGA()` 不注入 `<script>`、`trackPageView` / `trackEvent` 不 throw。
- `sanitizePath('/home?a=1&__clerk_ticket=x')` === `'/home'`。
- `sanitizePath('/')` === `'/'`。
- （設 ID 的情境用 `vi.stubEnv`）`initGA()` 注入一個 `src` 含 `googletagmanager.com/gtag/js?id=` 的 script；重複呼叫只注入一次。

### P1 驗收

- [ ] `npm run test` 全綠（含新測試）。
- [ ] `tsc` strict 無錯。
- [ ] 本地 `npm run dev` 設 `VITE_GA_MEASUREMENT_ID=G-XXXX` → Network 面板路由切換時可見 `collect?...&en=page_view`，且 `dp` / `page_path` 不含 query。
- [ ] 不設變數 → 無任何 `googletagmanager` 請求、console 無錯。

---

## P2 — 公開路由 build-time 預渲染（方案 A：Playwright）　✅ 完成 2026-09-02

> **實作結果**
> - `scripts/prerender.mjs`：`vite preview` 起 `dist/` → headless Chromium 逐一訪 `/`、`/support`、`/privacy` → 等 `[data-prerender-ready]` → 先全部抓進記憶體再一次寫檔（避免寫 `index.html` 影響後續 fallback）→ 寫檔前後各斷言「有 marker 且 `#root` 非空」。`PRERENDER=false` 直接 `exit 0` 跳過。
> - `package.json`：`build` = `build:spa`（`tsc && vite build`）+ `node scripts/prerender.mjs`；新增 `build:spa`、`prerender`。
> - `src/constants/site.ts`（新）：`SITE_URL`/`OG_IMAGE`/`PUBLIC_ROUTES`/`NOINDEX_ROUTES`/`LAST_UPDATED`/`canonicalUrl()`/`formatUpdated()`。`PUBLIC_ROUTES` 目前 3 條，`/about` P4 補。
> - `src/router/resolveRootRoute.ts`：新增第 3 參數 `hasSession`；`!isLoaded && !hasSession → 'landing'`（訪客與爬蟲首屏直接給內容，不轉圈）。測試改為 4 case。
> - `src/router/RootRoute.tsx`：`hasClerkSession()` 讀 `__client_uat`/`__session` cookie 傳入。
> - 三個公開頁根元素加 `data-prerender-ready`；`LandingPage` footer 年份改模組頂層 `const YEAR`。
> - `vercel.json`：加 `"cleanUrls": true`，保留 SPA rewrite（headers P3 補）。
> - `vite.config.ts`：加 `test`（jsdom）區塊。devDep：`jsdom`、Playwright chromium binary（`npx playwright install chromium`）。
>
> **偏離原計畫（重要）**：原訂 `hydrateRoot`（`#root` 有內容就 hydrate）。實測 `page.content()` 產出的是**瀏覽器序列化後的 DOM**（inline `style` 被正規化成雙引號/加分號、相鄰 text node 被合併、`{' '}` 消失），與 React 的 SSR 序列化不一致 → 每頁數十個 hydration mismatch（#418/#423/#425）。改為 **`main.tsx` 一律 `rootEl.replaceChildren()` + `createRoot().render()`**：預渲染 HTML 只給爬蟲（爬蟲不跑 JS），真人載入時清掉重繪（landing 有入場動畫遮蓋、靜態頁單幀重繪無感）。結果：三頁 console 只剩 Clerk「development keys」既有警告，**0 hydration / 0 React error**。
>
> **驗證**：`npm run build` 產出含正文的 `dist/{index,support,privacy}.html`；`PRERENDER=false npm run build` → 純 SPA（`<div id="root"></div>`）；刻意改壞一頁 marker → prerender `exit 1`；27 測試全綠；`tsc --noEmit` 乾淨；Playwright 掃三頁 0 hydration error。

### （以下為原始計畫，保留供對照）

### 目標

`curl -s <preview>/`、`/support`、`/privacy`、`/about` 回傳含正文與 JSON-LD 的完整 HTML。

### 實作

**`main.tsx` hydration 調整**

- 目前 `createRoot(...).render(...)`。預渲染後 `#root` 會有內容 → 改為：

  ```tsx
  const rootEl = document.getElementById('root')!
  if (rootEl.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootEl, <AppTree />)
  } else {
    ReactDOM.createRoot(rootEl).render(<AppTree />)
  }
  ```

- `<AppTree />` = 現有的 `<React.StrictMode><ClerkProvider><HelmetProvider><App/></HelmetProvider></ClerkProvider></React.StrictMode>`（`HelmetProvider` 於 P3 加入）。

**`ClerkProvider` 在預渲染環境的防護**

- 預渲染跑的是 production build 的實際 JS，會執行 `main.tsx` 的 `if (!PUBLISHABLE_KEY) throw`。
- 預渲染腳本會以 `VITE_CLERK_PUBLISHABLE_KEY` 存在的環境變數 build（Vercel Preview 已有此變數）；Clerk 在 headless Chromium 內初始化為「未登入」狀態即可，`RootRoute` 會渲染 `LandingPage`。
- 額外保險：預渲染腳本注入 `localStorage` / cookie 皆空，確保走訪客分支。
- 若 Clerk 初始化在 headless 下有網路等待 → 腳本以「等待特定 DOM 標記出現」為準（見下）。

**新增 `scripts/prerender.mjs`**

0. **停用開關**：腳本第一行檢查 `if (process.env.PRERENDER === 'false') { console.log('prerender skipped'); process.exit(0) }`。
1. `import { preview } from 'vite'` 起本地靜態伺服器指向 `dist/`（`preview({ preview: { port: 0 } })`，讀回實際 port）。
2. `chromium.launch()`（Playwright）。
3. 對 `PUBLIC_ROUTES` 每條路徑：
   - `page.addInitScript(() => { try { localStorage.clear() } catch {} })`（確保走訪客分支）
   - `page.goto(url, { waitUntil: 'networkidle' })`
   - `await page.waitForSelector('[data-prerender-ready]', { timeout: 15000 })`
     （每個公開頁的根容器加 `data-prerender-ready` 屬性；landing / support / privacy / about 皆純靜態內容，mount 後立即出現）
   - `const html = await page.content()`
   - **寫檔前自我斷言**：`assert(html.includes('data-prerender-ready'))` 且 `assert(!/<div id="root">\s*<\/div>/.test(html))`，任一失敗 → `console.error(path)` + `process.exit(1)`。
   - 寫檔：`/` → `dist/index.html`；`/support` → `dist/support.html`；`/privacy` → `dist/privacy.html`；`/about` → `dist/about.html`
   - **寫檔後回讀再斷言**同兩條，確認落盤正確。
4. 關閉 browser 與 server；任一路徑失敗 → `process.exit(1)`（讓 CI / Vercel build 紅）。全 all-or-nothing，不做部分成功。

**`package.json` scripts**

```jsonc
"build": "npm run build:spa && node scripts/prerender.mjs",
"build:spa": "tsc && vite build",
"prerender": "node scripts/prerender.mjs"   // 供本地 dist 重跑
```

- **回滾策略**：Vercel 環境變數設 `PRERENDER=false` → 預渲染整段跳過，`dist/` 即純 SPA 產物，行為完全等同現況（`vercel.json` 的 SPA rewrite 接手所有路徑）。無需改 code、redeploy 即生效。本機亦可 `PRERENDER=false npm run build` 或直接 `npm run build:spa` 驗證純 SPA build 未壞。
- `build:ios`（遺留 Capacitor）不動。

**`vercel.json`**

```jsonc
{
  "cleanUrls": true,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [ /* P3 填入 */ ]
}
```

- `cleanUrls: true` → `/support` 服務 `dist/support.html`（無尾斜線）。
- rewrite 保留為 SPA fallback：`/home`、`/history` 等未預渲染路徑仍回 `index.html`（含預渲染後的 landing 內容，但 JS 一 hydrate 就依 Clerk 狀態切換，訪客看到 landing、已登入被導向 app — 行為與現況一致）。
- 實體檔（`support.html`、`robots.txt`…）因 Vercel 先比對檔案系統，不會落入 rewrite。

### 風險與緩解

| 風險 | 緩解 |
| --- | --- |
| React 18 hydration mismatch | (1) **年份**：`LandingPage.tsx` / `Footer` 的 `© {new Date().getFullYear()}` 改為模組頂層 `const YEAR = new Date().getFullYear()`（build 當下求值一次、寫進靜態 HTML，hydrate 時同值）。(2) **framer-motion**：landing 各區塊已 `initial="hidden"`，SSR 與 hydrate 首幀同為 hidden 樣式，一致；`GalleryShot` 的 `animate={{ y: [...] }}` 為 mount 後啟動，不影響首幀。(3) 驗收改為明確門檻：`NODE_ENV=production` build 後於瀏覽器開 `/` 與 `/about`，console **0** 個 `Warning: Prop` 與 **0** 個 `hydration` error（非「大致沒問題」）。 |
| Playwright 在 Vercel build 環境缺瀏覽器 binary | build script 前置 `npx playwright install chromium`（不加 `--with-deps`，Vercel build image 已含所需系統庫）。**build 時間上限**：預渲染 + install 使 Vercel build 增加 ≤ 90s；若超過，改為在 Vercel 專案設定 `installCommand` 快取 `~/.cache/ms-playwright`，或移除預渲染改回 `PRERENDER=false` 並改用其他 SSG 方案（另立計畫）。 |
| Clerk headless 初始化失敗導致頁面空白 | 腳本 `waitForSelector('[data-prerender-ready]')` 逾時即 fail build（不產出壞頁）。前置修正：`LandingPage`、`AboutPage`、`SupportPage`、`PrivacyPage` 的靜態內容**不依賴 Clerk**——`RootRoute` 於 `isLoaded=false` 時目前顯示 Spinner，故預渲染 `/` 前需確保 Clerk 在 headless 能在 15s 內 `isLoaded=true` 進訪客分支；若實測不穩，改 `RootRoute`：`isLoaded=false` 且無既有 session cookie 時直接渲染 `LandingPage`（不影響已登入者，因彼時 cookie 存在）。此 `RootRoute` 調整列為 P2 必做項，非選配。 |
| `vite preview` port 衝突 | 腳本用 `port: 0` 取實際 port（見上）。 |
| Clerk `pk_test_` 出現在 `dist` bundle | **非本計畫新增**：publishable key 設計上即為公開值，現況 SPA build 已內嵌。計畫此處僅記錄，不需處理。 |

### P2 驗收

- [ ] `npm run build` 本地成功產出 `dist/index.html`、`dist/support.html`、`dist/privacy.html`、`dist/about.html`，每個 `<div id="root">` 內含實際正文（非空殼）。
- [ ] `npx serve dist` + `curl -s localhost:3000/support` 看得到 support 正文。
- [ ] Preview 部署後 `curl -s <preview>/` 有 landing 正文；`curl -s <preview>/home` 回 fallback（index.html）。
- [ ] 瀏覽器開 `/`、`/support`、`/privacy`、`/about`：console **0** 個 `Warning: Prop` 與 **0** 個 hydration error。
- [ ] `PRERENDER=false npm run build` 仍成功產出純 SPA `dist/`（回滾路徑驗證）。
- [ ] `prerender.mjs` 對缺 `data-prerender-ready` 或空 `#root` 的頁面會 `exit 1`（以刻意破壞一頁的方式驗一次）。
- [ ] `npm run test` 仍全綠。

---

## P3 — SEO　✅ 完成 2026-09-02

> **實作結果**
> - `react-helmet-async` 依賴；`main.tsx` 加 `<HelmetProvider>`。
> - `src/components/seo/Seo.tsx`（+ `Seo.test.tsx`，10 測試，`// @vitest-environment node` 因 helmet SSR context 在 jsdom 下不填充）：title / description / canonical（絕對，`canonicalUrl()`，`/` 保留尾斜線）/ og / twitter（`summary_large_image`）/ 選配 `noindex`。**不輸出** Organization/SoftwareApplication/WebSite。
> - `<Seo>` 掛進 `LandingPage`(/)、`SupportPage`、`PrivacyPage`、`LoginPage`(noindex)、`AuthCallbackPage`(noindex)。
> - `index.html`：**移除**所有 route 相關 meta（title 留作 pre-JS fallback、helmet 就地換），只保留 charset/theme-color(`#BDF2DE`)/PWA/字型/icon。避免與 helmet 產生重複 meta。
> - `public/robots.txt`（allow all + Sitemap）、`public/sitemap.xml`（3 URL + lastmod 對齊 `LAST_UPDATED`）。
> - `vite.config.ts` manifest：`lang:"zh-Hant"`、`name/short_name:"reteP"`、`description` 對齊、`theme_color:"#BDF2DE"`。
> - `vercel.json`：`headers` — `X-Content-Type-Options`/`Referrer-Policy`/`X-Frame-Options` + `Content-Security-Policy-Report-Only`（allowlist 含 Clerk/GA/Fonts/後端/n8n）；`/(login|sso-callback)/?` 加 `X-Robots-Tag: noindex`。
> - `public/og-cover.png` 1200×630 占位圖（品牌色 + wordmark，Playwright 產；**待你替換**）。
> - `prerender.mjs`：擷取前多等一步 `waitForFunction` 確認 helmet 已寫入該頁 canonical。
> - README：新增「SEO / Search Console」節（含 DNS/HTML 驗證與提交 sitemap 步驟）+「已知的坑」補預渲染/helmet/index.html 說明。
>
> **驗證**：36 測試全綠、`tsc` 乾淨；`dist/{index,support,privacy}.html` 各有唯一正確 `<title>`、**恰好 1 個** canonical、per-route description/og:title/og:url，無重複 meta；`vite preview` 下 `/robots.txt` → `200 text/plain`、`/sitemap.xml` → `200 text/xml`（3 URL、格式正確）；`/login` meta `robots=noindex, nofollow`；四頁 0 hydration error；`PRERENDER=false` 回滾仍為純 SPA。
> **未驗證（需 Vercel）**：安全標頭與 `X-Robots-Tag` 只在 Vercel 生效，`vercel.json` 已設好，待 Preview 部署 curl 確認。

### （以下為原始計畫，保留供對照）

### head 管理

**新增依賴**：`react-helmet-async`（runtime dep）。權衡：+1 依賴、~3KB gzip、SSR/預渲染友善、社群標準。替代（自寫 `useEffect` 塞 meta）在預渲染下較難擷取，不採用。
**已知技術債**：`react-helmet-async` 最後發布為 2022 年、維護停滯。退場路徑：改為原生 `document.head` 操作的自寫 hook + 由 `prerender.mjs` 在擷取前 `page.waitForFunction` 確認 head 已更新。此風險記入 README「已知的坑」。

- `main.tsx`：`<HelmetProvider>` 包在 `<App/>` 外（見 P2 `<AppTree/>`）。

**新增 `src/components/seo/Seo.tsx`**（放 `seo/` 子目錄，與既有 `components/layout/`、`components/features/` 分層一致）

Props：`title`、`description`、`path`（用於組 canonical）、`image?`（預設 `OG_IMAGE`）、`noindex?`、`type?`（`website` | `article`）。輸出：

- `<title>` / `<meta name="description">`
- `<link rel="canonical" href={canonicalFor(path)}>`，其中 `canonicalFor('/') === SITE_URL`、`canonicalFor('/support') === SITE_URL + '/support'`（一律絕對、無尾斜線）
- `og:type` / `og:title` / `og:description` / `og:url`（= canonical）/ `og:image`（絕對）/ `og:locale=zh_TW` / `og:site_name`
- `twitter:card=summary_large_image` / `twitter:title` / `twitter:description` / `twitter:image`（絕對）
- `noindex` 時：`<meta name="robots" content="noindex, nofollow">`
- **不輸出** `Organization` / `SoftwareApplication` / `WebSite` JSON-LD（那三型別只存在於 `index.html` 靜態區塊，見 P4）。`Seo` 只負責 per-page `WebPage` / `FAQPage`（P5）。

**新增 `src/components/seo/Seo.test.tsx`**（Vitest；用 `react-dom/server` 的 `renderToStaticMarkup` + `HelmetProvider` 的 `context` 物件取 `helmet.link` / `helmet.meta` 字串，**不新增 testing-library 依賴**）：

- `path="/"` → canonical `href` === `https://rete-p.vercel.app`（無尾斜線）。
- `path="/support"` → canonical `href` === `https://rete-p.vercel.app/support`。
- `noindex` → `document.head` 有 `meta[name="robots"][content="noindex, nofollow"]`。
- 未傳 `image` → `og:image` / `twitter:image` === `OG_IMAGE` 常數且為 `https://` 開頭。
- `twitter:card` === `summary_large_image`。

**各公開頁掛 `<Seo>`**：

| 路由 | title | description（摘要） |
| --- | --- | --- |
| `/` | `reteP｜記錄每天的飲食熱量與營養` | 現 `index.html` 的 description |
| `/support` | `支援與聯絡｜reteP` | 「reteP 使用說明、常見問題與聯絡方式：登入、資料安全、刪除記錄與帳號。」 |
| `/privacy` | `隱私權政策｜reteP` | 「reteP 如何蒐集、使用與保護你的資料，以及你的存取、更正、刪除權利。」 |
| `/about` | `關於 reteP` | 「reteP 是誰做的、如何聯絡、你的飲食資料如何被處理與保護。」 |
| `/login` | `登入｜reteP` | `noindex` |
| `/sso-callback` | `登入中…｜reteP` | `noindex` |

> `RootRoute` 已登入分支渲染 `AppShell` 時**不掛** `<Seo>`（或掛 `noindex`）——避免 app 畫面覆蓋 landing 的 meta。訪客分支（`LandingPage`）掛首頁 `<Seo>`。

**`index.html` 靜態內容**（不靠 JS，作為爬蟲與預渲染前的基準）：

- 保留現有 `<title>` / description / og / twitter，但：
  - `og:image` / `twitter:image` → 改絕對網址 `https://rete-p.vercel.app/og-cover.png`
  - `twitter:card` → `summary_large_image`
  - 新增 `<link rel="canonical" href="https://rete-p.vercel.app/">`
  - 新增 `og:site_name` = `reteP`
- 新增首頁核心 JSON-LD（見 P4）。

### robots / sitemap

**新增 `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://rete-p.vercel.app/sitemap.xml
```

**新增 `public/sitemap.xml`**：列 `/`、`/support`、`/privacy`、`/about`，各 `<lastmod>` 取自 `src/constants/site.ts` 的 `LAST_UPDATED` map（人工維護：改頁面內容時，同步更新該頁在 map 的日期與此檔）。

> 靜態檔即可（4 個 URL、低頻變動）。若日後頁面增多再改為 build 時由 `LAST_UPDATED` + `PUBLIC_ROUTES` 產生。

### manifest 修正（`vite.config.ts` PWA 區塊）

- `lang: 'zh-Hant'`（新增）
- `name: 'reteP'`、`short_name: 'reteP'`
- `description`：與 `index.html` 一致（「記錄每一餐，追蹤熱量與蛋白質、碳水、脂肪…」）
- `theme_color: '#BDF2DE'`（品牌色；同步把 `index.html` 的 `<meta name="theme-color" content="#0D0B09">` 改為 `#BDF2DE`）
- `background_color` 維持 `#FAFAF7`（啟動畫面底色，可保留）

### 安全標頭（`vercel.json` `headers`）

全站（`source: "/(.*)"`）：

```jsonc
{ "key": "X-Content-Type-Options", "value": "nosniff" },
{ "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
{ "key": "X-Frame-Options", "value": "SAMEORIGIN" },
{ "key": "Content-Security-Policy-Report-Only", "value": "<見下>" }
```

`/login`、`/sso-callback` 額外加 `X-Robots-Tag: noindex`。因 `cleanUrls: true` 對 `/login` 與 `/login/` 的比對行為不保證一致，`vercel.json` 的 `headers` `source` 同時列出兩式：`"/login"`、`"/login/"`、`"/sso-callback"`、`"/sso-callback/"`，各帶：

```jsonc
{ "key": "X-Robots-Tag", "value": "noindex" }
```

且 `LoginPage` / `AuthCallbackPage` 內以 `<Seo noindex>` 輸出 `<meta name="robots" content="noindex, nofollow">` 作為主要保險（header 為輔）。

**CSP（Report-Only，本次不強制）**草案：

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.clerk.accounts.dev https://challenges.cloudflare.com;
connect-src 'self' https://*.clerk.accounts.dev https://clerk-telemetry.com https://www.google-analytics.com https://*.analytics.google.com https://region1.google-analytics.com https://n8n.iii-ei-stack.com https://retep-backend.zeabur.app;
img-src 'self' data: https:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com;
worker-src 'self' blob:;
base-uri 'self';
form-action 'self';
```

> - 涵蓋 Clerk（`*.clerk.accounts.dev`、Cloudflare Turnstile challenge）、GA/GTM、Google Fonts、後端 API、n8n webhook。
> - `Report-Only` → 只回報不阻擋。轉正式在**後續獨立 commit**，並於 README 記錄如何看 violation report。
> - `'unsafe-inline'` script 暫留（vite-plugin-pwa 的 `registerSW`、可能的 inline JSON-LD）。轉正前評估改 nonce/hash。

### README

新增「## SEO / Search Console」小節：

1. **驗證網域**：Search Console → 新增資源 → 選「網域」→ 加 DNS TXT 記錄（Vercel DNS 或網域商後台）；或選「網址前置字元」→ 用 HTML 標記，把 `<meta name="google-site-verification" content="...">` 加進 `index.html` `<head>`。
2. **提交 sitemap**：Search Console → Sitemap → 輸入 `sitemap.xml` → 提交。
3. **請求索引**：URL 檢查工具貼上 `https://rete-p.vercel.app/` → 要求建立索引。
4. 註明：索引需數天至數週，`site:rete-p.vercel.app` 可查目前收錄狀態。

### P3 驗收

- [ ] `curl -s <preview>/robots.txt` → `200`、`content-type: text/plain`、純文字內容。
- [ ] `curl -s <preview>/sitemap.xml` → `200`、合法 XML（`xmllint --noout` 通過）。
- [ ] `curl -sI <preview>/login` **和** `curl -sI <preview>/login/` 皆含 `x-robots-tag: noindex`；`/sso-callback` 同。若其一漏掉 → 以頁面內 `<Seo noindex>` 為準並於 README 記錄 header 限制。
- [ ] `curl -s <preview>/support | grep canonical` → 絕對網址 `https://rete-p.vercel.app/support`。
- [ ] `curl -sI <preview>/` → 含 `x-content-type-options`、`referrer-policy`、`x-frame-options`、`content-security-policy-report-only`。
- [ ] 建置後 `dist/manifest.webmanifest` → `lang: "zh-Hant"`、`name: "reteP"`、`theme_color: "#0D0B09"`。
- [ ] 各公開頁原始碼（curl）`<title>` 各不相同且正確。

---

## P4 — GEO　✅ 完成 2026-09-02

> **實作結果**
> - `index.html` `<head>` 靜態內嵌一個 `<script type="application/ld+json">` `@graph`：Organization（`founder: KO CHUAN LI`、`sameAs` App Store、logo 絕對）、WebSite（`inLanguage: zh-Hant`、`publisher` 指 Organization）、SoftwareApplication（`HealthApplication`/iOS/`offers` 0 TWD/`creator: KO CHUAN LI`）。HTML 註解標了 `TODO(rating)`；`aggregateRating` 待你給 App Store `ratingValue` + `ratingCount` 再補。
> - `public/llms.txt`：定位、公開頁清單、事實摘要（登入/儲存/刪除/價格/開發者）、聯絡。
> - `LandingPage`：新增 `<Faq>` section（`Highlights` 與 `CtaBand` 之間），`export const FAQ_ITEMS` 5 組「問題 + 130–170 字自足回答」（實測 168/147/166/155/142），答案段落帶 `data-speakable`。
> - `src/pages/AboutPage.tsx`（新）+ router `/about`：`<h1>關於 reteP</h1>`、開發者（KO CHUAN LI 全文）、聯絡 email、資料處理摘要 → 連 `/privacy`、App Store 連結、可見「最後更新日期」、`<Seo>`、`data-prerender-ready`。
> - `PUBLIC_ROUTES` / `LAST_UPDATED` 加 `/about`；`sitemap.xml` 4 URL；`prerender.mjs` ROUTES 加 `/about`；`LandingPage` footer 加「關於」連結。
>
> **驗證**：`dist/index.html` 內 Organization/SoftwareApplication/WebSite 各恰 1 份、JSON 合法、`@graph` 長度 3；`dist/about.html` 有完整正文；`dist/index.html` 含 FAQ section 與 `data-speakable`；`dist/llms.txt`、`dist/sitemap.xml`（4 loc）就位；四頁（含 /about）title/canonical 正確、0 hydration error；36 測試全綠、`tsc` 乾淨。

### （以下為原始計畫，保留供對照）

### 首頁靜態 JSON-LD（寫進 `index.html` `<head>`，不靠 JS）

一個 `<script type="application/ld+json">`，內含 `@graph`：

- **Organization**：`name: "reteP"`、`url: SITE_URL`、`logo: https://rete-p.vercel.app/icons/icon-512.png`（絕對）、`sameAs: [APP_STORE_URL]`、`email: milk88084@gmail.com`
- **SoftwareApplication**：`name: "reteP"`、`applicationCategory: "HealthApplication"`、`operatingSystem: "iOS"`、`offers: { "@type": "Offer", "price": "0", "priceCurrency": "TWD" }`、`url: APP_STORE_URL`、`creator/author: { "@type": "Person", "name": "KO CHUAN LI" }`、`aggregateRating`（**待你提供 `ratingValue` + `ratingCount` 才輸出**；未提供前以 `{/* TODO(rating) */}` 佔位、不進 HTML）
- **WebSite**：`name: "reteP"`、`url: SITE_URL`、`inLanguage: "zh-Hant"`（站內無搜尋 → **不加** `SearchAction`）
- **Organization** 增 `founder: { "@type": "Person", "name": "KO CHUAN LI" }`。

**去重機制（硬規定）**：`Organization` / `SoftwareApplication` / `WebSite` **只**出現在 `index.html` 靜態 `<head>` 的這一個 `<script>` 區塊。任何 React 元件（含 `Seo.tsx`、`LandingPage`）**不得**輸出這三個 `@type`。`Seo.tsx` 僅輸出 per-page `WebPage` / `FAQPage`。預渲染 `/` 後 `index.html` 內這三型別各恰好一份。
驗收：`curl -s <preview>/ | grep -o '"@type": *"Organization"' | wc -l` === `1`（`SoftwareApplication`、`WebSite` 同）。

### `public/llms.txt`

```
# reteP

> reteP 是一款 iOS 飲食記錄 App 的官方網站。使用者記錄每一餐的食物、
> 份量與熱量、蛋白質、碳水、脂肪，用月曆逐日回顧、年度圖表看趨勢。
> 網頁版在 Clerk 登入後提供完整 PWA App；未登入則為 App Store 行銷官網。

## 公開頁面
- [首頁](https://rete-p.vercel.app/): 產品介紹與功能總覽
- [關於 reteP](https://rete-p.vercel.app/about): 開發者、聯絡方式、資料處理說明
- [支援與聯絡](https://rete-p.vercel.app/support): 常見問題與客服信箱
- [隱私權政策](https://rete-p.vercel.app/privacy): 資料蒐集、使用與刪除

## 下載
- [App Store（台灣）](https://apps.apple.com/tw/app/id6798490139)

## 聯絡
- Email: milk88084@gmail.com
```

### `LandingPage.tsx` 新增「問答式」區塊（進預渲染）

在 `Highlights` 與 `CtaBand` 之間新增 `<Faq>` / `<Explainer>` section，5 組「`<h2>` 問題 + 130–170 字自足回答」：

1. **reteP 是什麼？** — 定位、平台（iOS）、核心動作（記錄每一餐）、與熱量/三大營養素追蹤的關係、適合誰。
2. **怎麼記錄一餐？** — 選餐別 → 從食物庫挑或手動輸入名稱/份量 → 自動帶出熱量與蛋白質/碳水/脂肪 → 重複偵測帶出上次數值。
3. **支援哪些登入方式？** — Apple、Google 一鍵登入（Clerk），無需自訂密碼；同 email 的不同 provider 視為同一帳號。
4. **我的資料存在哪裡？** — 前端不連資料庫，帶 Clerk token 呼叫後端 API，每筆查詢以帳號隔離；HTTPS 傳輸；不用於廣告追蹤；可隨時刪除。
5. **需要付費嗎？** — 免費下載、免費使用；無訂閱、無內購（如未來有變動再更新本段）。

- 每段文字獨立成句、不依賴前文即可理解（供 AI 抽取引用）。
- **字數**：每段回答 130–170 個中文字元（含標點）。實作後以一次性 node 片段驗證：把 5 段字串陣列 `[...s].length` 各落在 `[130,170]`，列印結果附於 PR 說明。
- 這些 `<h2>` 納入標題階層（P5 檢查）。

### 新增 `/about` 路由與頁面

- `src/pages/AboutPage.tsx`：`<h1>關於 reteP</h1>` + 區塊：**開發者**（個人／團隊，一句話）、**聯絡方式**（`CONTACT_EMAIL`）、**資料如何處理**（3–4 句摘要 + 連向 `/privacy`）、**App Store 連結**。可見「最後更新日期」。
- `src/router/index.tsx`：新增 `{ path: '/about', element: <AboutPage /> }`（放在 `/privacy` 後、`/sso-callback` 前）。
- 掛 `<Seo path="/about" ...>` + `WebPage` JSON-LD。
- 加入 `sitemap.xml`、`llms.txt`、`PUBLIC_ROUTES`、預渲染清單、`LandingPage` footer 連結。

### P4 驗收

- [ ] `curl -s <preview>/ | grep -o 'application/ld+json'` → 至少一筆；把 JSON-LD 貼到 [Schema Markup Validator](https://validator.schema.org/) 無錯，Organization / SoftwareApplication / WebSite 三型別都在，且各恰好一份（見去重驗收）。
- [ ] `curl -s <preview>/llms.txt` → `200`、`text/plain`、內容如上。
- [ ] `curl -s <preview>/ | grep 'reteP 是什麼'` → 命中（證明問答段進了預渲染）。
- [ ] `curl -s <preview>/about` → 有正文 + `WebPage` JSON-LD。
- [ ] `/about` 在 `sitemap.xml` 內。

---

## P5 — AEO　✅ 完成 2026-09-02

> **實作結果**
> - `src/components/seo/JsonLd.tsx`（+2 測試）：`<Helmet>` 內輸出一個 `application/ld+json` script，`<` escape 成 `<` 防提前關閉標籤，自動補 `@context`。
> - `src/lib/schema.ts`（+2 測試）：`faqPageSchema(items)` → `FAQPage`/`Question`/`acceptedAnswer`；`webPageSchema({path,name})` → `WebPage` 含 `@id`、`url`、`inLanguage`、`isPartOf: #website`、`dateModified`（取 `LAST_UPDATED`）、`speakable`（`["h1","[data-speakable]"]`）。
> - `LandingPage`：`<JsonLd data={faqPageSchema(FAQ_ITEMS)} />`（5 題）。
> - `SupportPage`：常見問題重構成 `SUPPORT_FAQ` 陣列（4 題）→ 同時渲染可見清單（答案帶 `data-speakable`）與 `FAQPage` + `WebPage` JSON-LD；新增可見「最後更新日期」。
> - `PrivacyPage` / `AboutPage`：`<JsonLd data={webPageSchema(...)} />`，關鍵答案段落加 `data-speakable`。
> - 標題階層：四個公開頁各唯一 `<h1>`，序列 `h1→h2→h3` 無跳級（實測 index/support/privacy/about）。
>
> **驗證**（`dist/*.html`）：`/` 有 FAQPage(5 Q)；`/support` 有 FAQPage(4 Q) + WebPage(`dateModified 2026-09-02`, speakable, `isPartOf #website`) + 可見「最後更新日期：2026 年 9 月 2 日」；`/privacy` WebPage `dateModified 2026-08-28`；`/about` WebPage `dateModified 2026-09-02`。每頁 `<h1>` 恰 1 個。`data-speakable`：index 5 / support 5 / privacy 3 / about 2。五頁（含 /login）0 hydration error。40 測試全綠、`tsc` 乾淨、`PRERENDER=false` 回滾正常。

### FAQ 區塊 + FAQPage JSON-LD

- **`LandingPage`**：P4 的 5 組問答同時輸出 `FAQPage` JSON-LD（用 `Seo` 或頁內 `<Helmet>`）。問法用使用者真實會問的口吻（「reteP 要錢嗎？」「資料會不會外洩？」「可以用 Google 登入嗎？」）。
- **`SupportPage`**：現有 4 條 FAQ（如何登入 / 資料安全 / 刪除記錄 / 刪除帳號）已是 `<h3>` 問句 → 補 `FAQPage` JSON-LD，問題文字對齊口語問法。

### speakable

- `LandingPage` 問答段每個回答段落加 `data-speakable` 屬性；首頁 `WebPage` JSON-LD 加：
  ```json
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "[data-speakable]"] }
  ```
- `SupportPage` 對「如何登入」「如何刪除帳號」兩段回答的 `<p>` 加 `data-speakable`，其 `WebPage` schema 同上。
- 驗收：`WebPage` JSON-LD 貼進 [Schema Markup Validator](https://validator.schema.org/) 對 `speakable` 無錯；`curl -s <preview>/ | grep -c 'data-speakable'` ≥ 5。

### 標題階層

- **`LandingPage`**：Hero `<h1>reteP</h1>` 唯一 h1。目前 `Showcase`/`Highlights`/`CtaBand` 都是 `<h2>`，`Highlights` 卡片內 `<h3>` — 階層 OK。新增問答段 `<h2>` + 各答案不需標題或用 `<h3>`。確認無 h1→h3 跳級。
- **`Support` / `Privacy` / `About`**：各唯一 `<h1>`，區塊 `<h2>`，子項 `<h3>` — 現況 Support/Privacy 已符合。
- 移除任何以 class 放大字級但語意錯的標題（檢查 `Showcase` 的 `text-5xl` `<h2>` 語意正確、非視覺 h1）。

### 「最後更新日期」+ WebPage schema

- **`PrivacyPage`**：已有可見「最後更新日期」——改為讀 `LAST_UPDATED['/privacy']`（`2026-08-28`）格式化顯示。補 `WebPage` JSON-LD：`name`、`url`、`dateModified: LAST_UPDATED['/privacy']`、`inLanguage: "zh-Hant"`、`isPartOf` 指向 `${SITE_URL}#website`。
- **`SupportPage`**：**新增**可見「最後更新日期」（`LAST_UPDATED['/support']`）+ 同款 `WebPage` JSON-LD。
- **`AboutPage`**：同上（`LAST_UPDATED['/about']`）。
- 三處日期一律來自 `src/constants/site.ts` 的 `LAST_UPDATED` map；`sitemap.xml` 的 `<lastmod>` 取同一 map。

### P5 驗收

- [ ] `curl -s <preview>/` 取出 `FAQPage` 的 `<script type="application/ld+json">`，`JSON.parse` 後 `mainEntity.length === 5`、每筆 `@type === 'Question'` 且有 `acceptedAnswer.text`。
- [ ] `curl -s <preview>/support` → `FAQPage` + `WebPage`(含 `dateModified`) JSON-LD，且頁面可見「最後更新日期」。
- [ ] `curl -s <preview>/privacy` → `WebPage` JSON-LD 含 `dateModified: 2026-08-28`。
- [ ] 每個公開頁 `curl -s <preview>/<path> | grep -o '<h1' | wc -l` === `1`。
- [ ] 標題階層無跳級：以 [W3C Nu HTML Checker](https://validator.w3.org/nu/) 或手動列出各頁 `h1..h4` 序列，確認每層只降一級。
- [ ] validator 對 speakable 無錯；`grep -c 'data-speakable'` ≥ 5（首頁）、≥ 2（support）。

---

## P6 — 驗證與收尾　✅ 本地部分完成 2026-09-02

> **本地驗證全通過**
> - `npm run build`（含 `build:spa` + `prerender.mjs` 斷言）：OK
> - `PRERENDER=false npm run build`：純 SPA，OK
> - `npm run test`：**40 passed / 7 files**
> - `npx tsc --noEmit`：乾淨
> - `vite preview` curl 對照：`/`、`/support`、`/privacy`、`/about` 皆回完整正文 + 對應 JSON-LD；`/robots.txt` → `200 text/plain`；`/sitemap.xml` → `200 text/xml`（含 `/about`）；`/llms.txt` → `200 text/plain`
> - Playwright 掃 `/`、`/support`、`/privacy`、`/about`、`/login`：0 hydration / 0 console error
>
> **待 Vercel Preview 部署後才能驗（`vercel.json` 已就緒）**
> - `curl -sI <preview>/` → 4 個安全標頭（含 `content-security-policy-report-only`）
> - `curl -sI <preview>/login` 與 `/login/` → `x-robots-tag: noindex`
> - GA：設 `VITE_GA_MEASUREMENT_ID` 後，DebugView / Network 確認路由切換送 `page_view`（`page_path` 無 query）
>
> **交付後仍需人工處理（不在本次程式碼範圍）**
> - App Store `ratingValue` + `ratingCount` → 補進 `index.html` 的 `SoftwareApplication.aggregateRating`（目前 `TODO(rating)`）
> - `public/og-cover.png` 換成正式素材（同檔名同尺寸）
> - Google Search Console 網域驗證 + 提交 sitemap（README「SEO / Search Console」節有步驟）
> - CSP `Report-Only` 觀察數日無誤報 → 改強制 `Content-Security-Policy`（另一次 commit）
> - commit / PR：依 README「Git 工作流程」（`feature/marketing-site` → `develop` → `master`）
> - 回到 `/geo audit https://rete-p.vercel.app`（或 preview）比對分數

### （以下為原始計畫，保留供對照）

### 本地

- [ ] `npm run build` 成功（含 `build:spa` + `prerender.mjs` 的自我斷言）。
- [ ] `PRERENDER=false npm run build`（或 `npm run build:spa`）成功——確認純 SPA 回滾路徑未壞。
- [ ] `npm run test` 全綠（含新增 `analytics.test.ts`、`Seo.test.tsx`）。
- [ ] `npx tsc --noEmit` strict 無錯。

### Preview 部署驗收（對照原始需求驗收標準）

| # | 指令 | 期望 |
| --- | --- | --- |
| 1 | `curl -s <preview>/` | 落地頁正文 + JSON-LD（Organization/SoftwareApplication/WebSite/FAQPage） |
| 2 | `curl -s -o /dev/null -w '%{http_code} %{content_type}' <preview>/robots.txt` | `200 text/plain` |
| 3 | `curl -s <preview>/sitemap.xml \| xmllint --noout -` | 無錯（合法 XML） |
| 4 | `curl -s -o /dev/null -w '%{http_code} %{content_type}' <preview>/llms.txt` | `200 text/plain` |
| 5 | `curl -s <preview>/support` / `/privacy` / `/about` | 各有完整正文 + 對應 JSON-LD |
| 6 | `curl -sI <preview>/login` 與 `/login/` | 皆 `x-robots-tag: noindex` |
| 7 | `curl -sI <preview>/` | 4 個安全標頭齊全（含 `content-security-policy-report-only`） |
| 8 | 瀏覽器 + GA DebugView | 路由切換送 `page_view`，`page_path` 無 query |
| 9 | hydration | 公開頁 console **0** 個 `Warning: Prop` 與 **0** 個 hydration error |
| 10 | `curl -s <preview>/ \| grep -c '"@type": *"Organization"'` | `1`（`SoftwareApplication`、`WebSite` 同） |

### 驗證流程（非 VCS）

- [ ] 本節「本地」三項 + 「Preview 部署驗收」1–10 全數通過並記錄輸出。
- [ ] 逐 P（P1–P5）的「驗收」子清單全綠。
- [ ] 產出一份驗收結果對照表（指令 → 實際輸出）附於交付說明。

> commit / PR / changelog / 發版等版本控制動作**不在本計畫內**，依 README「Git 工作流程」在計畫執行完、驗收通過後另行處理。

### 執行後才做（不屬本計畫範圍，僅備忘）

- CSP `Report-Only` 觀察數日無誤報後 → 改強制 `Content-Security-Policy`；同時 `img-src` 收斂為 `'self' data: https://rete-p.vercel.app`、`script-src` 移除 `'unsafe-inline'` 改列 `registerSW` 與 JSON-LD 區塊的 `sha256-` hash。
- `og-cover.png` 由你以正式素材替換占位圖（同檔名同尺寸，免改 code）。
- Google Search Console 網域驗證與 sitemap 提交（你本人操作，步驟見 P3 README 小節）。
- 對 Production 跑 `/geo audit https://rete-p.vercel.app` 比對分數。

---

## 變更檔案總覽

**新增**

- `src/constants/site.ts`
- `src/lib/analytics.ts` + `src/lib/analytics.test.ts`
- `src/hooks/usePageViews.ts`
- `src/types/gtag.d.ts`
- `src/components/seo/Seo.tsx` + `src/components/seo/Seo.test.tsx`
- `src/pages/AboutPage.tsx`
- `scripts/prerender.mjs`
- `public/robots.txt`、`public/sitemap.xml`、`public/llms.txt`
- `public/og-cover.png`（占位，待替換）

**修改**

- `index.html`（絕對 og/twitter image、`summary_large_image`、canonical、`og:site_name`、核心 JSON-LD）
- `vite.config.ts`（manifest：`lang`/`name`/`short_name`/`description`/`theme_color`）
- `vercel.json`（`cleanUrls`、`headers`）
- `package.json`（`build` = `build:spa` + 預渲染、新增 `build:spa` / `prerender` script、`react-helmet-async` 依賴）
- `src/main.tsx`（`HelmetProvider`、hydrate/create 分支）
- `src/App.tsx`（`usePageViews`）
- `src/router/index.tsx`（`/about`）
- `src/router/RootRoute.tsx`（`isLoaded=false` 且無 session cookie → 直接渲染 `LandingPage`，供預渲染）
- `src/pages/LandingPage.tsx`（問答段、FAQ、speakable、常數 import、footer 加 /about、年份 hydration 修正）
- `src/pages/SupportPage.tsx`（最後更新日期、WebPage/FAQPage JSON-LD、常數 import）
- `src/pages/PrivacyPage.tsx`（WebPage JSON-LD、常數 import）
- `src/pages/LoginPage.tsx`、`src/pages/AuthCallbackPage.tsx`（`<Seo noindex>`）
- `.env.example`、`README.md`（新增 Analytics 小節、SEO / Search Console 小節、「已知的坑」補 `react-helmet-async` 維護風險與退場路徑、CSP violation report 查看方式）

---

## 已回覆決策（2026-09-02）

1. **`og-cover.png`**：先用品牌色 + wordmark 占位圖（P3 產生），你之後同檔名替換。
2. **`aggregateRating`**：加入 `SoftwareApplication`。**仍需你提供** `ratingValue`（平均分）與 `ratingCount`／`reviewCount`（評分數）的實際數字；未提供前該欄位先留 `TODO` 註解、不輸出到 HTML。
3. **`theme_color`**：統一為**品牌色 `#BDF2DE`**。`index.html` 的 `<meta name="theme-color" content="#0D0B09">` 改為 `#BDF2DE`；`vite.config.ts` manifest `theme_color` 保持／設為 `#BDF2DE`。
4. **`/about` 開發者欄位**：
   > 由前端工程師 **KO CHUAN LI** 獨力開發與維護。他對 UI/UX 有強烈的設計美感，專注在打磨介面質感。

   - `Organization` / `SoftwareApplication` JSON-LD 增設 `author` / `creator`：`{ "@type": "Person", "name": "KO CHUAN LI" }`。
   - `AboutPage` 可見文字採上述句子。

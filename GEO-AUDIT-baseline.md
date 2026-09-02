# GEO Audit Report: reteP （基準 / BASELINE）

**Audit Date:** 2026-09-02
**URL:** https://rete-p.vercel.app （Production，`master`，尚未含 `feature/marketing-site` 的 GA/SEO/GEO/AEO 變更）
**Business Type:** SaaS / Mobile App 行銷官網（iOS 飲食記錄 App + 登入後 PWA）
**Pages Analyzed:** 4（`/`、`/support`、`/privacy`、`/about` — 全部為 SPA，爬蟲實際可讀內容 = 0）

> 這是**改動前的基準分數**。`feature/marketing-site` 分支上的 P1–P5 實作（預渲染、
> `<Seo>`、robots/sitemap/llms.txt、JSON-LD、FAQ/WebPage schema、安全標頭）**尚未部署**。
> 待 Vercel Preview 或 merge 後重跑一次即可比對 delta。

---

## Executive Summary

**Overall GEO Score: 11/100 (Critical)**

目前線上站對 AI 系統幾乎完全隱形。伺服器回傳的是空殼 SPA（`<div id="root"></div>`），
爬蟲能讀到的只有 `<title>`；沒有 `robots.txt`、`sitemap.xml`、`llms.txt`（這些路徑被
SPA rewrite 吃掉，回傳首頁 HTML、`content-type: text/html`）；沒有任何 JSON-LD 結構化
資料；沒有 canonical；`og:image` 用相對路徑、`twitter:card` 還是小圖 `summary`；沒有
任何安全標頭。最大的單一問題是**沒有伺服器端渲染 / 預渲染** —— 不執行 JavaScript 的
AI 爬蟲（含多數引用型爬蟲）拿到的正文是空的。

好消息：全站 HTTPS + HSTS、部署在 Vercel（速度快）、有 App Store 上架頁可當實體錨點，
而且修復工作已在 `feature/marketing-site` 分支完成、待部署。

### Score Breakdown

| Category | Score | Weight | Weighted |
|---|---|---|---|
| AI Citability | 8/100 | 25% | 2.0 |
| Brand Authority | 12/100 | 20% | 2.4 |
| Content E-E-A-T | 10/100 | 20% | 2.0 |
| Technical GEO | 22/100 | 15% | 3.3 |
| Schema & Structured Data | 0/100 | 10% | 0.0 |
| Platform Optimization | 10/100 | 10% | 1.0 |
| **Overall GEO Score** | | | **11/100** |

---

## Critical Issues (Fix Immediately)

1. **爬蟲讀不到任何正文（無 SSR / 預渲染）** — `curl https://rete-p.vercel.app/` 的
   `<body>` 只有 `<div id="root"></div>`。`/support`、`/privacy` 同樣。不執行 JS 的
   AI 爬蟲拿到空頁。
   → *修復方案已實作*：`feature/marketing-site` 的 `scripts/prerender.mjs` 在 build 時
   把 `/`、`/support`、`/privacy`、`/about` 預渲染成完整 HTML。
2. **完全沒有結構化資料** — 首頁沒有 Organization / WebSite / SoftwareApplication，
   內容頁沒有 WebPage / FAQPage。AI 無法把 reteP 當成一個「實體」理解。
   → *已實作*：`index.html` 靜態 `@graph`（Org + WebSite + SoftwareApplication）＋
   各頁 WebPage/FAQPage JSON-LD。
3. **`robots.txt` / `sitemap.xml` / `llms.txt` 不存在** — 三個路徑都回傳首頁 HTML
   （`200 text/html`）。沒有 sitemap 可提交，沒有 llms.txt 供 AI 理解站台結構。
   → *已實作*：`public/robots.txt`、`public/sitemap.xml`、`public/llms.txt` + `vercel.json`
   `cleanUrls` 讓實體檔優先於 rewrite。

## High Priority Issues

1. **沒有 `<link rel="canonical">`** — 任何頁面都沒有。→ 已實作（`<Seo>` 每頁絕對網址）。
2. **每頁 `<title>` / `description` 相同** — SPA 不換 head。線上 `<title>` 是
   「reteP｜拍一張，記下來」，且與 repo 內容不一致（部署落後）。→ 已實作 per-page `<Seo>`。
3. **沒有 FAQ / 問答式內容** — 首頁與 support 沒有「問題 h2 + 自足回答」區塊，
   AI 難以抽取引用。→ 已實作（首頁 5 段、support 4 段 + FAQPage schema）。
4. **`/about`（開發者 / 資料處理）頁不存在** — `/about` 只是 SPA catch-all。
   → 已實作獨立 `/about` 頁 + WebPage schema。
5. **沒有 llms.txt** — 見 Critical #3。
6. **無 E-E-A-T 訊號可讀** — 爬蟲看不到作者、聯絡方式、資料處理說明。
   → `/about` + `/privacy` 預渲染後可讀，含開發者署名（KO CHUAN LI）。

## Medium Priority Issues

1. **`og:image` 相對路徑 `/icons/icon-512.png`（512×512 方形）** — 分享預覽會抓不到或
   顯示小方圖。→ 已改絕對網址 `/og-cover.png`（1200×630，目前為占位圖，待替換正式素材）。
2. **`twitter:card` = `summary`（小卡）** — → 已升 `summary_large_image`。
3. **沒有安全標頭** — 無 `X-Content-Type-Options`、`Referrer-Policy`、`X-Frame-Options`、
   CSP。→ 已在 `vercel.json` 加上（CSP 先以 `Report-Only` 上線）。
4. **`manifest.webmanifest` `lang: "en"`、`name` 與品牌不一致、`theme_color` 與
   `index.html` 不符** — → 已修為 `zh-Hant` / `reteP` / `#BDF2DE`。
5. **`aggregateRating` 缺** — SoftwareApplication 沒有評分。→ 待提供 App Store
   `ratingValue` + `ratingCount`（目前程式碼留 `TODO(rating)`）。

## Low Priority Issues

1. `keywords` meta（已無 SEO 價值）— 改動時順手移除。
2. 首頁多個大字級 `<h2>`，需確認語意階層不跳級 —（新版已檢查：h1→h2→h3 無跳級）。
3. `speakable` schema 缺 —（新版已加，selector `["h1","[data-speakable]"]`）。
4. 部署分支落後：Production `master` 的 `<title>` 與 repo 不一致，需確認 Vercel
   Production 分支與 build 設定。

---

## Category Deep Dives

### AI Citability — 8/100
爬蟲可讀內容：`<title>` 一行，正文 0 字。沒有任何可被 ChatGPT / Perplexity / Claude
抽出成段落引用的內容。無 FAQ、無定義句、無列表。這是分數最低、影響最大的一項。

### Brand Authority — 12/100
reteP 是 2026-08 上架的個人開發 App，屬新且小眾。有 App Store（台灣）上架頁可作為
實體錨點與 `sameAs` 目標。未發現 Wikipedia、具規模的 Reddit / YouTube / 新聞報導
（需另做 web 檢索確認；以現況推估屬極低基期）。建議：Product Hunt、個人部落格
開發紀錄、App 相關社群貼文，逐步累積第三方提及。

### Content E-E-A-T — 10/100
`/privacy` 有實質內容（資料蒐集、第三方服務、刪除權利）但**爬蟲看不到**。無作者
署名、無「關於」頁、無開發者背景。E-E-A-T 幾乎不可被機器評估。

### Technical GEO — 22/100
加分：HTTPS、`Strict-Transport-Security`（含 preload）、Vercel CDN、靜態資源快取、
行動裝置 viewport 正常、`Age`/`X-Vercel-Cache` 顯示有邊緣快取。
扣分：無 SSR/預渲染（決定性）、無真實 `robots.txt` / `sitemap.xml` / `llms.txt`、
無安全標頭、SPA rewrite 吃掉所有未知路徑、無 canonical。

### Schema & Structured Data — 0/100
整站沒有任何 JSON-LD 或 microdata。

### Platform Optimization — 10/100
Google AI Overviews / ChatGPT search / Perplexity / Gemini / Bing Copilot 都需要
可爬取的文字內容與結構化資料，目前皆不具備。唯一正分項是 App Store 上架頁提供了
一個結構化的外部實體來源。

---

## Quick Wins（本週）

1. **部署 `feature/marketing-site`** — 一次補上預渲染、robots/sitemap/llms、JSON-LD、
   per-page meta、安全標頭。預估 Overall 由 11 → 65–75 區間。
2. **確認 Vercel Production 分支與 build**，讓線上 `<title>` 不再落後 repo。
3. **提交 `sitemap.xml` 到 Google Search Console** 並要求索引首頁。
4. **補 `og-cover.png` 正式素材**（1200×630）。
5. **填入 App Store 評分** → `SoftwareApplication.aggregateRating`。

## 30-Day Action Plan

### Week 1: 部署與驗證
- [ ] merge / 部署 `feature/marketing-site`（P1–P5）
- [ ] 對 Preview / Production 跑 curl 驗收（body、robots、sitemap、llms、headers）
- [ ] Google Search Console：驗證網域 + 提交 sitemap + 要求索引 `/`

### Week 2: 內容深化
- [ ] `og-cover.png` 換正式圖；補 `aggregateRating`
- [ ] 首頁問答段依真實搜尋語句再調整用字
- [ ] `/about` 補開發歷程 / 更新頻率說明，強化 E-E-A-T

### Week 3: 站外實體
- [ ] Product Hunt / App 社群 / 個人部落格發佈，建立第三方提及與 `sameAs`
- [ ] 確認 App Store 頁描述與官網一致（實體一致性）

### Week 4: 收斂與硬化
- [ ] CSP `Report-Only` 觀察無誤報 → 改強制 CSP
- [ ] 重跑 `/geo audit`，比對 baseline，記錄各分項 delta

---

## Appendix: Pages Analyzed

| URL | 爬蟲可讀內容 | 主要問題 |
|---|---|---|
| `/` | `<title>` only | 無正文、無 JSON-LD、無 canonical、無 FAQ |
| `/support` | `<title>` only（SPA） | 同上；FAQ 內容存在於 JS 但爬蟲不可見 |
| `/privacy` | `<title>` only（SPA） | 同上；隱私條款內容爬蟲不可見、無「最後更新」機讀標記 |
| `/about` | 無（SPA catch-all，非真實頁） | 頁面不存在 |

### 端點狀態

| 路徑 | 狀態 | content-type | 應為 |
|---|---|---|---|
| `/robots.txt` | 200 | `text/html` ❌ | `text/plain` + 真實內容 |
| `/sitemap.xml` | 200 | `text/html` ❌ | `application/xml` / `text/xml` |
| `/llms.txt` | 200 | `text/html` ❌ | `text/plain` + 真實內容 |
| 安全標頭 | 無 | — | `X-Content-Type-Options` / `Referrer-Policy` / `X-Frame-Options` / CSP |

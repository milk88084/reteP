# GEO Audit Report: reteP

**Audit Date:** 2026-09-03
**URL:** https://rete-b6es9np95-maxs-projects-cce51284.vercel.app （Vercel Preview，`feature/marketing-site` @ `5b3cee5`）
**Business Type:** SaaS / Mobile App 行銷官網（iOS 飲食記錄 App + 登入後 PWA）
**Pages Analyzed:** 4 公開路由（`/`、`/support`、`/privacy`、`/about`，皆 build-time 預渲染）

> 這是 GA/SEO/GEO/AEO 實作**部署後**的稽核，對照基準見 `GEO-AUDIT-baseline.md`。
> 預渲染改用 `react-dom/server`（純 Node，無 headless 瀏覽器），在 Vercel build 穩定運作。

---

## Executive Summary

**Overall GEO Score: 56/100 (Poor，逼近 Fair)** — 基準 11/100，**+45**。

技術與結構化資料層面已從「幾乎隱形」跳到「AI 可完整讀取」：四個公開頁現在都回傳
完整正文 HTML（含問答段落），首頁有 Organization / WebSite / SoftwareApplication
的靜態 JSON-LD，每頁再加 WebPage / FAQPage、`speakable`、canonical、per-page
title/description/OG。`robots.txt`、`sitemap.xml`、`llms.txt` 皆為正確 content-type
的實體檔，安全標頭齊備。

還壓著分數的三項都**不是程式碼能解的**：品牌在 AI 訓練/引用來源平台（Reddit、
YouTube、Wikipedia 等）幾乎沒有第三方提及（Brand Authority 18）；E-E-A-T 的深度
內容與外部佐證薄弱（45）；平台曝光需要時間與站外經營（52）。

### Score Breakdown

| Category | Baseline | Now | Δ | Weight | Weighted |
|---|---|---|---|---|---|
| AI Citability | 8 | 70 | +62 | 25% | 17.5 |
| Brand Authority | 12 | 18 | +6 | 20% | 3.6 |
| Content E-E-A-T | 10 | 45 | +35 | 20% | 9.0 |
| Technical GEO | 22 | 86 | +64 | 15% | 12.9 |
| Schema & Structured Data | 0 | 82 | +82 | 10% | 8.2 |
| Platform Optimization | 10 | 52 | +42 | 10% | 5.2 |
| **Overall** | **11** | **56** | **+45** | | **56.4** |

---

## Critical Issues

_(基準的 3 個 Critical 已全部解決)_

- ✅ 預渲染正文 — 四頁 `<div id="root">` 現含完整 DOM（`data-prerender-ready`）。
- ✅ 結構化資料 — Organization / WebSite / SoftwareApplication + 每頁 WebPage / FAQPage。
- ✅ `robots.txt` / `sitemap.xml` / `llms.txt` — 實體檔、正確 content-type、`sitemap` 4 URL。

目前無 Critical。

## High Priority Issues

1. **品牌無第三方提及（站外）** — AI 模型辨識實體、決定是否引用，很大程度看
   Reddit / YouTube / Wikipedia / 新聞 / 開發者部落格的訊號。reteP 目前近乎為零。
   → 非程式碼可解；見 30 天計畫 Week 3。
2. **`SoftwareApplication` 缺 `aggregateRating`** — schema 已備好位置（`index.html`
   有 `TODO(rating)` 註解），待提供 App Store `ratingValue` + `ratingCount`。
3. **E-E-A-T 深度不足** — `/about` 的開發者介紹只有一句；沒有開發歷程、更新紀錄、
   方法論或外部佐證。AI 對「作者可信度」的訊號偏弱。

## Medium Priority Issues

1. **CSP 仍為 `Report-Only`** — 依計畫先觀察數日，無誤報後改強制 `Content-Security-Policy`
   （另一次 commit，同時收斂 `img-src`、`script-src` 改 hash）。
2. **`og-cover.png` 為占位圖** — 品牌色 + wordmark 的暫用版，待換正式視覺。
3. **`/login`、`/sso-callback` 的 `noindex` 僅靠 HTTP 標頭**（`X-Robots-Tag: noindex`
   已生效）；`<meta name="robots">` 要 JS 執行後才出現（這兩頁不預渲染）。可接受。
4. **Bundle 576 KB（gzip 186 KB）** — 單一 chunk 偏大，非 GEO 直接因素但影響
   Core Web Vitals；日後可 code-split。

## Low Priority Issues

1. `sitemap.xml` 由 Vercel 以 `application/xml` 提供（合法；Google 亦接受）。
2. `sitemap.xml` / `LAST_UPDATED` 為人工維護，新增公開頁時三處要一起改
   （`PUBLIC_ROUTES`、`LAST_UPDATED`、`sitemap.xml`）。
3. `react-helmet-async` 已停止維護（README「已知的坑」有記；退路已寫明）。

---

## Category Deep Dives

### AI Citability — 70/100 （基準 8）
四頁皆預渲染，爬蟲（含不跑 JS 的引用型爬蟲）拿得到完整正文。首頁約 8,200 字元
可見文字，含 5 段「問題式 h2/h3 + 130–170 字自足回答」（reteP 是什麼 / 怎麼記錄一餐 /
支援哪些登入 / 資料存哪 / 需不需付費），每段可獨立被引用。`/support` 另有 4 段 FAQ。
標題階層乾淨（每頁單一 `<h1>`，`h1→h2→h3` 無跳級）。扣分：站台總內容量仍小，
缺長篇、缺資料/案例類可深引用的素材。

### Brand Authority — 18/100 （基準 12）
`llms.txt` + `Organization`（`founder`、`sameAs` 指 App Store）+ `SoftwareApplication`
提供了一致的實體描述，利於 AI 建立 entity。但站外第三方提及極少。App Store 台灣
上架頁是目前唯一的外部錨點。

### Content E-E-A-T — 45/100 （基準 10）
`/about` 具名開發者（KO CHUAN LI）、聯絡方式、資料處理說明並連向 `/privacy`；
`/privacy` 與 `/support` 有可見「最後更新日期」與 `WebPage.dateModified`（機讀）。
`Person` schema（founder / creator）建立作者實體。扣分：開發者背景僅一句、
無外部佐證（GitHub、個人站、訪談）、無專業深度內容。

### Technical GEO — 86/100 （基準 22）
預渲染 HTML、`robots.txt`（allow all + sitemap）、`sitemap.xml`（4 URL + lastmod）、
`llms.txt`、per-page canonical（絕對）、`X-Content-Type-Options` / `Referrer-Policy` /
`X-Frame-Options` / `Content-Security-Policy-Report-Only`、`/login` 的 `X-Robots-Tag:
noindex`、HTTPS + HSTS + Vercel CDN。扣分：CSP 尚未強制；單一大 JS chunk。

### Schema & Structured Data — 82/100 （基準 0）
`index.html` 靜態 `@graph`：Organization（logo 絕對、`founder`、`sameAs`）、WebSite
（`inLanguage`、`publisher`）、SoftwareApplication（`HealthApplication` / iOS /
`Offer` 0 TWD / `creator`）。每頁再加 WebPage（`@id`、`url`、`dateModified`、
`isPartOf: #website`、`speakable`）；`/` 與 `/support` 加 FAQPage（5 / 4 題，
`Question` + `acceptedAnswer`）。JSON 皆合法、型別不重複。扣分：`aggregateRating`
未填、無 `BreadcrumbList`。

### Platform Optimization — 52/100 （基準 10）
可爬取內容 + FAQ + schema → 具備被 Google AI Overviews、ChatGPT search、Perplexity
擷取的基本條件；`llms.txt` 針對 AI 系統。扣分：訓練/引用來源平台無品牌足跡，
新站需時間累積曝光。

---

## Quick Wins（本週）

1. **填 `aggregateRating`** — 提供 App Store 平均分 + 評分數，補進 `index.html` 的
   `SoftwareApplication`（Schema 82 → ~88）。
2. **驗收通過後合併部署** — 走 `/create-pr`（base `develop`）→ 發版流程，讓正式站
   `rete-p.vercel.app` 生效（目前分數是 preview）。
3. **Google Search Console** — 驗證網域 + 提交 `sitemap.xml` + 對 `/` 要求索引
   （README「SEO / Search Console」節）。
4. **換 `og-cover.png` 正式圖**（同檔名尺寸）。
5. **`/about` 加 3–4 句開發者背景** — 經歷、為何做這個 App、更新頻率承諾
   （E-E-A-T 45 → ~55）。

## 30-Day Action Plan

### Week 1: 上線與索引
- [ ] merge `feature/marketing-site` → `develop` → 部署
- [ ] Search Console 驗證網域、提交 sitemap、要求索引 `/`、`/about`
- [ ] 對正式站重跑本稽核，確認分數不因環境差異退步

### Week 2: 內容與 schema 補完
- [ ] 補 `aggregateRating`；換正式 OG 圖
- [ ] `/about` 擴充開發者背景與方法論
- [ ] 首頁問答段依真實搜尋語句微調用字（GSC 查詢報表出來後）

### Week 3: 站外實體（拉 Brand Authority / Platform）
- [ ] Product Hunt 上架、開發者部落格寫一篇「為什麼做 reteP / 技術選型」
- [ ] 相關社群（Reddit r/ios、飲食記錄社團）自然分享
- [ ] 確認 App Store 頁文案與官網一致（實體一致性）

### Week 4: 硬化與複審
- [ ] CSP `Report-Only` 無誤報 → 改強制 `Content-Security-Policy`
- [ ] `npm run build` bundle code-split（Core Web Vitals）
- [ ] 重跑 `/geo audit`，比對本報告

---

## Appendix: Pages Analyzed

| URL | 狀態 | 預渲染 | title | Schema | 備註 |
|---|---|---|---|---|---|
| `/` | 200 | ✅ | reteP｜記錄每天的飲食熱量與營養 | Organization, WebSite, SoftwareApplication, FAQPage(5) | 5 段問答、`data-speakable` |
| `/support` | 200 | ✅ | 支援與聯絡｜reteP | WebPage, FAQPage(4) | 可見「最後更新日期」、`data-speakable`×5 |
| `/privacy` | 200 | ✅ | 隱私權政策｜reteP | WebPage(`dateModified 2026-08-28`) | `data-speakable`×3 |
| `/about` | 200 | ✅ | 關於 reteP | WebPage | 具名開發者、連向 /privacy |
| `/login` | 200 | — (SPA) | 登入｜reteP | — | `X-Robots-Tag: noindex` |

### 端點

| 路徑 | 狀態 | content-type |
|---|---|---|
| `/robots.txt` | 200 | `text/plain; charset=utf-8` ✅ |
| `/sitemap.xml` | 200 | `application/xml` ✅（4 URL） |
| `/llms.txt` | 200 | `text/plain; charset=utf-8` ✅ |
| 安全標頭 | — | `X-Content-Type-Options` / `Referrer-Policy` / `X-Frame-Options` / `CSP-Report-Only` ✅ |

# reteP — 飲食記錄官網 + PWA 網頁版

**Calorie Record**：記錄每日飲食、追蹤熱量與三大營養素、檢視歷史與趨勢。

這個 repo 是 reteP 的 **公開官網** —— 行銷首頁，加上 App Store 上架頁會連過去的
**支援 / 隱私政策** 頁面。同一個 Vite SPA 也在 Clerk 登入後提供完整的 **PWA 網頁版 App**。
部署在 Vercel：<https://rete-p.vercel.app>

## 三個 repo 的關係

| Repo             | 位置                | 角色                                                    |
| ---------------- | ------------------- | ------------------------------------------------------- |
| **reteP**        | 本 repo             | 官網 + PWA 網頁版，部署於 <https://rete-p.vercel.app>   |
| reteP-backend    | `../reteP-backend`  | FastAPI，部署於 <https://retep-backend.zeabur.app>      |
| reteP-mobile     | `../reteP-mobile`   | iOS App（Expo），已於 2026-08-19 上架                   |

**前端不直接連資料庫**，也不含伺服器邏輯 —— 帶著 Clerk session token 呼叫後端的
`/logs`、`/settings`、`/foods`、`/recommendations`。授權由後端負責，每筆查詢以 Clerk `userId` 隔離。
iOS App 與本網頁版 **共用同一組後端 API 與 Clerk 專案**。

## 這個 repo 有兩個面向

| 面向        | 內容                                              | 誰看得到           |
| ----------- | ------------------------------------------------- | ------------------ |
| **官網**    | `LandingPage`、`SupportPage`、`PrivacyPage`       | 所有人（不需登入） |
| **網頁 App** | `AppShell` → Home / History / Settings + 食物功能 | Clerk 登入後       |

### 路由表（`src/router/index.tsx`）

| Path            | 渲染                                          | 說明                           |
| --------------- | --------------------------------------------- | ------------------------------ |
| `/`             | 訪客 → `LandingPage`；已登入 → `AppShell`     | 分流邏輯在 `resolveRootRoute`  |
| `/login`        | `LoginPage`                                   | Google 一鍵登入                |
| `/support`      | `SupportPage`                                 | **App Store「支援 URL」**      |
| `/privacy`      | `PrivacyPage`                                 | **App Store「隱私政策 URL」**  |
| `/sso-callback` | `AuthCallbackPage`                            | Clerk SSO 回跳                 |
| `/*`            | `AppShell`                                    | 已登入的 App 外殼              |

> **`/support` 和 `/privacy` 是對 Apple 的承諾。** App Store Connect 的清單直接連這兩個
> 絕對網址；一旦 404、改路徑或整頁拿掉，上架頁的連結就壞了，送審也會被打回。
> 改動這兩頁前先確認網址不變。

## Tech Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Build     | Vite 5 + React 18 + TypeScript 5                              |
| 路由      | react-router-dom 6（`createBrowserRouter`）                   |
| 樣式      | Tailwind CSS 3 + Framer Motion 11                            |
| 狀態      | Zustand 4（`foodLogStore` / `settingsStore` / `uiStore`）     |
| 認證      | Clerk（`@clerk/clerk-react`）— Google 一鍵登入                |
| 資料層    | 後端 REST API（`axios`，`VITE_API_BASE_URL`）                 |
| 拍照辨識  | n8n webhook（`VITE_AI_WEBHOOK_URL`，選填；未設則走 mock）     |
| PWA       | vite-plugin-pwa（`registerType: 'autoUpdate'`）               |
| 測試      | Vitest（`*.test.ts`）                                         |
| 部署      | Vercel（`vercel.json`：所有路徑 rewrite → `index.html`）      |
| 套件管理  | **npm**                                                      |

## Project Structure

```
src/
├── main.tsx              ClerkProvider 掛載點；缺 VITE_CLERK_PUBLISHABLE_KEY 直接 throw
├── App.tsx               ApiAuthSync + RouterProvider
├── router/
│   ├── index.tsx         路由表（見上）
│   ├── RootRoute.tsx     `/` 分流：訪客 → Landing、已登入 → App
│   └── resolveRootRoute.ts   純函式，有單元測試
├── pages/
│   ├── LandingPage.tsx       官網首頁：Hero（呼吸環動畫）+ 特色 + CTA + Footer
│   ├── SupportPage.tsx       App Store 支援頁（聯絡信箱、FAQ、刪除帳號說明）
│   ├── PrivacyPage.tsx       App Store 隱私政策頁
│   ├── LoginPage.tsx         Google 一鍵登入
│   ├── AuthCallbackPage.tsx  Clerk SSO 回跳
│   ├── HomePage.tsx          今日攝取、營養素環圈
│   ├── HistoryPage.tsx       日曆與歷史記錄
│   └── SettingsPage.tsx      身體資料、每日目標、刪除帳號
├── components/
│   ├── layout/AppShell.tsx   登入後外殼：左右滑動切換 Home / History / Settings
│   ├── ApiAuthSync.tsx       Clerk token → apiClient（每次 session 變動更新）
│   ├── DataSync.tsx          登入後載入使用者設定與當日記錄
│   └── features/             dashboard（ParticleRing、MetricNav）、
│                             food（卡片、清單、手動輸入、食物庫、推薦）、camera
├── services/
│   ├── foodRecognitionApi.ts 資料層：/logs、/settings、/foods、/recommendations + n8n 辨識
│   ├── mockApi.ts            VITE_USE_MOCK=true 或缺 webhook 時的假資料
│   └── transform.ts          後端回應 → 前端型別（有單元測試）
├── lib/apiClient.ts          axios 實例；每個 request 注入最新的 Clerk JWT
├── store/                    Zustand stores
└── utils/                    nutritionCalc（BMR / TDEE）、dateUtils、cn、id
```

### 後端回應格式

後端是 **FastAPI，沒有 `{ success, data }` envelope** —— 成功時直接回傳 payload。
`getSettings()` 把 **404 當成「使用者還沒設定過」**（回 `null`），不是錯誤。
資料層一律走 `src/services/foodRecognitionApi.ts`，不要在元件裡直接 `axios` ——
直接打會失去 Clerk token 注入與 mock 切換。

## Quick Start

```bash
# 1. 環境變數（.env.local 是 gitignored 的，clone 後必做）
cp .env.example .env.local

# 2. 安裝並啟動
npm install
npm run dev
```

| 變數                         | 說明                                                     | 必要                       |
| ---------------------------- | ------------------------------------------------------- | -------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable key            | ✓（缺了 App 直接 throw）    |
| `VITE_API_BASE_URL`          | 後端 API：本機 `http://localhost:8000`，正式填 Zeabur 網址 | ✓                          |
| `VITE_AI_WEBHOOK_URL`        | n8n 拍照辨識 webhook 的 URL                              | 選填                       |
| `VITE_USE_MOCK`              | 設 `true` 全程用假資料，不打任何外部服務                 | 選填                       |

> `.env.local` 已被 `.gitignore` 排除，請勿 commit。

## Scripts

| Command                | Description                                        |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Vite dev server                                   |
| `npm run build`        | `tsc && vite build` → `dist/`                     |
| `npm run preview`      | 預覽 build 結果                                   |
| `npm run test`         | Vitest（`vitest run`）                            |
| `npm run build:ios` / `open:ios` | ⚠️ 遺留的 Capacitor 指令，見「已知的坑」 |

## Git 工作流程

`feature/*` → `develop` → `master`。Feature 分支一律從 `master` checkout。

> 本 repo 的主幹是 **`master`**（不是 `main`）。

```
master ──► feature/*  ──/create-pr──►  develop  ──merge──►  master ──tag──► origin
```

1. **`/git:branch`** — 從 `master` 開分支，自動建議分支名。
2. **開發** — 整個 feature 完成前不要逐檔 commit。
3. **`/git:commit`** — 產生 Conventional Commit（< 72 字、無 scope、無 body）。
4. **`/create-pr`** — 在 feature 分支執行（**不可在 develop / master**），base 一律 `develop`。
5. **切到 develop，`/git:changelog`** — 更新 `CHANGELOG.md` + `package.json`。**僅可在 develop 執行**，工作區需乾淨。
6. **`git push origin develop`** — 驗證 develop 環境功能正常。
7. **發版** — merge develop → master，push，再打 tag。

### 標準審查流程

計畫寫完後 **必須依序執行**：`/planning:review`（Staff engineer 視角審查）→
`/planning:apply-review`（把意見套回文件）。略過 review 直接實作視為流程違規。

## 已知的坑

這些都是實際踩過、且 **不會給出明顯錯誤訊息** 的：

- **Capacitor 是遺留的。** `capacitor.config.ts`、`@capacitor/*` 依賴、`build:ios` /
  `open:ios` script 都還在，但 iOS App 已經整個搬到獨立的 **reteP-mobile**（Expo）。
  這個 repo 只出網頁 / PWA，**不要再用 Capacitor 打包 iOS**。
- **Vercel 的 SPA rewrite 一定要保留。** `vercel.json` 把所有路徑 rewrite 到
  `index.html`。少了它，直接開 `/support`、`/privacy` 會 404 —— 而 App Store 稽核就是
  直接打這兩個絕對網址。
- **PWA `autoUpdate` + 舊 service worker 快取。** 改版後使用者可能還是拿到舊 bundle，
  直到 SW 自己換掉。驗證新版時要 hard reload 或先清掉 service worker。
- **Clerk 是開發實例。** `pk_test_…`，開發實例有約 **100 人硬上限**，且與 reteP-mobile
  **共用同一個 Clerk 專案**，額度一起算。撞到就是新使用者註冊失敗。
- **`recognizeFood` 直接打 n8n，不經後端。** 沒設 `VITE_AI_WEBHOOK_URL` 會 **靜默
  fallback 到 mock**，不報錯 —— 「拍照辨識都出假資料」通常就是 webhook 沒設。
- **同一個 email 的不同登入方式會共用帳號。** Clerk 會把 verified email 相同的
  provider 合併成同一個 `userId`。這是設計如此，不是資料外洩。

---

## 設計 token

### 背景 / 表面

| Token             | Hex       | 用途                             |
| ----------------- | --------- | -------------------------------- |
| `bg-bg`           | `#0D0B09` | 全域背景                         |
| `bg-surface`      | `#1A1714` | 卡片、輸入框、手風琴背景         |
| `border-border`   | `#2A2520` | 分隔線、邊框、未選取按鈕背景     |

### 文字

| Token             | Hex       | 用途                             |
| ----------------- | --------- | -------------------------------- |
| `text-ink`        | `#EDE8E0` | 主要文字                         |
| `text-ink-muted`  | `#7A6F65` | 次要文字、label、placeholder     |

### 品牌 / 強調

| Token                          | Hex       | 用途                                       |
| ------------------------------ | --------- | ------------------------------------------ |
| `bg-accent` / `text-accent`    | `#B6B9FE` | Settings hero 背景、熱量指標、日期文字     |
| `bg-brand` / `text-brand`      | `#BDF2DE` | 碳水化合物指標                             |

### 指標色（hard-coded）

| 指標         | Hex       | 備註          |
| ------------ | --------- | ------------- |
| 熱量         | `#B6B9FE` | = `accent`    |
| 蛋白質       | `#6366FF` | Indigo        |
| 碳水化合物   | `#BDF2DE` | = `brand`     |
| 脂肪         | `#CFE7FF` | Light blue    |

### 字型

| 角色         | 字型                        |
| ------------ | --------------------------- |
| 主要（中英） | DM Sans + Noto Sans TC      |
| 首頁大標題   | Bitcount Prop Single        |

### 樣式檔位置

- `src/index.css` —— Tailwind 三層、reset、基礎元素樣式、color tokens。
- 自訂 Tailwind tokens 在 `tailwind.config.ts`。
- 靜態資源（icons、圖片）放 `public/`，以 `url('/icons/<檔名>')` 引用。

# 飲食記錄

拍一張，記下來。記錄每日飲食熱量與營養的 iOS / PWA app。

**Tech Stack**

| 層 | 技術 |
|---|---|
| UI | React 18 + TypeScript + Vite |
| 樣式 | Tailwind CSS + Framer Motion |
| 狀態 | Zustand |
| 後端 / 資料庫 | Supabase |
| 認證 | Clerk |
| 食物辨識 | n8n webhook（可抽換） |
| 行動裝置 | Capacitor（iOS） |
| PWA | vite-plugin-pwa |

## 本地開發設定

```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入以下變數：

| 變數 | 說明 | 必要 |
|------|------|------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys → Publishable key | ✓ |
| `VITE_SUPABASE_URL` | Supabase Project Settings → API | ✓ |
| `VITE_SUPABASE_ANON_KEY` | Supabase Project Settings → API | ✓ |
| `VITE_AI_WEBHOOK_URL` | n8n webhook 或其他食物辨識服務的 URL | 選填 |
| `VITE_USE_MOCK` | 設為 `true` 可跳過所有外部呼叫，使用 mock 資料 | 選填 |

> **注意：** `.env.local` 已被 `.gitignore` 排除，請勿 commit。

啟動開發伺服器：

```bash
npm install
npm run dev
```

iOS 建置：

```bash
npm run build:ios   # build + cap sync
npm run open:ios    # 用 Xcode 開啟
```

## Git 工作流程

`feature/*` → `develop` → `main`。Feature 分支一律從 `main` checkout。

```
main ──► feature/*  ──/create-pr──►  develop  ──merge──►  main ──tag──► origin
```

1. **`/git:branch`** — 從 staged diff 或對話自動建議分支名；也可附帶情境：`/git:branch 加上 hero 動畫`。從 `main` 開分支。
2. **開發** — 整個 feature 完成前不要逐檔 commit。
3. **`/git:commit`** — feature 完成後執行；產生 Conventional Commits 訊息（<72 字、無 scope、無 body），必要時建議拆分。
4. **`/create-pr`** — 在 feature 分支執行（**不可在 develop/main**）。推分支、開 PR、跑 CI/CD、合併進 develop。
5. **切到 develop，`/git:changelog`** — 自動 `git pull --ff-only origin develop` 取得最新狀態，再依 `package.json` 推算下一版本（也可手動指定），更新 `CHANGELOG.md` + `package.json` 並 commit。**僅可在 develop 執行**，工作區需乾淨。
6. **`git push origin develop`** — 驗證 develop 環境功能正常。
7. **發版** — merge develop → main，push，再打 tag：
   ```bash
   git checkout main && git merge develop && git push origin main
   git tag v0.1.0 && git push origin --tags
   ```

版本號以 `package.json` 為準；git tag、`package.json`、`CHANGELOG.md` 三者必須同步。

## 規劃技能

| 情境                            | 使用技能                     |
| ------------------------------- | ---------------------------- |
| 需要逐步拆解任務、有明確 spec   | `/superpowers:writing-plans` |
| 快速規劃單一功能、不需完整 spec | `/plan`（Claude 官方）       |
| 跨多檔案的大型功能              | `/ultraplan`（Claude 官方）  |

### 標準審查流程

計畫寫完後，**必須依序執行**：

1. `/planning:review` — Staff engineer 視角審查計畫，輸出修改建議
2. `/planning:apply-review` — 將審查意見套用回計畫文件

> 兩步驟缺一不可；略過 review 直接實作視為流程違規。

## 樣式與字型

- `src/index.css` — Tailwind 三層、reset、基礎元素樣式、color tokens（`bg-bg`、`text-ink` 等）。
- 自訂 Tailwind tokens 在 `tailwind.config.ts`。
- 靜態資源（icons、圖片）放 `public/`，以 `url('/icons/<檔名>')` 引用。

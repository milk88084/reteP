# 官網首頁圖片

`src/pages/LandingPage.tsx` 依照 araS 官網（`../../../araS/apps/web/app/landing-content.tsx`）
的排版：Hero 五支手機扇形 + Showcase 中央一支手機、四周漂浮情境照。
找不到檔案時自動顯示占位框（情境照則直接隱藏），可以先上線、之後再補圖。

## 需要的檔案

| 檔名 | 用途 | 素材類型 | 建議尺寸 |
| --- | --- | --- | --- |
| `phone-1.webp` ~ `phone-5.webp` | Hero 扇形手機、Showcase 中央手機（`phone-3` 同時用於兩處）| **去背、無文字的純 App 螢幕截圖**（不要有手機外框、不要有行銷大標，外框由程式繪製）| 直式，約 9:19.3（例如 1170×2532）|
| `situation-1.webp` ~ `situation-4.webp` | Showcase 兩側漂浮情境照 | **16:9 橫幅情境／生活照**（食物、餐桌、使用場景等）| 橫式 16:9（例如 1600×900）|

## 目前狀態

- 現在資料夾裡的 `phone-1.webp` ~ `phone-6.webp` 是 **App Store 行銷截圖**
  （已內含手機外框 + 大標字），套進程式的手機框會變成「框中框」——**需要換成上表的純截圖**。
- `phone-6.webp` 目前**沒有被使用**（araS 版型的扇形只有 5 支）。
- `situation-1.webp` ~ `situation-4.webp` 尚未提供，補上後 Showcase 兩側的漂浮情境照才會出現。

檔名固定、全小寫、副檔名 `.webp`。要改格式或張數，請同步改 `LandingPage.tsx` 的
`PHONE_SHOTS` / `SITUATION_SHOTS`。

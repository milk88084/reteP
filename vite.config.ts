/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*.png", "favicon.ico"],
      manifest: {
        name: "reteP",
        short_name: "reteP",
        lang: "zh-Hant",
        description:
          "記錄每一餐，追蹤熱量與蛋白質、碳水、脂肪。內建食物庫與營養推薦，用月曆逐日回顧、年度圖表看趨勢。",
        theme_color: "#BDF2DE",
        background_color: "#FAFAF7",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "icons/icon-180.png", sizes: "180x180", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-static",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",
    restoreMocks: true,
    unstubEnvs: true,
  },
  server: {
    proxy: {
      "/api/analyze-food": {
        target: "https://n8n.iii-ei-stack.com",
        changeOrigin: true,
        rewrite: () => "/webhook-test/analyze-food",
      },
    },
  },
});

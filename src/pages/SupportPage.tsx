import { CONTACT_EMAIL, LAST_UPDATED, formatUpdated } from '@/constants/site'
import { Seo } from '@/components/seo/Seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqPageSchema, webPageSchema } from '@/lib/schema'

const LAST_UPDATED_LABEL = formatUpdated(LAST_UPDATED['/support'])

const SUPPORT_FAQ = [
  {
    q: '如何登入 reteP？',
    a: 'reteP 透過 Apple 或 Google 帳號一鍵登入，你不需要另外設定或記住密碼。使用第三方帳號登入時，reteP 只會收到你的電子郵件、顯示名稱與帳號識別碼。',
  },
  {
    q: '我在 reteP 的資料安全嗎？',
    a: '你的資料以 HTTPS 加密連線傳輸，並僅與你的帳號關聯，每一筆查詢都以你的帳號識別碼隔離，只有你本人能存取。我們不會販售你的個人資料，也不會用於廣告追蹤。完整說明請見隱私權政策頁。',
  },
  {
    q: '如何刪除單筆飲食記錄？',
    a: '在「歷史」頁面找到任一筆記錄並直接刪除，刪除後會立即從你的帳號中移除。',
  },
  {
    q: '如何刪除我的帳號與所有資料？',
    a: '前往「設定」頁面，捲動至頁面底部，點選「刪除帳號」並確認。你的帳號、所有飲食記錄、每日目標與自訂食物都會被立即永久刪除，此操作無法復原。',
  },
]

export const SupportPage = () => (
  <main
    className="mx-auto min-h-screen max-w-2xl bg-white px-6 py-12 text-[#1c1c1e]"
    data-prerender-ready
  >
    <Seo
      title="支援與聯絡｜reteP"
      description="reteP 使用說明、常見問題與聯絡方式：如何登入、資料安全、如何刪除記錄與帳號。"
      path="/support"
    />
    <JsonLd data={webPageSchema({ path: '/support', name: '支援與聯絡｜reteP' })} />
    <JsonLd data={faqPageSchema(SUPPORT_FAQ)} />

    <h1 className="text-3xl font-bold tracking-tight">支援與聯絡</h1>
    <p className="mt-2 text-sm text-neutral-500">最後更新日期：{LAST_UPDATED_LABEL}</p>
    <p className="mt-4 text-neutral-600">
      感謝你使用 reteP。若你在使用上遇到問題、有功能建議，或需要協助，歡迎透過以下方式與我們聯繫。
    </p>

    <Section title="聯絡我們">
      <p>我們會儘快回覆你的來信。請寄信至：</p>
      <p className="mt-2">
        <a className="font-medium text-[#374254] underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </Section>

    <Section title="常見問題">
      {SUPPORT_FAQ.map(({ q, a }) => (
        <div key={q}>
          <h3 className="mt-4 font-semibold">{q}</h3>
          <p data-speakable>{a}</p>
        </div>
      ))}
      <p className="mt-4 text-sm">
        資料的完整說明見{' '}
        <a className="text-[#374254] underline" href="/privacy">
          隱私權政策
        </a>
        。
      </p>
    </Section>

    <Section title="回報問題">
      <p>
        回報問題時，若能提供你使用的裝置型號、瀏覽器（或 iOS 版本），以及問題發生的步驟與畫面截圖，將有助於我們更快協助你。
      </p>
    </Section>
  </main>
)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-2 space-y-2 leading-relaxed text-neutral-700">{children}</div>
    </section>
  )
}

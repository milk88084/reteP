import { Link } from 'react-router-dom'
import {
  APP_STORE_URL,
  CONTACT_EMAIL,
  DEVELOPER_NAME,
  LAST_UPDATED,
  formatUpdated,
} from '@/constants/site'
import { Seo } from '@/components/seo/Seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { webPageSchema } from '@/lib/schema'

const LAST_UPDATED_LABEL = formatUpdated(LAST_UPDATED['/about'])

export const AboutPage = () => (
  <main
    className="mx-auto min-h-screen max-w-2xl bg-white px-6 py-12 text-[#1c1c1e]"
    data-prerender-ready
  >
    <Seo
      title="關於 reteP"
      description="reteP 是誰做的、如何聯絡，以及你的飲食資料如何被處理與保護。"
      path="/about"
      type="article"
    />
    <JsonLd data={webPageSchema({ path: '/about', name: '關於 reteP' })} />

    <h1 className="text-3xl font-bold tracking-tight">關於 reteP</h1>
    <p className="mt-2 text-sm text-neutral-500">最後更新日期：{LAST_UPDATED_LABEL}</p>
    <p className="mt-4 leading-relaxed text-neutral-700">
      reteP 是一款 iOS 飲食記錄 App，協助你記下每一餐、追蹤熱量與蛋白質、碳水、脂肪，
      並用月曆與年度圖表回顧變化。登入後，同一個網站也提供功能相同的網頁版。
    </p>

    <Section title="開發者">
      <p>
        reteP 由前端工程師 <strong>{DEVELOPER_NAME}</strong> 獨力開發與維護。他對 UI/UX
        有強烈的設計美感，專注在打磨介面質感。
      </p>
    </Section>

    <Section title="聯絡方式">
      <p>使用上的問題、建議或資料相關的請求，歡迎來信：</p>
      <p className="mt-2">
        <a className="font-medium text-[#374254] underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </Section>

    <Section title="你的資料如何被處理">
      <p data-speakable>
        reteP 的前端不直接連資料庫，而是帶著你的登入憑證呼叫後端 API，資料儲存在受存取
        控制保護的雲端資料庫。每一筆查詢都以你的帳號識別碼隔離，只有你本人能存取自己的
        紀錄；傳輸全程以 HTTPS 加密。我們不會將你的資料用於廣告追蹤，也不會販售。
        你可以隨時在「歷史」頁刪除單筆紀錄，或在「設定」頁刪除整個帳號與所有資料。
      </p>
      <p className="mt-2">
        完整說明請見{' '}
        <Link className="text-[#374254] underline" to="/privacy">
          隱私權政策
        </Link>
        。
      </p>
    </Section>

    <Section title="下載">
      <p>
        <a className="font-medium text-[#374254] underline" href={APP_STORE_URL}>
          在 App Store 下載 reteP
        </a>
        （iPhone，免費）。
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

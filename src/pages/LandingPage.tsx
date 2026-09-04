import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, MotionConfig, type Variants } from 'framer-motion'
import { APP_STORE_URL } from '@/constants/site'
import { Seo } from '@/components/seo/Seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { faqPageSchema } from '@/lib/schema'

/* -------------------------------------------------------------------------- */
/*  Config                                                                     */
/* -------------------------------------------------------------------------- */

const SUPPORT_HREF = '/support'
const PRIVACY_HREF = '/privacy'
const WORDMARK: CSSProperties = { fontFamily: "'Bitcount Prop Single', cursive", fontWeight: 300 }

// Evaluated once at module load so the prerendered HTML and the hydrating client
// agree on the value (avoids a hydration mismatch on the footer).
const YEAR = new Date().getFullYear()

// App Store 行銷截圖（1242×2688，已含大標與手機外框）。放到 public/landing/ 後自動顯示。
const SHOTS = [
  '/landing/phone-1.webp',
  '/landing/phone-2.webp',
  '/landing/phone-3.webp',
  '/landing/phone-4.webp',
  '/landing/phone-5.webp',
  '/landing/phone-6.webp',
]
const HERO_SHOT = SHOTS[2]

// Showcase 錯落畫廊的分欄：每欄放哪幾張、整欄往下推多少（製造交錯感）
const GALLERY_LG = [
  { items: [0, 3], mt: 0 },
  { items: [1, 4], mt: 64 },
  { items: [2, 5], mt: 28 },
]
const GALLERY_SM = [
  { items: [0, 2, 4], mt: 0 },
  { items: [1, 3, 5], mt: 36 },
]

interface Feature {
  emoji: string
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  { emoji: '🍽️', title: '記錄每一餐', desc: '食物名稱、份量、熱量與蛋白質、碳水、脂肪、纖維，依早午晚餐與點心分類' },
  { emoji: '🍱', title: '食物庫', desc: '以衛福部食品營養成分資料庫的開放資料為基礎，常吃的品項可存進「我的食物」重複使用' },
  { emoji: '🔁', title: '重複偵測', desc: '輸入吃過的食物，自動帶出上次的數值，不用每次重打' },
  { emoji: '🎯', title: '每日營養推薦', desc: '分析當天攝取，點出最缺的營養素並建議可以補的食物' },
  { emoji: '🧮', title: '目標自動計算', desc: '輸入身高體重與增減重目標，依 BMR／TDEE 算出每日熱量與蛋白質、碳水、脂肪目標' },
  { emoji: '📅', title: '月曆回顧與年度趨勢', desc: '用日曆逐日檢視每餐，月度與年度圖表看熱量與營養的變化' },
]

const HIGHLIGHTS: Feature[] = [
  {
    emoji: '📊',
    title: '今日進度一眼看清',
    desc: '熱量、蛋白質、碳水以圓環顯示達標進度，點一下就看今日營養推薦。',
  },
  {
    emoji: '🍎',
    title: 'Apple、Google 一鍵登入',
    desc: '用 Apple 或 Google 帳號登入，免記密碼，開啟就能用。',
  },
  {
    emoji: '🔐',
    title: '資料私密加密',
    desc: '全程 HTTPS 加密傳輸，資料僅與你的帳號關聯，只有你能存取。',
  },
]

/* -------------------------------------------------------------------------- */
/*  Motion variants — 入場 (whileInView) + 離場 (滾出視窗自動回到 hidden)        */
/* -------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
}

const popIn: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
}

// 讓每個區塊滾入時進場、滾出時退場的共用視窗設定
const inView = { once: false, amount: 0.2 } as const

/* -------------------------------------------------------------------------- */
/*  Gallery shot — 進場由父層 stagger 控制，之後持續輕微漂浮                     */
/* -------------------------------------------------------------------------- */

function GalleryShot({ src, index }: { src: string; index: number }) {
  const tiltLeft = index % 2 === 0
  return (
    <motion.div variants={popIn}>
      <motion.img
        src={src}
        alt={`reteP App 畫面 ${index + 1}`}
        className="w-full rounded-[26px] border border-border shadow-[0_40px_80px_-28px_rgba(0,0,0,0.75)]"
        initial={{ rotate: tiltLeft ? -2.5 : 2.5 }}
        animate={{ y: [0, tiltLeft ? -14 : -10, 0] }}
        transition={{
          duration: 6 + index * 0.5,
          delay: index * 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export const LandingPage = () => (
  <MotionConfig reducedMotion="user">
    <Seo
      title="reteP｜記錄每天的飲食熱量與營養"
      description="記錄每一餐，追蹤熱量與蛋白質、碳水、脂肪、纖維。食物庫以衛福部開放資料為基礎，內建每日營養推薦，用日曆與年度圖表回顧變化。Apple、Google 登入的 iPhone、iPad 飲食日記。"
      path="/"
    />
    <JsonLd data={faqPageSchema(FAQ_ITEMS)} />
    <div className="min-h-screen overflow-x-hidden bg-bg text-ink" data-prerender-ready>
      <NavBar />
      <main>
        <Hero />
        <Showcase />
        <Highlights />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  </MotionConfig>
)

/* --------------------------------- Nav ------------------------------------ */

const NavBar = () => (
  <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
    <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
      <Link to="/" className="flex items-center gap-2">
        <img src="/icons/icon-180.png" alt="reteP" width={30} height={30} className="rounded-lg" />
        <span className="text-lg text-ink" style={WORDMARK}>
          reteP
        </span>
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to={SUPPORT_HREF}
          className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          支援
        </Link>
        <Link
          to={PRIVACY_HREF}
          className="rounded-full px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          隱私政策
        </Link>
        <a
          href={APP_STORE_URL}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-95"
        >
          下載 App
        </a>
      </div>
    </nav>
  </header>
)

/* -------------------------------- Hero ------------------------------------ */

const Hero = () => (
  <section
    className="relative overflow-hidden"
    style={{ background: 'radial-gradient(circle at 50% 18%, #1a0d08 0%, #0D0B09 62%)' }}
  >
    <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-16 text-center sm:px-8 sm:pt-20">
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={fadeUp} className="mb-6 flex justify-center">
          <img
            src="/icons/icon-180.png"
            alt="reteP"
            width={72}
            height={72}
            className="rounded-[18px] shadow-[0_10px_30px_rgba(182,185,254,0.25)]"
          />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mx-auto max-w-3xl text-5xl leading-[1.1] tracking-tight sm:text-6xl"
          style={WORDMARK}
        >
          reteP
        </motion.h1>

        <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
          紀錄你的飲食習慣，
          <br className="hidden sm:block" />
          看清每一口的熱量與營養。
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center gap-3">
          <a
            href={APP_STORE_URL}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-gray-800 shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
          >
            開始使用
          </a>
          <p className="text-sm text-ink-muted">iPhone、iPad 免費下載・Apple、Google 登入</p>
        </motion.div>

        <motion.div variants={popIn} className="mt-14 flex justify-center">
          <img
            src={HERO_SHOT}
            alt="reteP App 畫面"
            className="w-[260px] rounded-[32px] border border-border shadow-[0_40px_80px_-24px_rgba(0,0,0,0.7)] sm:w-[300px]"
          />
        </motion.div>
      </motion.div>
    </div>
  </section>
)

/* ------------------------------ Showcase ---------------------------------- */

const Showcase = () => (
  <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto max-w-2xl text-center"
    >
      <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">為飲食記錄而生</h2>
      <p className="mx-auto mt-4 max-w-lg text-base text-ink-muted sm:text-lg">
        從每一餐的記錄到整年的變化，reteP 內建你需要的每一個環節，不必再切換多個工具。
      </p>
    </motion.div>

    {/* 桌面：三欄錯落畫廊 */}
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mt-16 hidden justify-center gap-6 lg:flex"
    >
      {GALLERY_LG.map((col, ci) => (
        <div key={ci} className="flex w-[248px] flex-col gap-6" style={{ marginTop: col.mt }}>
          {col.items.map((i) => (
            <GalleryShot key={i} src={SHOTS[i]} index={i} />
          ))}
        </div>
      ))}
    </motion.div>

    {/* 手機／平板：兩欄錯落畫廊 */}
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto mt-12 flex max-w-md justify-center gap-4 lg:hidden"
    >
      {GALLERY_SM.map((col, ci) => (
        <div key={ci} className="flex flex-1 flex-col gap-4" style={{ marginTop: col.mt }}>
          {col.items.map((i) => (
            <GalleryShot key={i} src={SHOTS[i]} index={i} />
          ))}
        </div>
      ))}
    </motion.div>

    {/* 功能一覽 */}
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {FEATURES.map((f) => (
        <FeatureCard key={f.title} feature={f} />
      ))}
    </motion.div>
  </section>
)

const FeatureCard = ({ feature }: { feature: Feature }) => (
  <motion.div
    variants={popIn}
    className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-4"
  >
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-2xl">
      {feature.emoji}
    </span>
    <span className="min-w-0">
      <span className="block text-[15px] font-semibold text-ink">{feature.title}</span>
      <span className="block text-[13px] text-ink-muted">{feature.desc}</span>
    </span>
  </motion.div>
)

/* ----------------------------- Highlights --------------------------------- */

const Highlights = () => (
  <section className="bg-surface py-20 sm:py-28">
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight sm:text-4xl"
      >
        安心、直覺，為你而設計
      </motion.h2>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={inView}
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {HIGHLIGHTS.map((h) => (
          <motion.div
            key={h.title}
            variants={popIn}
            className="rounded-3xl border border-border bg-bg p-7"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/12 text-2xl">
              {h.emoji}
            </span>
            <h3 className="mt-5 text-lg font-bold text-ink">{h.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{h.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
)

/* --------------------------------- FAQ ---------------------------------- */

// Self-contained Q&A (each answer 130–170 characters, no reliance on prior text)
// so AI answer engines can quote a single block. Also feeds the FAQPage JSON-LD.
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'reteP 是什麼？',
    a: 'reteP 是一款 iPhone、iPad 飲食記錄 App，登入後也有網頁版。你用它記下每一餐吃了什麼、份量多少，它會統計當天的熱量與蛋白質、碳水化合物、脂肪、纖維，並以圓環顯示距離每日目標的進度。內建食物庫以衛福部食品營養成分資料庫的開放資料為基礎，App 也會依身高體重推算每日目標，並分析當天攝取、建議可以補的食物。',
  },
  {
    q: '怎麼用 reteP 記錄一餐？',
    a: '在首頁選擇早餐、午餐、晚餐或點心，接著從食物庫挑選（資料以衛福部食品營養成分資料庫的開放資料為基礎），或手動輸入食物名稱與份量。選定後 App 會自動帶入熱量與蛋白質、碳水、脂肪、纖維，你也可以微調。記錄過的食物再次輸入時會自動帶出上次的數值，不必每次重打，整天的量會累加並反映在首頁圓環與每日推薦上。',
  },
  {
    q: 'reteP 支援哪些登入方式？',
    a: 'reteP 透過 Clerk 提供 Apple 與 Google 帳號一鍵登入，你不需要另外設定或記住密碼。使用 Apple 或 Google 登入時，reteP 只會收到你的電子郵件、顯示名稱與帳號識別碼，不會取得你的第三方帳號密碼。若你用相同且已驗證的電子郵件從不同管道登入，系統會視為同一個帳號，這是刻意的設計，不是資料外洩。',
  },
  {
    q: '我的飲食資料存在哪裡？',
    a: 'reteP 的前端不直接連資料庫，而是帶著你的登入憑證呼叫後端 API，資料儲存在受存取控制保護的雲端資料庫。每一筆查詢都以你的帳號識別碼隔離，只有你本人能存取自己的紀錄；傳輸全程使用 HTTPS 加密。你的資料不會用於廣告追蹤，也不會被販售。你可以隨時在歷史頁刪除單筆紀錄，或在設定頁刪除整個帳號與所有資料。',
  },
  {
    q: '使用 reteP 需要付費嗎？',
    a: 'reteP 在 App Store 上完全免費下載，支援 iPhone 與 iPad。所有記錄、統計、日曆回顧、月度與年度趨勢、每日營養推薦功能都免費使用，目前沒有訂閱制，也沒有任何內購項目。登入後的網頁版同樣免費，與 App 共用同一組帳號與資料。若未來有付費項目的調整，會在這裡與 App Store 頁面更新說明。',
  },
]

const Faq = () => (
  <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
    <motion.h2
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
    >
      關於 reteP，常見的問題
    </motion.h2>

    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="mt-12 space-y-8"
    >
      {FAQ_ITEMS.map((item) => (
        <motion.div key={item.q} variants={fadeUp}>
          <h3 className="text-lg font-bold text-ink">{item.q}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted" data-speakable>
            {item.a}
          </p>
        </motion.div>
      ))}
    </motion.div>
  </section>
)

/* ------------------------------ CTA band ---------------------------------- */

const CtaBand = () => (
  <section className="px-5 py-20 sm:px-8 sm:py-24">
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-border px-8 py-16 text-center sm:py-20"
      style={{ background: 'linear-gradient(150deg, #211c17 0%, #0D0B09 100%)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #B6B9FE 0%, transparent 70%)' }}
      />
      <h2 className="relative text-3xl font-bold tracking-tight text-ink sm:text-5xl">今天吃了什麼？</h2>
      <p className="relative mx-auto mt-4 max-w-md text-base text-ink-muted sm:text-lg">
        免費下載 reteP，馬上開始記錄你的第一餐。
      </p>
      <a
        href={APP_STORE_URL}
        className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-gray-800 transition-transform hover:scale-[1.03] active:scale-95"
      >
        立即下載
      </a>
    </motion.div>
  </section>
)

/* ------------------------------- Footer ----------------------------------- */

const Footer = () => (
  <footer className="border-t border-border bg-bg">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
      <div className="flex items-center gap-2">
        <img src="/icons/icon-180.png" alt="reteP" width={22} height={22} className="rounded-md" />
        <span className="text-sm font-semibold" style={WORDMARK}>
          reteP
        </span>
        <span className="text-sm text-ink-muted">紀錄你的飲食習慣</span>
      </div>
      <div className="flex items-center gap-5 text-sm text-ink-muted">
        <Link to="/about" className="transition-colors hover:text-ink">
          關於
        </Link>
        <Link to={SUPPORT_HREF} className="transition-colors hover:text-ink">
          支援
        </Link>
        <Link to={PRIVACY_HREF} className="transition-colors hover:text-ink">
          隱私政策
        </Link>
        <span className="text-ink-muted/60">© {YEAR} reteP</span>
      </div>
    </div>
  </footer>
)

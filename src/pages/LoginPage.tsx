import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTDEE } from '@/utils/nutritionCalc'
import { GenderType, GoalType } from '@/types'
import { cn } from '@/utils/cn'
import MascotLogo from '@/assets/mascot/mascot-logo.svg'

type Tab = 'login' | 'register'
type Step = 1 | 2

const GOAL_LABELS: Record<GoalType, string> = {
  lose: '減重',
  maintain: '維持',
  gain: '增重',
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
)

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
}) => (
  <div>
    <label className="text-xs font-medium text-ink-muted mb-1 block">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-bg rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-muted/40 outline-none focus:ring-2 focus:ring-brand"
    />
  </div>
)

const Divider = () => (
  <div className="relative flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-border" />
    <span className="text-xs text-ink-muted">或</span>
    <div className="flex-1 h-px bg-border" />
  </div>
)

export const LoginPage = () => {
  const navigate = useNavigate()
  const { updateSettings } = useSettingsStore()

  const [tab, setTab] = useState<Tab>('login')
  const [step, setStep] = useState<Step>(1)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [gender, setGender] = useState<GenderType>('male')
  const [age, setAge] = useState(25)
  const [height, setHeight] = useState(170)
  const [weight, setWeight] = useState(65)
  const [goal, setGoal] = useState<GoalType>('maintain')

  const preview = calcTDEE(height, weight, age, gender, goal)

  const switchTab = (t: Tab) => {
    setTab(t)
    setStep(1)
  }

  const handleLogin = () => navigate('/')

  const handleRegisterComplete = () => {
    const goals = calcTDEE(height, weight, age, gender, goal)
    updateSettings({ height, weight, age, gender, goal, ...goals })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-start p-6 pt-14 overflow-y-auto">
      <div className="mb-7 flex flex-col items-center">
        <img src={MascotLogo} alt="Logo" className="w-24 h-24 rounded-3xl shadow-lg mb-4" />
        <h1 className="text-3xl font-bold text-ink tracking-tight">飲食記錄</h1>
        <p className="text-ink/60 text-sm mt-1 font-medium">拍一張，記下來</p>
      </div>

      <div className="w-full max-w-sm bg-surface rounded-3xl p-6 shadow-sm">
        {/* Tab bar — only show on step 1 */}
        {step === 1 && (
          <div className="flex gap-1 bg-bg rounded-2xl p-1 mb-5">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-xl transition-all',
                  tab === t ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted',
                )}
              >
                {t === 'login' ? '登入' : '註冊'}
              </button>
            ))}
          </div>
        )}

        {/* Step 2 header */}
        {tab === 'register' && step === 2 && (
          <div className="mb-5">
            <button
              onClick={() => setStep(1)}
              className="text-xs text-ink-muted flex items-center gap-1 mb-3 hover:text-ink transition-colors"
            >
              ← 返回
            </button>
            <h2 className="text-lg font-bold text-ink">設定您的目標</h2>
            <p className="text-xs text-ink-muted mt-0.5">幫助我們計算最適合您的每日熱量</p>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <div className="space-y-3">
            <InputField label="電子郵件" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <InputField label="密碼" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
            <Button variant="primary" className="w-full mt-1" onClick={handleLogin}>
              登入
            </Button>
            <Divider />
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border rounded-full text-sm font-semibold text-ink hover:bg-bg transition-all"
            >
              <GoogleIcon />
              使用 Google 登入
            </button>
          </div>
        )}

        {/* REGISTER STEP 1 */}
        {tab === 'register' && step === 1 && (
          <div className="space-y-3">
            <InputField label="電子郵件" type="email" placeholder="you@example.com" value={email} onChange={setEmail} />
            <InputField label="密碼" type="password" placeholder="••••••••" value={password} onChange={setPassword} />
            <InputField label="確認密碼" type="password" placeholder="••••••••" value={confirmPassword} onChange={setConfirmPassword} />
            <Button variant="primary" className="w-full mt-1" onClick={() => setStep(2)}>
              下一步
            </Button>
            <Divider />
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-border rounded-full text-sm font-semibold text-ink hover:bg-bg transition-all"
            >
              <GoogleIcon />
              使用 Google 註冊
            </button>
          </div>
        )}

        {/* REGISTER STEP 2 — Body Profile */}
        {tab === 'register' && step === 2 && (
          <div className="space-y-4">
            {/* Gender */}
            <div>
              <p className="text-xs font-medium text-ink-muted mb-2">性別</p>
              <div className="flex gap-2">
                {(['male', 'female'] as GenderType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                      gender === g ? 'bg-accent text-white border-accent' : 'bg-bg text-ink-muted border-border',
                    )}
                  >
                    {g === 'male' ? '男' : '女'}
                  </button>
                ))}
              </div>
            </div>

            {/* Age / Height / Weight */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '年齡', unit: '歲', value: age, set: setAge, min: 10, max: 100 },
                { label: '身高', unit: 'cm', value: height, set: setHeight, min: 100, max: 250 },
                { label: '體重', unit: 'kg', value: weight, set: setWeight, min: 30, max: 300 },
              ].map(({ label, unit, value, set, min, max }) => (
                <div key={label} className="bg-bg rounded-xl p-3 flex flex-col">
                  <p className="text-[10px] text-ink-muted mb-1">{label}</p>
                  <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full text-xl font-bold text-ink bg-transparent outline-none leading-none mb-1"
                  />
                  <p className="text-[10px] text-ink-muted">{unit}</p>
                </div>
              ))}
            </div>

            {/* Goal */}
            <div>
              <p className="text-xs font-medium text-ink-muted mb-2">目標</p>
              <div className="flex gap-2">
                {(['lose', 'maintain', 'gain'] as GoalType[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all',
                      goal === g ? 'bg-accent text-white border-accent' : 'bg-bg text-ink-muted border-border',
                    )}
                  >
                    {GOAL_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-brand/40 rounded-2xl p-4">
              <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-1.5">估算每日目標</p>
              <p className="text-2xl font-bold text-ink">
                {preview.calorie_goal}
                <span className="text-sm font-normal text-ink-muted ml-1">kcal</span>
              </p>
              <div className="flex gap-4 mt-1.5">
                <span className="text-xs text-ink-muted">蛋白質 <strong className="text-ink">{preview.protein_goal}g</strong></span>
                <span className="text-xs text-ink-muted">碳水 <strong className="text-ink">{preview.carbs_goal}g</strong></span>
                <span className="text-xs text-ink-muted">脂肪 <strong className="text-ink">{preview.fat_goal}g</strong></span>
              </div>
            </div>

            <Button variant="primary" className="w-full" onClick={handleRegisterComplete}>
              完成設定
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

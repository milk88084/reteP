import { useSignIn } from '@clerk/clerk-react'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

export const LoginPage = () => {
  const { isLoaded, signIn } = useSignIn()

  const handleGoogle = async () => {
    if (!signIn) return
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: '/',
    })
  }

  return (
    <div className="min-h-screen bg-brand flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center mb-12">
        <img src="/icons/icon-180.png" alt="Logo" className="w-24 h-24 rounded-3xl shadow-lg mb-5" />
        <h1 className="text-3xl font-bold text-ink tracking-tight">飲食記錄</h1>
        <p className="text-ink/60 text-sm mt-1.5 font-medium">拍一張，記下來</p>
      </div>

      <div className="w-full max-w-sm">
        <button
          onClick={handleGoogle}
          disabled={!isLoaded}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white rounded-full text-sm font-semibold text-ink shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
        >
          <GoogleIcon />
          使用 Google 登入
        </button>
      </div>
    </div>
  )
}

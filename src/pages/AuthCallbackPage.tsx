import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { Seo } from '@/components/seo/Seo'

export const AuthCallbackPage = () => (
  <>
    <Seo title="登入中…｜reteP" description="正在完成登入。" path="/sso-callback" noindex />
    <AuthenticateWithRedirectCallback signInForceRedirectUrl="/" signUpForceRedirectUrl="/" />
  </>
)

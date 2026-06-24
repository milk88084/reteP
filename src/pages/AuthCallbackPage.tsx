import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

export const AuthCallbackPage = () => (
  <AuthenticateWithRedirectCallback
    signInForceRedirectUrl="/"
    signUpForceRedirectUrl="/"
  />
)

import { useUser, useClerk } from '@clerk/clerk-react'
import { AuthUser } from '@/types'

export const useAuth = () => {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        name: user.fullName ?? user.username ?? '使用者',
        email: user.primaryEmailAddress?.emailAddress,
        avatarUrl: user.imageUrl ?? undefined,
      }
    : null

  return {
    isLoaded,
    isSignedIn: !!isSignedIn,
    user: authUser,
    signOut: () => signOut({ redirectUrl: '/login' }),
  }
}

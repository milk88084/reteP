import { AuthUser } from '@/types'

const MOCK_USER: AuthUser = {
  id: 'mock-user-1',
  name: '測試用戶',
  email: 'test@example.com',
  avatarUrl: undefined,
}

export const useAuth = () => {
  return {
    user: MOCK_USER,
    isLoaded: true,
    isSignedIn: true,
    signOut: () => {},
  }
}

import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { SupabaseAuthSync } from '@/components/SupabaseAuthSync'

export const App = () => (
  <>
    <SupabaseAuthSync />
    <RouterProvider router={router} />
  </>
)

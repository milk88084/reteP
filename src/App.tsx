import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ApiAuthSync } from '@/components/ApiAuthSync'

export const App = () => (
  <>
    <ApiAuthSync />
    <RouterProvider router={router} />
  </>
)

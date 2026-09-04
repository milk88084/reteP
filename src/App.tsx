import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ApiAuthSync } from '@/components/ApiAuthSync'
import { usePageViews } from '@/hooks/usePageViews'

export const App = () => {
  usePageViews()

  return (
    <>
      <ApiAuthSync />
      <RouterProvider router={router} />
    </>
  )
}

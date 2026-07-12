import { RouterProvider } from 'react-router-dom'

import { ToastViewport } from '../components/ui/ToastViewport'
import { AuthProvider } from '../services/auth/AuthContext'
import { router } from './router'

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastViewport />
    </AuthProvider>
  )
}

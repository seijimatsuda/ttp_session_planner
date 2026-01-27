import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { QueryProvider } from './providers/QueryProvider'
import { SkeletonProvider } from './components/ui'
import { Toaster, AppErrorBoundary } from './components/feedback'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <SkeletonProvider>
        <QueryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </SkeletonProvider>
    </AppErrorBoundary>
  </StrictMode>,
)

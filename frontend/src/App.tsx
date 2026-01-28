import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LoadingPage } from './components/layout/LoadingPage'

// Lazy-loaded page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AddDrillPage = lazy(() => import('./pages/AddDrillPage').then(m => ({ default: m.AddDrillPage })))
const DrillLibraryPage = lazy(() => import('./pages/DrillLibraryPage').then(m => ({ default: m.DrillLibraryPage })))
const DrillDetailPage = lazy(() => import('./pages/DrillDetailPage').then(m => ({ default: m.DrillDetailPage })))
const EditDrillPage = lazy(() => import('./pages/EditDrillPage').then(m => ({ default: m.EditDrillPage })))
const SessionPlannerPage = lazy(() => import('./pages/SessionPlannerPage').then(m => ({ default: m.SessionPlannerPage })))
const SessionsPage = lazy(() => import('./pages/SessionsPage').then(m => ({ default: m.SessionsPage })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingPage />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Drill routes - ordered from most specific to least specific */}
          <Route path="/drills/new" element={<AddDrillPage />} />
          <Route path="/drills/:id/edit" element={<EditDrillPage />} />
          <Route path="/drills/:id" element={<DrillDetailPage />} />
          <Route path="/drills" element={<DrillLibraryPage />} />

          {/* Session routes - most specific first */}
          <Route path="/sessions/:id/edit" element={<SessionPlannerPage />} />
          <Route path="/sessions/new" element={<SessionPlannerPage />} />
          <Route path="/sessions" element={<SessionsPage />} />

          {/* Add more protected routes here as features are built */}
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

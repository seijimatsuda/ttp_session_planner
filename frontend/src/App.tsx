import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import { AddDrillPage } from './pages/AddDrillPage'
import { DrillLibraryPage } from './pages/DrillLibraryPage'
import { DrillDetailPage } from './pages/DrillDetailPage'
import { EditDrillPage } from './pages/EditDrillPage'

function App() {
  return (
    <BrowserRouter>
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

          {/* Add more protected routes here as features are built */}
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

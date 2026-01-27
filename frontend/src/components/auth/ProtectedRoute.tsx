import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute() {
  const { session, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  // This prevents flash of unauthenticated content (FOUC)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Redirect to login if not authenticated, preserving intended destination
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Render child routes
  return <Outlet />
}

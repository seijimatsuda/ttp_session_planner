import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogoutButton } from '../components/auth/LogoutButton'
import { AppShell, Container } from '../components/layout'
import { QuickActions, RecentDrills, RecentSessions } from '@/components/dashboard'

/**
 * Sidebar navigation for the app shell
 */
function DashboardSidebar() {
  return (
    <nav className="space-y-2">
      <Link
        to="/"
        className="flex items-center min-h-11 px-3 rounded-lg bg-blue-50 text-blue-700 font-medium"
      >
        Dashboard
      </Link>
      <Link
        to="/drills"
        className="flex items-center min-h-11 px-3 rounded-lg hover:bg-gray-100 text-gray-700"
      >
        Drills
      </Link>
      <Link
        to="/sessions"
        className="flex items-center min-h-11 px-3 rounded-lg hover:bg-gray-100 text-gray-700"
      >
        Sessions
      </Link>
    </nav>
  )
}

/**
 * Header content with user info and logout
 */
function DashboardHeader() {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-between w-full">
      <span className="font-semibold text-gray-900">Soccer Session Planner</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:inline">
          {user?.email}
        </span>
        <LogoutButton />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <AppShell
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
      <Container size="lg">
        <div className="space-y-8">
          {/* Welcome section */}
          <section>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-1 text-gray-600">
              Here's what's happening with your training sessions.
            </p>
          </section>

          {/* Quick actions section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <QuickActions />
          </section>

          {/* Recent drills section with "View all" link */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Drills</h2>
              <Link to="/drills" className="text-sm text-blue-600 hover:text-blue-800 min-h-11 flex items-center">
                View all
              </Link>
            </div>
            <RecentDrills userId={user?.id ?? ''} />
          </section>

          {/* Recent sessions section with "View all" link */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Sessions</h2>
              <Link to="/sessions" className="text-sm text-blue-600 hover:text-blue-800 min-h-11 flex items-center">
                View all
              </Link>
            </div>
            <RecentSessions userId={user?.id ?? ''} />
          </section>
        </div>
      </Container>
    </AppShell>
  )
}

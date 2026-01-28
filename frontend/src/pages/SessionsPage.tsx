import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Container } from '@/components/layout/Container'
import { SessionList } from '@/components/sessions/SessionList'
import { Button } from '@/components/ui'

/**
 * SessionsPage - Display all user sessions with management actions
 *
 * Features:
 * - Page header with "New Session" action button
 * - SessionList component for viewing/deleting sessions
 * - Consistent layout via AppShell and Container
 * - Navigates to /sessions/new for creating new sessions
 */
export function SessionsPage() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
          <Button onClick={() => navigate('/sessions/new')}>New Session</Button>
        </div>
        <SessionList />
      </Container>
    </AppShell>
  )
}

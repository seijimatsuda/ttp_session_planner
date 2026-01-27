import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { LogoutButton } from '../components/auth/LogoutButton'
import { MediaUpload } from '../components/MediaUpload'
import { Button, Input, Skeleton } from '../components/ui'
import { AppShell, Container } from '../components/layout'

/**
 * Sidebar navigation for the app shell
 */
function DashboardSidebar() {
  return (
    <nav className="space-y-2">
      <a
        href="#"
        className="flex items-center min-h-11 px-3 rounded-lg bg-blue-50 text-blue-700 font-medium"
      >
        Dashboard
      </a>
      <a
        href="#"
        className="flex items-center min-h-11 px-3 rounded-lg hover:bg-gray-100 text-gray-700"
      >
        Drills
      </a>
      <a
        href="#"
        className="flex items-center min-h-11 px-3 rounded-lg hover:bg-gray-100 text-gray-700"
      >
        Sessions
      </a>
      <a
        href="#"
        className="flex items-center min-h-11 px-3 rounded-lg hover:bg-gray-100 text-gray-700"
      >
        Settings
      </a>
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
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  // Demo form validation
  const validateInput = () => {
    if (inputValue.length > 0 && inputValue.length < 3) {
      setInputError('Name must be at least 3 characters')
      return false
    }
    setInputError(undefined)
    return true
  }

  // Demo async action with toast
  const handleSave = async () => {
    if (!inputValue) {
      setInputError('Please enter a drill name')
      return
    }
    if (!validateInput()) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success(`Saved: ${inputValue}`)
      setInputValue('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell
      sidebar={<DashboardSidebar />}
      header={<DashboardHeader />}
    >
      <Container size="lg">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Logged in as <strong>{user?.email}</strong>
            </p>
          </div>

          {/* Button Variants */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">Button Variants</h2>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* Toast Demo */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">Toast Notifications</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => toast.success('Success! Your action completed.')}
              >
                Success Toast
              </Button>
              <Button
                variant="danger"
                onClick={() => toast.error('Something went wrong. Please try again.')}
              >
                Error Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => toast('Info message', { description: 'Additional details here' })}
              >
                Info Toast
              </Button>
            </div>
          </div>

          {/* Input Demo */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">Form Input</h2>
            <div className="max-w-md space-y-4">
              <Input
                label="Drill Name"
                placeholder="Enter drill name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={validateInput}
                error={inputError}
                hint="Must be at least 3 characters"
              />
              <Button onClick={handleSave} loading={isLoading}>
                Save Drill
              </Button>
            </div>
          </div>

          {/* Skeleton Demo */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">Skeleton Loading</h2>
            <div className="flex gap-4">
              <Skeleton width={96} height={96} />
              <div className="flex-1 space-y-2">
                <Skeleton width="60%" height={24} />
                <Skeleton count={2} />
              </div>
            </div>
          </div>

          {/* Touch Target Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">Touch Targets</h2>
            <p className="text-blue-700 text-sm">
              All interactive elements (buttons, inputs, nav links) have a minimum 44px touch target
              for iOS/iPad accessibility compliance. Test by resizing to mobile viewport.
            </p>
          </div>

          {/* Media Upload Test */}
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <h2 className="font-semibold text-gray-900 mb-4">
              Test Media Upload
            </h2>
            <MediaUpload
              onUploadComplete={(filePath, mediaType) => {
                console.log('Upload complete:', { filePath, mediaType })
                toast.success(`Uploaded ${mediaType}: ${filePath}`)
              }}
              onDelete={() => {
                console.log('File deleted')
                toast('File deleted')
              }}
            />
          </div>
        </div>
      </Container>
    </AppShell>
  )
}

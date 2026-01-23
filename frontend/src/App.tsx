import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession()
        if (error) throw error
        setConnectionStatus('connected')
      } catch (err) {
        console.error('Supabase connection error:', err)
        setConnectionStatus('error')
      }
    }
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Soccer Session Planner
        </h1>
        <p className="text-gray-600 mb-4">
          Frontend setup complete. Ready for development.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Supabase:</span>
          {connectionStatus === 'checking' && (
            <span className="text-yellow-600">Checking...</span>
          )}
          {connectionStatus === 'connected' && (
            <span className="text-green-600 font-medium">Connected</span>
          )}
          {connectionStatus === 'error' && (
            <span className="text-red-600 font-medium">Error</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

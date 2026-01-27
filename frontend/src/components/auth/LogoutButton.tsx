import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function LogoutButton() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
    >
      Log out
    </button>
  )
}

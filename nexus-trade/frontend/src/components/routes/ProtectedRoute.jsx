import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, hydrated } = useAuthStore()

  if (!hydrated) {
    return null
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute

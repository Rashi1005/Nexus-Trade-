import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, hydrated } = useAuthStore()

  if (!hydrated) {
    return null
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default PublicRoute

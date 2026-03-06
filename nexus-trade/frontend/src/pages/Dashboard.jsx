import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {user && <p>Welcome, {user.full_name}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard

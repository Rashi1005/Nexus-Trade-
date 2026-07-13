import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Trading from './pages/Trading'
import Portfolio from './pages/Portfolio'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#00FF88',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF0064',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trading" 
          element={
            <ProtectedRoute>
              <Trading />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/portfolio" 
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
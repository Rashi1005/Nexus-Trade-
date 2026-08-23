import api from './api'

export const authService = {
  // Sign up new user
  signup: async (email, password, fullName) => {
    const response = await api.post('/auth/signup', {
      email,
      password,
      full_name: fullName,
    })
    
    if (response.data.success) {
      const { access_token, token, user } = response.data.data
      const authToken = access_token || token
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(user))
      return { success: true, user, token: authToken }
    }
    
    return { success: false, message: response.data.message }
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    
    if (response.data.success) {
      const { access_token, token, user } = response.data.data
      const authToken = access_token || token
      localStorage.setItem('token', authToken)
      localStorage.setItem('user', JSON.stringify(user))
      return { success: true, user, token: authToken }
    }
    
    return { success: false, message: response.data.message }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('auth-storage')
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.data.success) {
        const user = response.data.data.user
        localStorage.setItem('user', JSON.stringify(user))
        return { success: true, user }
      }
    } catch (error) {
      return { success: false, error }
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Get stored user
  getStoredUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        if (token && user) {
          set({
            token,
            user: JSON.parse(user),
            isAuthenticated: true,
          })
        }
      },

      // Set authentication
      setAuth: (userData, authToken) => {
        localStorage.setItem('token', authToken)
        localStorage.setItem('user', JSON.stringify(userData))
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
        })
      },

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          
          if (response.data.success) {
            const { user, access_token } = response.data.data
            get().setAuth(user, access_token)
            set({ loading: false })
            return { success: true }
          } else {
            set({ error: response.data.message, loading: false })
            return { success: false, message: response.data.message }
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
          set({ error: message, loading: false })
          return { success: false, message }
        }
      },

      // Signup
      signup: async (email, password, fullName) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
          })
          
          if (response.data.success) {
            const { user, access_token } = response.data.data
            get().setAuth(user, access_token)
            set({ loading: false })
            return { success: true }
          } else {
            set({ error: response.data.message, loading: false })
            return { success: false, message: response.data.message }
          }
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed. Please try again.'
          set({ error: message, loading: false })
          return { success: false, message }
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      // Refresh user data
      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me')
          if (response.data.success) {
            const updatedUser = response.data.data
            localStorage.setItem('user', JSON.stringify(updatedUser))
            set({ user: updatedUser })
          }
        } catch (error) {
          console.error('Failed to refresh user:', error)
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Initialize on load
useAuthStore.getState().initialize()
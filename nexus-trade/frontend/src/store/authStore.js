import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hydrated: false,
      loading: false,
      error: null,

      initialize: () => {
        const token = localStorage.getItem(TOKEN_KEY)
        const user = localStorage.getItem(USER_KEY)

        if (!token || !user) {
          set({ hydrated: true })
          return
        }

        try {
          set({
            token,
            user: JSON.parse(user),
            isAuthenticated: true,
            hydrated: true,
          })
        } catch {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            hydrated: true,
          })
        }
      },

      setAuth: (userData, authToken) => {
        localStorage.setItem(TOKEN_KEY, authToken)
        localStorage.setItem(USER_KEY, JSON.stringify(userData))
        set({
          user: userData,
          token: authToken,
          isAuthenticated: true,
          error: null,
        })
      },

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })

          if (response.data.success) {
            const { user, access_token, token } = response.data.data
            get().setAuth(user, access_token || token)
            set({ loading: false })
            return { success: true }
          }

          set({ error: response.data.message, loading: false })
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
          set({ error: message, loading: false })
          return { success: false, message }
        }
      },

      signup: async (email, password, fullName) => {
        set({ loading: true, error: null })
        try {
          const response = await api.post('/auth/signup', {
            email,
            password,
            full_name: fullName,
          })

          if (response.data.success) {
            const { user, access_token, token } = response.data.data
            get().setAuth(user, access_token || token)
            set({ loading: false })
            return { success: true }
          }

          set({ error: response.data.message, loading: false })
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || 'Signup failed. Please try again.'
          set({ error: message, loading: false })
          return { success: false, message }
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem('auth-storage')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshUser: async () => {
        try {
          const response = await api.get('/auth/me')
          if (response.data.success) {
            const updatedUser = response.data.data.user
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
            set({ user: updatedUser })
          }
        } catch (error) {
          console.error('Failed to refresh user:', error)
        }
      },

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

useAuthStore.getState().initialize()

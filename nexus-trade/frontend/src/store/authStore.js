import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password })
        // Flask returns: response.data = { success, message, data: { user, access_token, refresh_token } }
        const { user, access_token, refresh_token } = response.data.data

        localStorage.setItem('refresh_token', refresh_token)

        set({ user, token: access_token, isAuthenticated: true })
        return response.data
      },

      signup: async (email, password, full_name) => {
        const response = await api.post('/api/auth/signup', { email, password, full_name })
        // Flask returns: response.data = { success, message, data: { user, access_token, refresh_token } }
        const { user, access_token, refresh_token } = response.data.data

        localStorage.setItem('refresh_token', refresh_token)

        set({ user, token: access_token, isAuthenticated: true })
        return response.data
      },

      logout: () => {
        localStorage.removeItem('refresh_token')
        set({ user: null, token: null, isAuthenticated: false })
      },
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

export default useAuthStore

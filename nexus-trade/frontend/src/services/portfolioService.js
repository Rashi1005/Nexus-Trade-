import api from './api'

export const portfolioService = {
  // Get portfolio
  getPortfolio: async () => {
    try {
      const response = await api.get('/portfolio/')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get portfolio history
  getHistory: async (period = '1M') => {
    try {
      const response = await api.get('/portfolio/history', {
        params: { period }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get performance metrics
  getPerformance: async () => {
    try {
      const response = await api.get('/portfolio/performance')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get diversity score
  getDiversity: async () => {
    try {
      const response = await api.get('/portfolio/diversity')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}
import api from './api'

export const marketService = {
  // Get stock quote
  getQuote: async (symbol) => {
    try {
      const response = await api.get(`/market/quote/${symbol}`)
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get historical data
  getHistorical: async (symbol, period = '1mo', interval = '1d') => {
    try {
      const response = await api.get(`/market/historical/${symbol}`, {
        params: { period, interval }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await api.get('/market/search', {
        params: { q: query }
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get market indices
  getIndices: async () => {
    try {
      const response = await api.get('/market/indices')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get popular stocks
  getPopularStocks: async () => {
    try {
      const response = await api.get('/market/popular')
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get multiple quotes
  getMultipleQuotes: async (symbols) => {
    try {
      const response = await api.post('/market/multiple', { symbols })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}
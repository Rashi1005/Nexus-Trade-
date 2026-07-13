import api from './api'

export const tradingService = {
  // Buy stock
  buyStock: async (symbol, quantity) => {
    try {
      const response = await api.post('/trading/buy', { symbol, quantity })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Sell stock
  sellStock: async (symbol, quantity) => {
    try {
      const response = await api.post('/trading/sell', { symbol, quantity })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Quote and validate
  quoteAndValidate: async (symbol, quantity, side) => {
    try {
      const response = await api.post('/trading/quote-and-validate', {
        symbol,
        quantity,
        side
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get orders
  getOrders: async (limit = 50, status = null) => {
    try {
      const params = { limit }
      if (status) params.status = status
      
      const response = await api.get('/trading/orders', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },

  // Get transactions
  getTransactions: async (limit = 50, symbol = null) => {
    try {
      const params = { limit }
      if (symbol) params.symbol = symbol
      
      const response = await api.get('/trading/transactions', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error
    }
  },
}
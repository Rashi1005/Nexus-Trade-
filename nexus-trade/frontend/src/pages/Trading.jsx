import React, { useState } from 'react'
import { Search } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import { tradingService } from '../services/tradingService'
import { marketService } from '../services/marketService'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

const Trading = () => {
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [side, setSide] = useState('buy')
  const [quote, setQuote] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleSearch = async () => {
    if (!symbol.trim()) {
      toast.error('Please enter a stock symbol')
      return
    }
    
    try {
      setLoading(true)
      const response = await marketService.getQuote(symbol.toUpperCase())
      if (response.success) {
        setQuote(response.data)
        toast.success(`Found ${response.data.name}`)
      }
    } catch (error) {
      toast.error('Stock not found')
      setQuote(null)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePreview = async () => {
    if (!quote || !quantity) {
      toast.error('Please enter quantity')
      return
    }
    
    try {
      setLoading(true)
      const response = await tradingService.quoteAndValidate(
        quote.symbol,
        parseInt(quantity),
        side
      )
      if (response.success) {
        setPreview(response.data)
      }
    } catch (error) {
      toast.error(error.message || 'Preview failed')
    } finally {
      setLoading(false)
    }
  }
  
  const handleExecute = async () => {
    if (!preview) return
    
    try {
      setLoading(true)
      const response = side === 'buy'
        ? await tradingService.buyStock(quote.symbol, parseInt(quantity))
        : await tradingService.sellStock(quote.symbol, parseInt(quantity))
      
      if (response.success) {
        toast.success(response.message)
        setSymbol('')
        setQuantity('')
        setQuote(null)
        setPreview(null)
      }
    } catch (error) {
      toast.error(error.message || 'Trade failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen p-6">
      <Navbar />
      
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white mb-6">Trading</h1>
        
        <div className="grid gap-6">
          {/* Search */}
          <Card title="Search Stock">
            <div className="flex gap-2">
              <Input
                placeholder="Enter symbol (e.g., AAPL)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button onClick={handleSearch} loading={loading}>
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </Card>
          
          {/* Quote */}
          {quote && (
            <Card title={`${quote.name} (${quote.symbol})`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(quote.current_price)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Change</p>
                  <p className={`text-xl font-bold ${
                    quote.change >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {quote.change >= 0 ? '+' : ''}{quote.change_percent?.toFixed(2)}%
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Order Form */}
          {quote && (
            <Card title="Place Order">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={side === 'buy' ? 'success' : 'secondary'}
                    onClick={() => setSide('buy')}
                    fullWidth
                  >
                    Buy
                  </Button>
                  <Button
                    variant={side === 'sell' ? 'danger' : 'secondary'}
                    onClick={() => setSide('sell')}
                    fullWidth
                  >
                    Sell
                  </Button>
                </div>
                
                <Input
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Number of shares"
                />
                
                <Button onClick={handlePreview} fullWidth loading={loading}>
                  Preview Order
                </Button>
              </div>
            </Card>
          )}
          
          {/* Preview */}
          {preview && (
            <Card title="Order Preview" className="bg-primary/5">
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock</span>
                  <span className="text-white font-bold">{preview.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white">{formatCurrency(preview.current_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity</span>
                  <span className="text-white">{preview.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Commission</span>
                  <span className="text-white">{formatCurrency(preview.commission)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-2">
                  <span className="text-gray-300">Total</span>
                  <span className="text-white">
                    {formatCurrency(preview.total_cost || preview.total_proceeds)}
                  </span>
                </div>
                {preview.estimated_profit_loss !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Profit/Loss</span>
                    <span className={preview.estimated_profit_loss >= 0 ? 'text-success' : 'text-danger'}>
                      {formatCurrency(preview.estimated_profit_loss)}
                    </span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleExecute}
                fullWidth
                variant={side === 'buy' ? 'success' : 'danger'}
                loading={loading}
                disabled={!preview.can_afford && side === 'buy' || !preview.can_sell && side === 'sell'}
              >
                {side === 'buy' ? 'Execute Buy' : 'Execute Sell'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trading
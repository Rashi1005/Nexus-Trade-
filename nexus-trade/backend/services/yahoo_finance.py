"""
Yahoo Finance Service - Mock Data Fallback
Provides mock data when Alpha Vantage fails
No external dependencies - pure Python mock data
"""
import logging
import random
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class YahooFinanceService:
    def __init__(self):
        pass
    
    def _get_mock_data(self, symbol):
        """Return realistic mock data"""
        base_prices = {
            'AAPL': 185.00,
            'GOOGL': 142.00,
            'MSFT': 415.00,
            'TSLA': 248.00,
            'AMZN': 178.00,
            'META': 485.00,
            'NVDA': 520.00,
            'NFLX': 612.00,
            'GOOG': 142.50,
            'AMZN': 178.00,
        }
        
        base_price = base_prices.get(symbol.upper(), 100.00)
        change_percent = random.uniform(-3, 3)
        change = base_price * (change_percent / 100)
        
        return {
            'symbol': symbol,
            'name': f'{symbol} Inc.',
            'current_price': round(base_price + change, 2),
            'previous_close': base_price,
            'change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'open': round(base_price * 0.99, 2),
            'day_high': round(base_price * 1.02, 2),
            'day_low': round(base_price * 0.98, 2),
            'volume': random.randint(10000000, 100000000),
            'market_cap': random.randint(1000000000, 3000000000000),
            'pe_ratio': round(random.uniform(15, 35), 2),
            'sector': 'Technology',
            'industry': 'Software'
        }
    
    def get_stock_info(self, symbol):
        """Get stock info - returns mock data"""
        logger.warning(f"Using mock data for {symbol} (Yahoo Finance fallback)")
        return self._get_mock_data(symbol)
    
    def get_historical_data(self, symbol, period='1mo', interval='1d'):
        """Get historical data - returns mock data"""
        logger.warning(f"Using mock historical data for {symbol}")
        
        # Generate mock historical data
        data = []
        base_price = 100.00
        
        # Generate 30 days of data
        for i in range(30):
            date = datetime.now() - timedelta(days=30-i)
            # Random walk
            change = random.uniform(-0.03, 0.03)
            base_price = base_price * (1 + change)
            
            day_open = base_price * random.uniform(0.99, 1.01)
            day_high = base_price * random.uniform(1.00, 1.03)
            day_low = base_price * random.uniform(0.97, 1.00)
            day_close = base_price
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(day_open, 2),
                'high': round(day_high, 2),
                'low': round(day_low, 2),
                'close': round(day_close, 2),
                'volume': random.randint(10000000, 100000000)
            })
        
        return data
    
    def get_market_indices(self):
        """Get market indices - returns mock data"""
        logger.warning("Using mock market indices data")
        
        return {
            '^GSPC': {
                'name': 'S&P 500',
                'value': 4800.00 + random.uniform(-50, 50),
                'change': random.uniform(-30, 30),
                'change_percent': random.uniform(-0.8, 0.8)
            },
            '^DJI': {
                'name': 'Dow Jones',
                'value': 37500.00 + random.uniform(-200, 200),
                'change': random.uniform(-100, 100),
                'change_percent': random.uniform(-0.5, 0.5)
            },
            '^IXIC': {
                'name': 'NASDAQ',
                'value': 15000.00 + random.uniform(-100, 100),
                'change': random.uniform(-50, 50),
                'change_percent': random.uniform(-0.6, 0.6)
            }
        }
    
    def search_stocks(self, query):
        """Simple stock search - returns empty for now"""
        logger.warning("Stock search not available in mock mode")
        return []

# Global instance
yahoo_finance_service = YahooFinanceService()
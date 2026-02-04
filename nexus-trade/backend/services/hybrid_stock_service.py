"""
Hybrid Stock Data Service
Uses Alpha Vantage as primary, Yahoo Finance as fallback
"""
import logging
from services.alpha_vantage_service import alpha_vantage_service
from services.yahoo_finance import yahoo_finance_service

logger = logging.getLogger(__name__)

class HybridStockService:
    """
    Intelligent stock data service that tries multiple sources
    Priority: Alpha Vantage > Yahoo Finance > Mock Data
    """
    
    def get_stock_quote(self, symbol):
        """
        Get stock quote with fallback mechanism
        1. Try Alpha Vantage (primary)
        2. If fails, try Yahoo Finance
        3. If fails, return mock data
        """
        logger.info(f"Fetching quote for {symbol}")
        
        # Try Alpha Vantage first
        try:
            data = alpha_vantage_service.get_stock_quote(symbol)
            if data:
                logger.info(f"✅ Got {symbol} from Alpha Vantage")
                return data
        except Exception as e:
            logger.warning(f"Alpha Vantage failed for {symbol}: {e}")
        
        # Fallback to Yahoo Finance
        try:
            data = yahoo_finance_service.get_stock_info(symbol)
            if data:
                logger.info(f"✅ Got {symbol} from Yahoo Finance (fallback)")
                return data
        except Exception as e:
            logger.warning(f"Yahoo Finance also failed for {symbol}: {e}")
        
        # Last resort: mock data
        logger.warning(f"⚠️ All sources failed for {symbol}, using mock data")
        return yahoo_finance_service._get_mock_data(symbol)
    
    def get_current_price(self, symbol):
        """Get just the current price"""
        quote = self.get_stock_quote(symbol)
        return quote['current_price'] if quote else None
    
    def get_historical_data(self, symbol, period='1mo', interval='1d'):
        """Get historical data with fallback"""
        
        # Try Alpha Vantage
        try:
            data = alpha_vantage_service.get_historical_data(symbol)
            if data:
                logger.info(f"✅ Got historical data for {symbol} from Alpha Vantage")
                return data
        except Exception as e:
            logger.warning(f"Alpha Vantage historical failed: {e}")
        
        # Fallback to Yahoo
        try:
            data = yahoo_finance_service.get_historical_data(symbol, period, interval)
            if data:
                logger.info(f"✅ Got historical data for {symbol} from Yahoo (fallback)")
                return data
        except Exception as e:
            logger.warning(f"Yahoo historical also failed: {e}")
        
        return []
    
    def get_market_indices(self):
        """Get market indices (Yahoo only for now)"""
        return yahoo_finance_service.get_market_indices()
    
    def search_stocks(self, query):
        """Search stocks with fallback"""
        
        # Try Alpha Vantage
        try:
            results = alpha_vantage_service.search_stocks(query)
            if results:
                return results
        except Exception as e:
            logger.warning(f"Alpha Vantage search failed: {e}")
        
        # Fallback to Yahoo
        return yahoo_finance_service.search_stocks(query)
    
    def validate_symbol(self, symbol):
        """Validate if symbol exists"""
        quote = self.get_stock_quote(symbol)
        return quote is not None
    
    def get_multiple_quotes(self, symbols):
        """Get multiple quotes"""
        quotes = []
        for symbol in symbols:
            quote = self.get_stock_quote(symbol)
            if quote:
                quotes.append(quote)
        return quotes


# Global instance
hybrid_service = HybridStockService()

# Helper functions for backward compatibility
def get_stock_quote(symbol):
    return hybrid_service.get_stock_quote(symbol)

def get_current_price(symbol):
    return hybrid_service.get_current_price(symbol)

def get_historical_data(symbol, period='1mo', interval='1d'):
    return hybrid_service.get_historical_data(symbol, period, interval)

def get_market_indices():
    return hybrid_service.get_market_indices()

def validate_symbol(symbol):
    return hybrid_service.validate_symbol(symbol)

def get_popular_stocks():
    return ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX']

def search_stocks(query):
    return hybrid_service.search_stocks(query)

def get_multiple_quotes(symbols):
    """Get quotes for multiple symbols"""
    return hybrid_service.get_multiple_quotes(symbols)
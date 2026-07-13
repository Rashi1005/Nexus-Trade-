"""
Alpha Vantage Service - Free & Reliable Stock Data API
Sign up: https://www.alphavantage.co/support/#api-key
Free tier: 500 requests/day, 25/minute
"""

import requests
import os
from datetime import datetime
import logging
from dotenv import load_dotenv

# 🔑 FORCE load .env before reading API key
load_dotenv()

logger = logging.getLogger(__name__)


class AlphaVantageService:
    def __init__(self):
        self.api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.base_url = 'https://www.alphavantage.co/query'
        self.cache = {}
        self.cache_duration = 60  # seconds
        self.enabled = bool(self.api_key)
        if not self.enabled:
            logger.warning("ALPHA_VANTAGE_API_KEY not found; Alpha Vantage disabled, using fallback providers")

    # =========================
    # Cache helpers
    # =========================
    def _should_use_cache(self, key):
        if key not in self.cache:
            return False
        cache_time = self.cache[key].get('timestamp')
        if not cache_time:
            return False
        age = (datetime.now() - cache_time).total_seconds()
        return age < self.cache_duration

    def _get_from_cache(self, key):
        if self._should_use_cache(key):
            logger.info(f"Using cached data for {key}")
            return self.cache[key]['data']
        return None

    def _set_cache(self, key, data):
        self.cache[key] = {
            'data': data,
            'timestamp': datetime.now()
        }

    # =========================
    # Stock quote
    # =========================
    def get_stock_quote(self, symbol):
        """Get real-time stock quote"""
        if not self.enabled:
            return None

        cache_key = f"quote_{symbol}"

        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        try:
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.api_key
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()

            if 'Global Quote' not in data or not data['Global Quote']:
                logger.error(f"No data for {symbol} from Alpha Vantage")
                return None

            quote = data['Global Quote']

            stock_data = {
                'symbol': symbol,
                'name': symbol,  # Company name not in this endpoint
                'current_price': float(quote.get('05. price', 0)),
                'previous_close': float(quote.get('08. previous close', 0)),
                'change': float(quote.get('09. change', 0)),
                'change_percent': float(
                    quote.get('10. change percent', '0').replace('%', '')
                ),
                'open': float(quote.get('02. open', 0)),
                'day_high': float(quote.get('03. high', 0)),
                'day_low': float(quote.get('04. low', 0)),
                'volume': int(quote.get('06. volume', 0)),
                'market_cap': None,
                'pe_ratio': None,
                'sector': 'Unknown',
                'industry': 'Unknown'
            }

            self._set_cache(cache_key, stock_data)
            logger.info(f"Successfully fetched {symbol} from Alpha Vantage")
            return stock_data

        except Exception as e:
            logger.error(f"Error fetching {symbol} from Alpha Vantage: {e}")
            return None

    # =========================
    # Historical data
    # =========================
    def get_historical_data(self, symbol, period='daily', output_size='compact'):
        if not self.enabled:
            return []

        cache_key = f"historical_{symbol}_{period}_{output_size}"

        cached = self._get_from_cache(cache_key)
        if cached:
            return cached

        try:
            params = {
                'function': 'TIME_SERIES_DAILY',
                'symbol': symbol,
                'outputsize': output_size,
                'apikey': self.api_key
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()

            if 'Time Series (Daily)' not in data:
                logger.error(f"No historical data for {symbol}")
                return []

            time_series = data['Time Series (Daily)']
            historical_data = []

            for date, values in time_series.items():
                historical_data.append({
                    'date': date,
                    'open': float(values['1. open']),
                    'high': float(values['2. high']),
                    'low': float(values['3. low']),
                    'close': float(values['4. close']),
                    'volume': int(values['5. volume'])
                })

            historical_data.sort(key=lambda x: x['date'], reverse=True)
            self._set_cache(cache_key, historical_data)
            return historical_data

        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []

    # =========================
    # Search stocks
    # =========================
    def search_stocks(self, query):
        if not self.enabled:
            return []

        try:
            params = {
                'function': 'SYMBOL_SEARCH',
                'keywords': query,
                'apikey': self.api_key
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            data = response.json()

            if 'bestMatches' not in data:
                return []

            results = []
            for match in data['bestMatches'][:10]:
                results.append({
                    'symbol': match['1. symbol'],
                    'name': match['2. name'],
                    'type': match['3. type'],
                    'region': match['4. region'],
                    'currency': match['8. currency']
                })

            return results

        except Exception as e:
            logger.error(f"Error searching stocks: {e}")
            return []


# =========================
# Global instance & helpers
# =========================
alpha_vantage_service = AlphaVantageService()


def get_stock_quote_av(symbol):
    return alpha_vantage_service.get_stock_quote(symbol)


def get_historical_data_av(symbol, period='daily'):
    return alpha_vantage_service.get_historical_data(symbol, period)


def search_stocks_av(query):
    return alpha_vantage_service.search_stocks(query)

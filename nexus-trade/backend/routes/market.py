"""
Market data routes - Real stock prices via Hybrid Service
(Alpha Vantage → Yahoo Finance → Mock fallback)
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.hybrid_stock_service import (
    get_stock_quote,
    get_historical_data,
    get_market_indices,
    search_stocks as hybrid_search_stocks,
    get_multiple_quotes as hybrid_multiple_quotes
)
from utils.validators import validate_stock_symbol
import logging

logger = logging.getLogger(__name__)

market_bp = Blueprint('market', __name__)


@market_bp.route('/quote/<symbol>', methods=['GET'])
@jwt_required()
def get_quote(symbol):
    """
    Get real-time stock quote
    """
    try:
        symbol = symbol.upper().strip()

        stock_data = get_stock_quote(symbol)

        if not stock_data:
            return jsonify({
                'success': False,
                'message': f'Stock symbol {symbol} not found'
            }), 404

        return jsonify({
            'success': True,
            'data': stock_data
        }), 200

    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching stock data'
        }), 500


@market_bp.route('/historical/<symbol>', methods=['GET'])
@jwt_required()
def get_historical(symbol):
    """
    Get historical stock data
    """
    try:
        symbol = symbol.upper().strip()
        period = request.args.get('period', 'daily')

        historical_data = get_historical_data(symbol, period)

        if not historical_data:
            return jsonify({
                'success': False,
                'message': f'No historical data found for {symbol}'
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol,
                'period': period,
                'data_points': len(historical_data),
                'data': historical_data
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching historical data'
        }), 500


@market_bp.route('/search', methods=['GET'])
@jwt_required()
def search_stocks():
    """
    Search for stocks by symbol or name
    """
    try:
        query = request.args.get('q', '').strip()

        if not query:
            return jsonify({
                'success': False,
                'message': 'Search query is required'
            }), 400

        results = hybrid_search_stocks(query)

        return jsonify({
            'success': True,
            'data': {
                'query': query,
                'results': results
            }
        }), 200

    except Exception as e:
        logger.error(f"Error searching stocks: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during search'
        }), 500


@market_bp.route('/indices', methods=['GET'])
@jwt_required()
def get_indices():
    """
    Get major market indices
    """
    try:
        indices = get_market_indices()

        return jsonify({
            'success': True,
            'data': indices
        }), 200

    except Exception as e:
        logger.error(f"Error fetching market indices: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching market indices'
        }), 500


@market_bp.route('/popular', methods=['GET'])
@jwt_required()
def get_popular():
    """
    Get popular stocks with real-time data
    """
    try:
        symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
        popular_stocks = []

        for symbol in symbols:
            data = get_stock_quote(symbol)
            if data:
                popular_stocks.append(data)

        return jsonify({
            'success': True,
            'data': popular_stocks
        }), 200

    except Exception as e:
        logger.error(f"Error fetching popular stocks: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching popular stocks'
        }), 500


@market_bp.route('/validate/<symbol>', methods=['GET'])
@jwt_required()
def validate_symbol(symbol):
    """
    Validate if a stock symbol exists
    """
    try:
        symbol = symbol.upper().strip()
        is_valid = validate_stock_symbol(symbol)

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol,
                'is_valid': is_valid
            }
        }), 200

    except Exception as e:
        logger.error(f"Error validating symbol {symbol}: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred validating symbol'
        }), 500


@market_bp.route('/multiple', methods=['POST'])
@jwt_required()
def get_multiple_quotes():
    """
    Get quotes for multiple stocks
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])

        if not symbols:
            return jsonify({
                'success': False,
                'message': 'Symbols array is required'
            }), 400

        if len(symbols) > 50:
            return jsonify({
                'success': False,
                'message': 'Maximum 50 symbols allowed'
            }), 400

        quotes = hybrid_multiple_quotes(symbols)

        return jsonify({
            'success': True,
            'data': {
                'count': len(quotes),
                'quotes': quotes
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching multiple quotes: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching quotes'
        }), 500


@market_bp.route('/intraday/<symbol>', methods=['GET'])
@jwt_required()
def get_intraday(symbol):
    """
    Get intraday stock data
    """
    try:
        symbol = symbol.upper().strip()

        intraday_data = get_historical_data(symbol, period='intraday')

        if not intraday_data:
            return jsonify({
                'success': False,
                'message': f'No intraday data found for {symbol}'
            }), 404

        return jsonify({
            'success': True,
            'data': {
                'symbol': symbol,
                'data_points': len(intraday_data),
                'data': intraday_data
            }
        }), 200

    except Exception as e:
        logger.error(f"Error fetching intraday data for {symbol}: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred fetching intraday data'
        }), 500

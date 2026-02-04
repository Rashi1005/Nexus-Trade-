"""
Watchlist routes - Manage user watchlists
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.database import execute_query
from services.hybrid_stock_service import hybrid_service
import logging

logger = logging.getLogger(__name__)

watchlist_bp = Blueprint('watchlist', __name__)


@watchlist_bp.route('/', methods=['GET'])
@jwt_required()
def get_watchlists():
    """Get all watchlists for current user"""
    try:
        user_id = get_jwt_identity()
        
        query = """
            SELECT w.*, 
                   COUNT(wi.item_id) as stock_count
            FROM watchlists w
            LEFT JOIN watchlist_items wi ON w.watchlist_id = wi.watchlist_id
            WHERE w.user_id = %s
            GROUP BY w.watchlist_id
            ORDER BY w.is_default DESC, w.created_at ASC
        """
        watchlists = execute_query(query, (user_id,), fetch_all=True)
        
        return jsonify({
            'success': True,
            'data': watchlists or []
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching watchlists: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@watchlist_bp.route('/<int:watchlist_id>', methods=['GET'])
@jwt_required()
def get_watchlist_details(watchlist_id):
    """Get watchlist details with stocks"""
    try:
        user_id = get_jwt_identity()
        
        watchlist_query = """
            SELECT * FROM watchlists 
            WHERE watchlist_id = %s AND user_id = %s
        """
        watchlist = execute_query(
            watchlist_query, (watchlist_id, user_id), fetch_one=True
        )
        
        if not watchlist:
            return jsonify({
                'success': False,
                'message': 'Watchlist not found'
            }), 404
        
        stocks_query = """
            SELECT wi.*, wi.added_at
            FROM watchlist_items wi
            WHERE wi.watchlist_id = %s
            ORDER BY wi.added_at DESC
        """
        stocks = execute_query(
            stocks_query, (watchlist_id,), fetch_all=True
        ) or []
        
        stocks_with_data = []
        for stock in stocks:
            quote = hybrid_service.get_stock_quote(stock['symbol'])
            stocks_with_data.append({
                **stock,
                'quote': quote or {'error': 'Data unavailable'}
            })
        
        watchlist['stocks'] = stocks_with_data
        
        return jsonify({
            'success': True,
            'data': watchlist
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching watchlist details: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@watchlist_bp.route('/', methods=['POST'])
@jwt_required()
def create_watchlist():
    """Create new watchlist"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        name = data.get('name', 'My Watchlist').strip()
        
        if not name:
            return jsonify({
                'success': False,
                'message': 'Watchlist name is required'
            }), 400
        
        query = """
            INSERT INTO watchlists (user_id, name)
            VALUES (%s, %s)
        """
        result = execute_query(query, (user_id, name), commit=True)
        
        if result:
            return jsonify({
                'success': True,
                'message': 'Watchlist created successfully',
                'data': {
                    'watchlist_id': result['last_id']
                }
            }), 201
        
        return jsonify({
            'success': False,
            'message': 'Failed to create watchlist'
        }), 500
        
    except Exception as e:
        logger.error(f"Error creating watchlist: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@watchlist_bp.route('/<int:watchlist_id>/add', methods=['POST'])
@jwt_required()
def add_to_watchlist(watchlist_id):
    """Add stock to watchlist"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        symbol = data.get('symbol', '').strip().upper()
        notes = data.get('notes', '')
        
        if not symbol:
            return jsonify({
                'success': False,
                'message': 'Stock symbol is required'
            }), 400
        
        watchlist_query = """
            SELECT * FROM watchlists 
            WHERE watchlist_id = %s AND user_id = %s
        """
        watchlist = execute_query(
            watchlist_query, (watchlist_id, user_id), fetch_one=True
        )
        
        if not watchlist:
            return jsonify({
                'success': False,
                'message': 'Watchlist not found'
            }), 404
        
        # 🔒 Prevent duplicate stocks
        check_query = """
            SELECT 1 FROM watchlist_items
            WHERE watchlist_id = %s AND symbol = %s
        """
        exists = execute_query(
            check_query, (watchlist_id, symbol), fetch_one=True
        )
        
        if exists:
            return jsonify({
                'success': False,
                'message': f'{symbol} already exists in watchlist'
            }), 400
        
        query = """
            INSERT INTO watchlist_items (watchlist_id, symbol, notes)
            VALUES (%s, %s, %s)
        """
        result = execute_query(
            query, (watchlist_id, symbol, notes), commit=True
        )
        
        if result:
            return jsonify({
                'success': True,
                'message': f'{symbol} added to watchlist'
            }), 201
        
        return jsonify({
            'success': False,
            'message': 'Failed to add stock'
        }), 400
        
    except Exception as e:
        logger.error(f"Error adding to watchlist: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@watchlist_bp.route('/<int:watchlist_id>/remove/<symbol>', methods=['DELETE'])
@jwt_required()
def remove_from_watchlist(watchlist_id, symbol):
    """Remove stock from watchlist"""
    try:
        user_id = get_jwt_identity()
        symbol = symbol.upper()
        
        watchlist_query = """
            SELECT * FROM watchlists 
            WHERE watchlist_id = %s AND user_id = %s
        """
        watchlist = execute_query(
            watchlist_query, (watchlist_id, user_id), fetch_one=True
        )
        
        if not watchlist:
            return jsonify({
                'success': False,
                'message': 'Watchlist not found'
            }), 404
        
        query = """
            DELETE FROM watchlist_items 
            WHERE watchlist_id = %s AND symbol = %s
        """
        execute_query(query, (watchlist_id, symbol), commit=True)
        
        return jsonify({
            'success': True,
            'message': f'{symbol} removed from watchlist'
        }), 200
        
    except Exception as e:
        logger.error(f"Error removing from watchlist: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@watchlist_bp.route('/<int:watchlist_id>', methods=['DELETE'])
@jwt_required()
def delete_watchlist(watchlist_id):
    """Delete watchlist"""
    try:
        user_id = get_jwt_identity()
        
        watchlist_query = """
            SELECT * FROM watchlists 
            WHERE watchlist_id = %s AND user_id = %s
        """
        watchlist = execute_query(
            watchlist_query, (watchlist_id, user_id), fetch_one=True
        )
        
        if not watchlist:
            return jsonify({
                'success': False,
                'message': 'Watchlist not found'
            }), 404
        
        if watchlist['is_default']:
            return jsonify({
                'success': False,
                'message': 'Cannot delete default watchlist'
            }), 400
        
        query = "DELETE FROM watchlists WHERE watchlist_id = %s"
        execute_query(query, (watchlist_id,), commit=True)
        
        return jsonify({
            'success': True,
            'message': 'Watchlist deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting watchlist: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500

"""
Portfolio routes - Get user holdings and performance
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.database import get_user_holdings, get_user_by_id
from services.hybrid_stock_service import hybrid_service
import logging

logger = logging.getLogger(__name__)

portfolio_bp = Blueprint('portfolio', __name__)


@portfolio_bp.route('/', methods=['GET'])
@jwt_required()
def get_portfolio():
    """Get user portfolio summary"""
    try:
        user_id = get_jwt_identity()
        
        # Get user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Get holdings
        holdings = get_user_holdings(user_id) or []
        
        holdings_with_prices = []
        total_value = 0.0
        
        for holding in holdings:
            quote = hybrid_service.get_stock_quote(holding['symbol'])
            
            if quote and quote.get('current_price') is not None:
                current_price = quote['current_price']
                current_value = holding['quantity'] * current_price
                profit_loss = current_value - holding['total_invested']
                profit_loss_percent = (
                    (profit_loss / holding['total_invested']) * 100
                    if holding['total_invested'] > 0 else 0
                )
                
                total_value += current_value
                
                holdings_with_prices.append({
                    **holding,
                    'current_price': current_price,
                    'current_value': current_value,
                    'profit_loss': profit_loss,
                    'profit_loss_percent': profit_loss_percent,
                    'company_name': quote.get('name', holding['symbol']),
                    'data_source': quote.get('source', 'unknown')
                })
            else:
                # Graceful fallback if API fails
                holdings_with_prices.append({
                    **holding,
                    'current_price': None,
                    'current_value': None,
                    'profit_loss': None,
                    'profit_loss_percent': None,
                    'company_name': holding['symbol'],
                    'error': 'Live price unavailable'
                })
        
        return jsonify({
            'success': True,
            'data': {
                'cash_balance': float(user['cash_balance']),
                'holdings_value': total_value,
                'total_portfolio_value': float(user['cash_balance']) + total_value,
                'holdings': holdings_with_prices
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500

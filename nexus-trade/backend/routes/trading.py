"""
Trading routes - Buy and sell stocks with real prices
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.database import get_user_by_id, execute_query, execute_transaction
from services.hybrid_stock_service import get_stock_quote, get_current_price, validate_symbol
from utils.validators import validate_quantity, validate_stock_symbol
from config import Config
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

trading_bp = Blueprint('trading', __name__)


@trading_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy_stock():
    """
    Execute buy order
    
    Request body:
        - symbol: string (required) - Stock ticker symbol
        - quantity: integer (required) - Number of shares
        - order_type: string (optional) - 'market' (default), 'limit'
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        symbol = data.get('symbol', '').strip().upper()
        quantity = data.get('quantity')
        
        if not symbol or not quantity:
            return jsonify({
                'success': False,
                'message': 'Symbol and quantity are required'
            }), 400
        
        # Validate symbol format
        if not validate_stock_symbol(symbol):
            return jsonify({
                'success': False,
                'message': 'Invalid stock symbol format'
            }), 400
        
        # Validate quantity
        is_valid, message = validate_quantity(quantity)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        quantity = int(quantity)
        
        # Verify stock exists and get current price
        stock_data = get_stock_quote(symbol)
        if not stock_data:
            return jsonify({
                'success': False,
                'message': f'Stock symbol {symbol} not found'
            }), 404
        
        current_price = stock_data['current_price']
        
        # Get user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Calculate total cost
        commission = Config.DEFAULT_COMMISSION
        subtotal = current_price * quantity
        total_cost = subtotal + commission
        
        # Check if user has sufficient balance
        if user['cash_balance'] < total_cost:
            return jsonify({
                'success': False,
                'message': 'Insufficient balance',
                'data': {
                    'required': round(total_cost, 2),
                    'available': round(float(user['cash_balance']), 2),
                    'shortfall': round(total_cost - float(user['cash_balance']), 2)
                }
            }), 400
        
        # Create order (will trigger automatic portfolio update)
        order_query = """
            INSERT INTO orders (
                user_id, symbol, order_type, side, quantity, 
                filled_price, filled_quantity, status, commission, total_amount
            )
            VALUES (%s, %s, 'market', 'buy', %s, %s, %s, 'filled', %s, %s)
        """
        
        result = execute_query(
            order_query,
            (user_id, symbol, quantity, current_price, quantity, commission, total_cost),
            commit=True
        )
        
        if not result or not result.get('last_id'):
            return jsonify({
                'success': False,
                'message': 'Failed to create order'
            }), 500
        
        order_id = result['last_id']
        
        # Get updated user balance
        updated_user = get_user_by_id(user_id)
        
        # Log successful trade
        logger.info(f"User {user_id} bought {quantity} shares of {symbol} at ${current_price}")
        
        return jsonify({
            'success': True,
            'message': f'Successfully bought {quantity} shares of {symbol}',
            'data': {
                'order_id': order_id,
                'symbol': symbol,
                'company_name': stock_data['name'],
                'quantity': quantity,
                'price': round(current_price, 2),
                'subtotal': round(subtotal, 2),
                'commission': round(commission, 2),
                'total': round(total_cost, 2),
                'executed_at': datetime.utcnow().isoformat(),
                'new_balance': round(float(updated_user['cash_balance']), 2)
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error executing buy order: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred executing order'
        }), 500


@trading_bp.route('/sell', methods=['POST'])
@jwt_required()
def sell_stock():
    """
    Execute sell order
    
    Request body:
        - symbol: string (required) - Stock ticker symbol
        - quantity: integer (required) - Number of shares
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate input
        symbol = data.get('symbol', '').strip().upper()
        quantity = data.get('quantity')
        
        if not symbol or not quantity:
            return jsonify({
                'success': False,
                'message': 'Symbol and quantity are required'
            }), 400
        
        # Validate symbol format
        if not validate_stock_symbol(symbol):
            return jsonify({
                'success': False,
                'message': 'Invalid stock symbol format'
            }), 400
        
        # Validate quantity
        is_valid, message = validate_quantity(quantity)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': message
            }), 400
        
        quantity = int(quantity)
        
        # Check if user owns this stock
        holding_query = """
            SELECT h.* FROM holdings h
            WHERE h.user_id = %s AND h.symbol = %s AND h.quantity > 0
        """
        holding = execute_query(holding_query, (user_id, symbol), fetch_one=True)
        
        if not holding:
            return jsonify({
                'success': False,
                'message': f'You do not own any shares of {symbol}'
            }), 400
        
        if holding['quantity'] < quantity:
            return jsonify({
                'success': False,
                'message': f'Insufficient shares. You own {holding["quantity"]} shares',
                'data': {
                    'owned': holding['quantity'],
                    'requested': quantity
                }
            }), 400
        
        # Get current price
        stock_data = get_stock_quote(symbol)
        if not stock_data:
            return jsonify({
                'success': False,
                'message': f'Unable to fetch price for {symbol}'
            }), 500
        
        current_price = stock_data['current_price']
        
        # Calculate proceeds
        commission = Config.DEFAULT_COMMISSION
        subtotal = current_price * quantity
        total_proceeds = subtotal - commission
        
        # Create sell order (trigger will validate and update holdings)
        try:
            order_query = """
                INSERT INTO orders (
                    user_id, symbol, order_type, side, quantity,
                    filled_price, filled_quantity, status, commission, total_amount
                )
                VALUES (%s, %s, 'market', 'sell', %s, %s, %s, 'filled', %s, %s)
            """
            
            result = execute_query(
                order_query,
                (user_id, symbol, quantity, current_price, quantity, commission, total_proceeds),
                commit=True
            )
            
            if not result or not result.get('last_id'):
                return jsonify({
                    'success': False,
                    'message': 'Failed to create order'
                }), 500
            
            order_id = result['last_id']
            
            # Calculate profit/loss
            cost_basis = holding['average_cost'] * quantity
            profit_loss = total_proceeds - cost_basis
            profit_loss_percent = (profit_loss / cost_basis) * 100 if cost_basis > 0 else 0
            
            # Get updated user balance
            updated_user = get_user_by_id(user_id)
            
            # Log successful trade
            logger.info(f"User {user_id} sold {quantity} shares of {symbol} at ${current_price}")
            
            return jsonify({
                'success': True,
                'message': f'Successfully sold {quantity} shares of {symbol}',
                'data': {
                    'order_id': order_id,
                    'symbol': symbol,
                    'company_name': stock_data['name'],
                    'quantity': quantity,
                    'price': round(current_price, 2),
                    'subtotal': round(subtotal, 2),
                    'commission': round(commission, 2),
                    'total_proceeds': round(total_proceeds, 2),
                    'cost_basis': round(cost_basis, 2),
                    'profit_loss': round(profit_loss, 2),
                    'profit_loss_percent': round(profit_loss_percent, 2),
                    'executed_at': datetime.utcnow().isoformat(),
                    'new_balance': round(float(updated_user['cash_balance']), 2)
                }
            }), 201
            
        except Exception as e:
            # This will catch trigger errors (e.g., insufficient shares)
            if 'Insufficient shares' in str(e):
                return jsonify({
                    'success': False,
                    'message': 'Insufficient shares to sell'
                }), 400
            raise
        
    except Exception as e:
        logger.error(f"Error executing sell order: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred executing order'
        }), 500


@trading_bp.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():
    """
    Get user's order history
    
    Query params:
        - limit: integer (optional) - Max orders to return (default: 50)
        - status: string (optional) - Filter by status
    """
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        status = request.args.get('status')
        
        # Build query
        if status:
            query = """
                SELECT o.*, 
                       DATE_FORMAT(o.created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as order_time
                FROM orders o
                WHERE o.user_id = %s AND o.status = %s
                ORDER BY o.created_at DESC
                LIMIT %s
            """
            params = (user_id, status, limit)
        else:
            query = """
                SELECT o.*,
                       DATE_FORMAT(o.created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as order_time
                FROM orders o
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC
                LIMIT %s
            """
            params = (user_id, limit)
        
        orders = execute_query(query, params, fetch_all=True) or []
        
        # Format orders
        formatted_orders = []
        for order in orders:
            formatted_orders.append({
                'order_id': order['order_id'],
                'symbol': order['symbol'],
                'side': order['side'],
                'order_type': order['order_type'],
                'quantity': order['quantity'],
                'filled_quantity': order['filled_quantity'],
                'price': float(order['filled_price']) if order['filled_price'] else None,
                'total_amount': float(order['total_amount']) if order['total_amount'] else None,
                'commission': float(order['commission']) if order['commission'] else None,
                'status': order['status'],
                'created_at': order['order_time'],
                'filled_at': order['filled_at'].isoformat() if order['filled_at'] else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'count': len(formatted_orders),
                'orders': formatted_orders
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@trading_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    """
    Get user's transaction history
    
    Query params:
        - limit: integer (optional) - Max transactions to return (default: 50)
        - symbol: string (optional) - Filter by symbol
    """
    try:
        user_id = get_jwt_identity()
        limit = request.args.get('limit', 50, type=int)
        symbol = request.args.get('symbol', '').strip().upper()
        
        # Build query
        if symbol:
            query = """
                SELECT t.*,
                       DATE_FORMAT(t.transaction_date, '%%Y-%%m-%%d %%H:%%i:%%s') as transaction_time
                FROM transactions t
                WHERE t.user_id = %s AND t.symbol = %s
                ORDER BY t.transaction_date DESC
                LIMIT %s
            """
            params = (user_id, symbol, limit)
        else:
            query = """
                SELECT t.*,
                       DATE_FORMAT(t.transaction_date, '%%Y-%%m-%%d %%H:%%i:%%s') as transaction_time
                FROM transactions t
                WHERE t.user_id = %s
                ORDER BY t.transaction_date DESC
                LIMIT %s
            """
            params = (user_id, limit)
        
        transactions = execute_query(query, params, fetch_all=True) or []
        
        # Format transactions
        formatted_transactions = []
        for txn in transactions:
            formatted_transactions.append({
                'transaction_id': txn['transaction_id'],
                'symbol': txn['symbol'],
                'type': txn['transaction_type'],
                'quantity': txn['quantity'],
                'price': float(txn['price']),
                'commission': float(txn['commission']),
                'total_amount': float(txn['total_amount']),
                'transaction_date': txn['transaction_time']
            })
        
        return jsonify({
            'success': True,
            'data': {
                'count': len(formatted_transactions),
                'transactions': formatted_transactions
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@trading_bp.route('/quote-and-validate', methods=['POST'])
@jwt_required()
def quote_and_validate():
    """
    Get quote and validate if user can afford/sell
    
    Request body:
        - symbol: string (required)
        - quantity: integer (required)
        - side: string (required) - 'buy' or 'sell'
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        symbol = data.get('symbol', '').strip().upper()
        quantity = data.get('quantity')
        side = data.get('side', '').lower()
        
        if not all([symbol, quantity, side]):
            return jsonify({
                'success': False,
                'message': 'Symbol, quantity, and side are required'
            }), 400
        
        if side not in ['buy', 'sell']:
            return jsonify({
                'success': False,
                'message': 'Side must be "buy" or "sell"'
            }), 400
        
        quantity = int(quantity)
        
        # Get stock quote
        stock_data = get_stock_quote(symbol)
        if not stock_data:
            return jsonify({
                'success': False,
                'message': f'Stock symbol {symbol} not found'
            }), 404
        
        current_price = stock_data['current_price']
        commission = Config.DEFAULT_COMMISSION
        
        # Get user data
        user = get_user_by_id(user_id)
        
        if side == 'buy':
            # Calculate cost
            subtotal = current_price * quantity
            total_cost = subtotal + commission
            can_afford = user['cash_balance'] >= total_cost
            
            return jsonify({
                'success': True,
                'data': {
                    'symbol': symbol,
                    'company_name': stock_data['name'],
                    'current_price': round(current_price, 2),
                    'quantity': quantity,
                    'subtotal': round(subtotal, 2),
                    'commission': round(commission, 2),
                    'total_cost': round(total_cost, 2),
                    'available_balance': round(float(user['cash_balance']), 2),
                    'can_afford': can_afford,
                    'shortfall': round(max(0, total_cost - float(user['cash_balance'])), 2) if not can_afford else 0
                }
            }), 200
            
        else:  # sell
            # Check holdings
            holding_query = """
                SELECT * FROM holdings
                WHERE user_id = %s AND symbol = %s AND quantity > 0
            """
            holding = execute_query(holding_query, (user_id, symbol), fetch_one=True)
            
            if not holding:
                return jsonify({
                    'success': True,
                    'data': {
                        'symbol': symbol,
                        'company_name': stock_data['name'],
                        'current_price': round(current_price, 2),
                        'quantity': quantity,
                        'owned_shares': 0,
                        'can_sell': False,
                        'message': 'You do not own any shares of this stock'
                    }
                }), 200
            
            subtotal = current_price * quantity
            total_proceeds = subtotal - commission
            can_sell = holding['quantity'] >= quantity
            
            # Calculate potential profit/loss
            cost_basis = holding['average_cost'] * quantity
            profit_loss = total_proceeds - cost_basis if can_sell else 0
            
            return jsonify({
                'success': True,
                'data': {
                    'symbol': symbol,
                    'company_name': stock_data['name'],
                    'current_price': round(current_price, 2),
                    'quantity': quantity,
                    'owned_shares': holding['quantity'],
                    'average_cost': round(float(holding['average_cost']), 2),
                    'subtotal': round(subtotal, 2),
                    'commission': round(commission, 2),
                    'total_proceeds': round(total_proceeds, 2),
                    'cost_basis': round(cost_basis, 2),
                    'estimated_profit_loss': round(profit_loss, 2),
                    'can_sell': can_sell,
                    'shortfall': max(0, quantity - holding['quantity']) if not can_sell else 0
                }
            }), 200
        
    except Exception as e:
        logger.error(f"Error in quote and validate: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500
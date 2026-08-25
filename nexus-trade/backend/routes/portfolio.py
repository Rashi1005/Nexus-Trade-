"""
Portfolio routes - Enhanced with real-time valuations
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.database import get_user_by_id, execute_query
from services.hybrid_stock_service import get_stock_quote  # ✅ FIXED: Using hybrid service
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

portfolio_bp = Blueprint('portfolio', __name__)


@portfolio_bp.route('/', methods=['GET'])
@jwt_required()
def get_portfolio():
    """Get complete portfolio with real-time valuations"""
    try:
        user_id = int(get_jwt_identity())  # identity stored as string, convert to int
        
        # Get user data
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Get holdings
        holdings_query = """
            SELECT h.*,
                   DATE_FORMAT(h.first_purchased_at, '%Y-%m-%d') as purchase_date
            FROM holdings h
            WHERE h.user_id = %s AND h.quantity > 0
            ORDER BY h.total_invested DESC
        """
        holdings = execute_query(holdings_query, (user_id,), fetch_all=True) or []
        
        # Get real-time prices and calculate values
        holdings_with_data = []
        total_invested = 0
        total_current_value = 0
        total_profit_loss = 0
        
        for holding in holdings:
            stock_data = get_stock_quote(holding['symbol'])
            if stock_data:
                current_price = stock_data['current_price']
                current_value = holding['quantity'] * current_price
                invested = float(holding['total_invested'])
                profit_loss = current_value - invested
                profit_loss_percent = (profit_loss / invested) * 100 if invested > 0 else 0
                day_change = stock_data['change']
                day_change_percent = stock_data['change_percent']
                today_gain_loss = holding['quantity'] * day_change
                
                holdings_with_data.append({
                    'symbol': holding['symbol'],
                    'company_name': stock_data['name'],
                    'quantity': holding['quantity'],
                    'average_cost': round(float(holding['average_cost']), 2),
                    'current_price': round(current_price, 2),
                    'total_invested': round(invested, 2),
                    'current_value': round(current_value, 2),
                    'profit_loss': round(profit_loss, 2),
                    'profit_loss_percent': round(profit_loss_percent, 2),
                    'day_change': round(day_change, 2),
                    'day_change_percent': round(day_change_percent, 2),
                    'today_gain_loss': round(today_gain_loss, 2),
                    'purchase_date': holding['purchase_date'],
                    'sector': stock_data.get('sector', 'N/A')
                })
                
                total_invested += invested
                total_current_value += current_value
                total_profit_loss += profit_loss
        
        # Calculate portfolio metrics
        cash_balance = float(user['cash_balance'])
        total_portfolio_value = cash_balance + total_current_value
        total_return_percent = (total_profit_loss / total_invested) * 100 if total_invested > 0 else 0
        
        # Get sector allocation
        sector_allocation = {}
        for holding in holdings_with_data:
            sector = holding['sector']
            if sector in sector_allocation:
                sector_allocation[sector] += holding['current_value']
            else:
                sector_allocation[sector] = holding['current_value']
        
        # Convert to percentages
        sector_percentages = []
        for sector, value in sector_allocation.items():
            percentage = (value / total_current_value) * 100 if total_current_value > 0 else 0
            sector_percentages.append({
                'sector': sector,
                'value': round(value, 2),
                'percentage': round(percentage, 2)
            })
        
        return jsonify({
            'success': True,
            'data': {
                'summary': {
                    'cash_balance': round(cash_balance, 2),
                    'holdings_value': round(total_current_value, 2),
                    'total_portfolio_value': round(total_portfolio_value, 2),
                    'total_invested': round(total_invested, 2),
                    'total_profit_loss': round(total_profit_loss, 2),
                    'total_return_percent': round(total_return_percent, 2),
                    'num_positions': len(holdings_with_data)
                },
                'holdings': holdings_with_data,
                'sector_allocation': sector_percentages
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching portfolio: {e}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500


@portfolio_bp.route('/history', methods=['GET'])
@jwt_required()
def get_portfolio_history():
    """Get portfolio value history"""
    try:
        user_id = int(get_jwt_identity())  # identity stored as string, convert to int
        period = request.args.get('period', '1M')  # 1W, 1M, 3M, 1Y
        
        # Get snapshots from database
        if period == '1W':
            days = 7
        elif period == '3M':
            days = 90
        elif period == '1Y':
            days = 365
        else:  # 1M
            days = 30
        
        query = """
            SELECT ps.*,
                   DATE_FORMAT(ps.snapshot_date, '%Y-%m-%d') as date
            FROM portfolio_snapshots ps
            WHERE ps.user_id = %s 
            AND ps.snapshot_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            ORDER BY ps.snapshot_date ASC
        """
        
        snapshots = execute_query(query, (user_id, days), fetch_all=True) or []
        
        # Format snapshots
        history = []
        for snapshot in snapshots:
            history.append({
                'date': snapshot['date'],
                'total_value': round(float(snapshot['total_value']), 2),
                'cash_balance': round(float(snapshot['cash_balance']), 2),
                'holdings_value': round(float(snapshot['holdings_value']), 2),
                'daily_return': round(float(snapshot['daily_return']), 4) if snapshot['daily_return'] else 0,
                'total_return': round(float(snapshot['total_return']), 4) if snapshot['total_return'] else 0
            })
        
        return jsonify({
            'success': True,
            'data': {
                'period': period,
                'data_points': len(history),
                'history': history
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching portfolio history: {e}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500


@portfolio_bp.route('/performance', methods=['GET'])
@jwt_required()
def get_performance_metrics():
    """Get portfolio performance metrics"""
    try:
        user_id = int(get_jwt_identity())  # identity stored as string, convert to int
        
        # Get all transactions
        transactions_query = """
            SELECT 
                COUNT(*) as total_trades,
                COUNT(CASE WHEN transaction_type = 'buy' THEN 1 END) as buy_trades,
                COUNT(CASE WHEN transaction_type = 'sell' THEN 1 END) as sell_trades,
                SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) as total_bought,
                SUM(CASE WHEN transaction_type = 'sell' THEN total_amount ELSE 0 END) as total_sold,
                SUM(commission) as total_commissions
            FROM transactions
            WHERE user_id = %s
        """
        
        metrics = execute_query(transactions_query, (user_id,), fetch_one=True)
        
        if not metrics or metrics['total_trades'] == 0:
            return jsonify({
                'success': True,
                'data': {
                    'total_trades': 0,
                    'buy_trades': 0,
                    'sell_trades': 0,
                    'total_invested': 0,
                    'total_proceeds': 0,
                    'total_commissions': 0,
                    'message': 'No trading activity yet'
                }
            }), 200
        
        # Get most traded symbol
        most_traded_query = """
            SELECT symbol, COUNT(*) as trade_count, SUM(quantity) as total_quantity
            FROM transactions
            WHERE user_id = %s
            GROUP BY symbol
            ORDER BY trade_count DESC
            LIMIT 5
        """
        
        most_traded = execute_query(most_traded_query, (user_id,), fetch_all=True) or []
        
        return jsonify({
            'success': True,
            'data': {
                'total_trades': metrics['total_trades'],
                'buy_trades': metrics['buy_trades'],
                'sell_trades': metrics['sell_trades'],
                'total_invested': round(float(metrics['total_bought'] or 0), 2),
                'total_proceeds': round(float(metrics['total_sold'] or 0), 2),
                'total_commissions': round(float(metrics['total_commissions'] or 0), 2),
                'most_traded': [
                    {
                        'symbol': row['symbol'],
                        'trade_count': row['trade_count'],
                        'total_quantity': row['total_quantity']
                    }
                    for row in most_traded
                ]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching performance metrics: {e}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500


@portfolio_bp.route('/diversity', methods=['GET'])
@jwt_required()
def get_diversity_score():
    """Calculate portfolio diversity score"""
    try:
        user_id = int(get_jwt_identity())  # identity stored as string, convert to int
        
        # Get holdings with sectors
        holdings_query = """
            SELECT h.symbol, h.total_invested
            FROM holdings h
            WHERE h.user_id = %s AND h.quantity > 0
        """
        holdings = execute_query(holdings_query, (user_id,), fetch_all=True) or []
        
        if len(holdings) == 0:
            return jsonify({
                'success': True,
                'data': {
                    'diversity_score': 0,
                    'num_positions': 0,
                    'num_sectors': 0,
                    'message': 'No holdings yet'
                }
            }), 200
        
        # Get sector info for each holding
        sectors = set()
        total_value = 0
        
        for holding in holdings:
            stock_data = get_stock_quote(holding['symbol'])
            if stock_data:
                sectors.add(stock_data.get('sector', 'Unknown'))
                total_value += float(holding['total_invested'])
        
        # Simple diversity score
        # Based on: number of positions, number of sectors, concentration
        num_positions = len(holdings)
        num_sectors = len(sectors)
        
        # Calculate concentration (Herfindahl index)
        concentration = sum(
            (float(h['total_invested']) / total_value) ** 2 
            for h in holdings
        ) if total_value > 0 else 1
        
        # Diversity score (0-100)
        # Higher is more diverse
        position_score = min(num_positions / 10, 1) * 40  # Max 40 points
        sector_score = min(num_sectors / 5, 1) * 30  # Max 30 points
        concentration_score = (1 - concentration) * 30  # Max 30 points
        
        diversity_score = position_score + sector_score + concentration_score
        
        return jsonify({
            'success': True,
            'data': {
                'diversity_score': round(diversity_score, 2),
                'num_positions': num_positions,
                'num_sectors': num_sectors,
                'concentration_index': round(concentration, 4),
                'rating': 'High' if diversity_score >= 70 else 'Medium' if diversity_score >= 40 else 'Low'
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error calculating diversity: {e}")
        return jsonify({'success': False, 'message': 'An error occurred'}), 500
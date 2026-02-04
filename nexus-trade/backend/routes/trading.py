"""
Trading routes - Buy and sell stocks
"""
from flask import Blueprint, jsonify
import logging

logger = logging.getLogger(__name__)

trading_bp = Blueprint('trading', __name__)

# Trading routes will be implemented in Stage 3
# For now, just placeholder endpoints

@trading_bp.route('/buy', methods=['POST'])
def buy_stock():
    return jsonify({'success': False, 'message': 'Coming in Stage 3'}), 501

@trading_bp.route('/sell', methods=['POST'])
def sell_stock():
    return jsonify({'success': False, 'message': 'Coming in Stage 3'}), 501

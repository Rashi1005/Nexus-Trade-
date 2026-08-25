"""
Authentication routes - Signup, Login, Logout
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
import bcrypt
from utils.database import get_user_by_email, get_user_by_id, create_user, execute_query
from utils.validators import validate_email, validate_password
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user
    
    Request body:
        - email: string (required)
        - password: string (required)
        - full_name: string (required)
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        full_name = data.get('full_name', '').strip()
        
        if not all([email, password, full_name]):
            return jsonify({
                'success': False,
                'message': 'Email, password, and full name are required'
            }), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                'success': False,
                'message': 'Invalid email format'
            }), 400
        
        # Validate password strength
        password_valid, password_message = validate_password(password)
        if not password_valid:
            return jsonify({
                'success': False,
                'message': password_message
            }), 400
        
        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 400
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        user_id = create_user(email, password_hash, full_name)
        
        if not user_id:
            return jsonify({
                'success': False,
                'message': 'Failed to create user'
            }), 500
        
        # Get created user
        user = get_user_by_id(user_id)
        
        # Create JWT tokens (identity must be a string in Flask-JWT-Extended 4.x)
        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))
        
        # Log successful signup
        logger.info(f"New user registered: {email}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'user': {
                    'user_id': user['user_id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'cash_balance': float(user['cash_balance']),
                    'is_verified': user['is_verified']
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during signup'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    
    Request body:
        - email: string (required)
        - password: string (required)
    """
    try:
        data = request.get_json()
        
        # Get credentials
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not all([email, password]):
            return jsonify({
                'success': False,
                'message': 'Email and password are required'
            }), 400
        
        # Get user
        user = get_user_by_email(email)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Update last login
        execute_query(
            "UPDATE users SET last_login = NOW() WHERE user_id = %s",
            (user['user_id'],),
            commit=True
        )
        
        # Create JWT tokens (identity must be a string in Flask-JWT-Extended 4.x)
        access_token = create_access_token(identity=str(user['user_id']))
        refresh_token = create_refresh_token(identity=str(user['user_id']))
        
        # Log successful login
        logger.info(f"User logged in: {email}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': {
                    'user_id': user['user_id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'cash_balance': float(user['cash_balance']),
                    'is_verified': user['is_verified']
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during login'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information"""
    try:
        user_id = int(get_jwt_identity())  # identity stored as string, convert back to int
        user = get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'user_id': user['user_id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'cash_balance': float(user['cash_balance']),
                    'is_verified': user['is_verified'],
                    'created_at': user['created_at'].isoformat() if user['created_at'] else None,
                    'last_login': user['last_login'].isoformat() if user['last_login'] else None
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'success': True,
            'data': {
                'access_token': access_token
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should discard tokens)"""
    try:
        user_id = get_jwt_identity()
        jti = get_jwt()['jti']
        
        # In a production app, you'd add the JTI to a blacklist
        # For now, we'll just log the logout
        logger.info(f"User {user_id} logged out")
        
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            'success': False,
            'message': 'An error occurred'
        }), 500
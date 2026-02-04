"""
Validation utilities
"""
import re
from email_validator import validate_email as validate_email_lib, EmailNotValidError


def validate_email(email):
    """
    Validate email format
    
    Args:
        email: Email string
        
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        validate_email_lib(email)
        return True
    except EmailNotValidError:
        return False


def validate_password(password):
    """
    Validate password strength
    
    Requirements:
        - Minimum 8 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character
    
    Args:
        password: Password string
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"


def validate_stock_symbol(symbol):
    """
    Validate stock symbol format
    
    Args:
        symbol: Stock ticker symbol
        
    Returns:
        bool: True if valid format, False otherwise
    """
    if not symbol:
        return False
    
    # Stock symbols are typically 1-5 uppercase letters
    pattern = r'^[A-Z]{1,5}$'
    return bool(re.match(pattern, symbol.upper()))


def validate_quantity(quantity):
    """
    Validate trade quantity
    
    Args:
        quantity: Number of shares
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    try:
        qty = int(quantity)
        if qty <= 0:
            return False, "Quantity must be greater than 0"
        if qty > 10000:
            return False, "Quantity exceeds maximum limit (10,000)"
        return True, "Quantity is valid"
    except (ValueError, TypeError):
        return False, "Quantity must be a valid number"


def validate_price(price):
    """
    Validate stock price
    
    Args:
        price: Stock price
        
    Returns:
        tuple: (is_valid: bool, message: str)
    """
    try:
        p = float(price)
        if p <= 0:
            return False, "Price must be greater than 0"
        if p > 1000000:
            return False, "Price exceeds maximum limit"
        return True, "Price is valid"
    except (ValueError, TypeError):
        return False, "Price must be a valid number"


def sanitize_string(text, max_length=255):
    """
    Sanitize and trim string input
    
    Args:
        text: Input string
        max_length: Maximum allowed length
        
    Returns:
        str: Sanitized string
    """
    if not text:
        return ""
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text


def validate_order_type(order_type):
    """
    Validate order type
    
    Args:
        order_type: Order type string
        
    Returns:
        bool: True if valid, False otherwise
    """
    valid_types = ['market', 'limit', 'stop_loss']
    return order_type.lower() in valid_types


def validate_order_side(side):
    """
    Validate order side (buy/sell)
    
    Args:
        side: Order side string
        
    Returns:
        bool: True if valid, False otherwise
    """
    valid_sides = ['buy', 'sell']
    return side.lower() in valid_sides
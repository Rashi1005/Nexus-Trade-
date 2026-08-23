"""
Database connection utility with connection pooling and helper functions
"""
import mysql.connector
from mysql.connector import Error, pooling
from config import Config
import logging

logger = logging.getLogger(__name__)

# Connection pool configuration
connection_pool = None

def init_connection_pool():
    """Initialize MySQL connection pool"""
    global connection_pool
    try:
        connection_pool = pooling.MySQLConnectionPool(
            pool_name="nexus_pool",
            pool_size=5,
            pool_reset_session=True,
            host=Config.DB_HOST,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            autocommit=False
        )
        logger.info("Database connection pool created successfully")
        return True
    except Error as e:
        logger.error(f"Error creating connection pool: {e}")
        return False


def get_db_connection():
    """Get a connection from the pool"""
    global connection_pool
    try:
        if connection_pool is None:
            init_connection_pool()
        
        connection = connection_pool.get_connection()
        return connection
    except Error as e:
        logger.error(f"Error getting connection from pool: {e}")
        return None


def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """
    Execute a SQL query
    
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch_one: Return single row
        fetch_all: Return all rows
        commit: Commit transaction
        
    Returns:
        Query result or None on error
    """
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        result = None
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        elif commit:
            connection.commit()
            result = {
                'affected_rows': cursor.rowcount,
                'last_id': cursor.lastrowid
            }
        
        cursor.close()
        connection.close()
        return result
        
    except Error as e:
        logger.error(f"Database error: {e}")
        if connection:
            connection.rollback()
            connection.close()
        return None


def execute_transaction(queries):
    """
    Execute multiple queries in a transaction
    
    Args:
        queries: List of (query, params) tuples
        
    Returns:
        True on success, False on failure
    """
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        for query, params in queries:
            cursor.execute(query, params or ())
        
        connection.commit()
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        logger.error(f"Transaction error: {e}")
        if connection:
            connection.rollback()
            connection.close()
        return False


def test_connection():
    """Test database connection"""
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            cursor.close()
            connection.close()
            logger.info("Database connection test successful")
            return result is not None
        except Error as e:
            logger.error(f"Connection test failed: {e}")
            return False
    return False


def get_user_by_email(email):
    """Get user by email"""
    query = "SELECT * FROM users WHERE email = %s AND is_active = TRUE"
    return execute_query(query, (email,), fetch_one=True)


def get_user_by_id(user_id):
    """Get user by ID"""
    query = "SELECT * FROM users WHERE user_id = %s AND is_active = TRUE"
    return execute_query(query, (user_id,), fetch_one=True)


def create_user(email, password_hash, full_name):
    """Create new user"""
    query = """
        INSERT INTO users (email, password_hash, full_name, cash_balance, is_verified)
        VALUES (%s, %s, %s, %s, FALSE)
    """
    result = execute_query(query, (email, password_hash, full_name, Config.INITIAL_BALANCE), commit=True)
    
    if result and result['last_id']:
        # Create default watchlist
        watchlist_query = """
            INSERT INTO watchlists (user_id, name, is_default)
            VALUES (%s, 'My Watchlist', TRUE)
        """
        execute_query(watchlist_query, (result['last_id'],), commit=True)
        
        return result['last_id']
    return None


def update_user_balance(user_id, amount, operation='add'):
    """Update user cash balance"""
    if operation == 'add':
        query = "UPDATE users SET cash_balance = cash_balance + %s WHERE user_id = %s"
    else:
        query = "UPDATE users SET cash_balance = cash_balance - %s WHERE user_id = %s"
    
    return execute_query(query, (amount, user_id), commit=True)


def get_user_holdings(user_id):
    """Get user's stock holdings"""
    query = """
        SELECT h.*, 
               (SELECT COUNT(*) FROM transactions t 
                WHERE t.user_id = h.user_id AND t.symbol = h.symbol) as trade_count
        FROM holdings h
        WHERE h.user_id = %s AND h.quantity > 0
        ORDER BY h.total_invested DESC
    """
    return execute_query(query, (user_id,), fetch_all=True)


def get_user_orders(user_id, limit=50, status=None):
    """Get user's orders"""
    if status:
        query = """
            SELECT * FROM orders 
            WHERE user_id = %s AND status = %s
            ORDER BY created_at DESC LIMIT %s
        """
        params = (user_id, status, limit)
    else:
        query = """
            SELECT * FROM orders 
            WHERE user_id = %s
            ORDER BY created_at DESC LIMIT %s
        """
        params = (user_id, limit)
    
    return execute_query(query, params, fetch_all=True)


def get_user_transactions(user_id, limit=50):
    """Get user's transaction history"""
    query = """
        SELECT * FROM transactions 
        WHERE user_id = %s
        ORDER BY transaction_date DESC LIMIT %s
    """
    return execute_query(query, (user_id, limit), fetch_all=True)


def get_holding_by_symbol(user_id, symbol):
    """Get specific holding by symbol"""
    query = """
        SELECT * FROM holdings 
        WHERE user_id = %s AND symbol = %s
    """
    return execute_query(query, (user_id, symbol), fetch_one=True)


def update_holding(user_id, symbol, quantity, avg_price, total_invested):
    """Update or create holding"""
    # Check if holding exists
    existing = get_holding_by_symbol(user_id, symbol)
    
    if existing:
        # Update existing holding
        query = """
            UPDATE holdings 
            SET quantity = %s, average_cost = %s, total_invested = %s, last_updated_at = NOW()
            WHERE user_id = %s AND symbol = %s
        """
        return execute_query(query, (quantity, avg_price, total_invested, user_id, symbol), commit=True)
    else:
        # Create new holding
        query = """
            INSERT INTO holdings (user_id, symbol, quantity, average_cost, total_invested)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_query(query, (user_id, symbol, quantity, avg_price, total_invested), commit=True)


def create_order(user_id, symbol, order_type, quantity, price, total_amount):
    """Create new order"""
    query = """
        INSERT INTO orders (user_id, symbol, order_type, quantity, price, total_amount, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'completed')
    """
    return execute_query(query, (user_id, symbol, order_type, quantity, price, total_amount), commit=True)


def create_transaction(user_id, symbol, transaction_type, quantity, price, commission, total_amount):
    """Create new transaction record"""
    query = """
        INSERT INTO transactions 
        (user_id, symbol, transaction_type, quantity, price, commission, total_amount)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    return execute_query(
        query, 
        (user_id, symbol, transaction_type, quantity, price, commission, total_amount), 
        commit=True
    )


def get_watchlists(user_id):
    """Get user's watchlists"""
    query = """
        SELECT w.*, 
               (SELECT COUNT(*) FROM watchlist_items wi WHERE wi.watchlist_id = w.watchlist_id) as item_count
        FROM watchlists w
        WHERE w.user_id = %s
        ORDER BY w.is_default DESC, w.created_at ASC
    """
    return execute_query(query, (user_id,), fetch_all=True)


def get_watchlist_items(watchlist_id):
    """Get items in a watchlist"""
    query = """
        SELECT * FROM watchlist_items
        WHERE watchlist_id = %s
        ORDER BY added_at DESC
    """
    return execute_query(query, (watchlist_id,), fetch_all=True)


def add_to_watchlist(watchlist_id, symbol):
    """Add stock to watchlist"""
    # Check if already exists
    check_query = "SELECT * FROM watchlist_items WHERE watchlist_id = %s AND symbol = %s"
    existing = execute_query(check_query, (watchlist_id, symbol), fetch_one=True)
    
    if existing:
        return False  # Already in watchlist
    
    query = """
        INSERT INTO watchlist_items (watchlist_id, symbol)
        VALUES (%s, %s)
    """
    return execute_query(query, (watchlist_id, symbol), commit=True)


def remove_from_watchlist(watchlist_id, symbol):
    """Remove stock from watchlist"""
    query = """
        DELETE FROM watchlist_items
        WHERE watchlist_id = %s AND symbol = %s
    """
    return execute_query(query, (watchlist_id, symbol), commit=True)


def get_portfolio_value_history(user_id, days=30):
    """Get portfolio value history"""
    query = """
        SELECT 
            user_id,
            snapshot_date AS recorded_at,
            total_value,
            cash_balance,
            holdings_value
        FROM portfolio_snapshots
        WHERE user_id = %s AND snapshot_date >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
        ORDER BY snapshot_date ASC
    """
    return execute_query(query, (user_id, days), fetch_all=True)


def save_portfolio_snapshot(user_id, total_value, cash_balance, holdings_value):
    """Save current portfolio snapshot"""
    query = """
        INSERT INTO portfolio_snapshots (user_id, snapshot_date, total_value, cash_balance, holdings_value)
        VALUES (%s, CURDATE(), %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            total_value = VALUES(total_value),
            cash_balance = VALUES(cash_balance),
            holdings_value = VALUES(holdings_value),
            created_at = CURRENT_TIMESTAMP
    """
    return execute_query(query, (user_id, total_value, cash_balance, holdings_value), commit=True)
-- =====================================================
-- NEXUS TRADE DATABASE SCHEMA
-- Real-world stock trading platform with Yahoo Finance integration
-- =====================================================

DROP DATABASE IF EXISTS nexus_trade;
CREATE DATABASE nexus_trade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_trade;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    cash_balance DECIMAL(15,2) DEFAULT 10000.00 CHECK (cash_balance >= 0),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB;

-- =====================================================
-- WATCHLISTS TABLE
-- =====================================================
CREATE TABLE watchlists (
    watchlist_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- WATCHLIST ITEMS TABLE
-- =====================================================
CREATE TABLE watchlist_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    watchlist_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (watchlist_id) REFERENCES watchlists(watchlist_id) ON DELETE CASCADE,
    UNIQUE KEY unique_watchlist_symbol (watchlist_id, symbol),
    INDEX idx_symbol (symbol)
) ENGINE=InnoDB;

-- =====================================================
-- PRICE ALERTS TABLE
-- =====================================================
CREATE TABLE price_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL CHECK (target_price > 0),
    condition_type ENUM('above', 'below') NOT NULL,
    is_triggered BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_symbol (user_id, symbol),
    INDEX idx_active_alerts (is_active, is_triggered)
) ENGINE=InnoDB;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    order_type ENUM('market', 'limit', 'stop_loss') NOT NULL,
    side ENUM('buy', 'sell') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    limit_price DECIMAL(10,2) NULL,
    stop_price DECIMAL(10,2) NULL,
    filled_price DECIMAL(10,2) NULL,
    filled_quantity INT DEFAULT 0,
    status ENUM('pending', 'filled', 'partial', 'cancelled', 'rejected') DEFAULT 'pending',
    commission DECIMAL(10,2) DEFAULT 0.99,
    total_amount DECIMAL(15,2),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    filled_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_orders (user_id, created_at DESC),
    INDEX idx_symbol_orders (symbol, created_at DESC),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- =====================================================
-- HOLDINGS TABLE
-- =====================================================
CREATE TABLE holdings (
    holding_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    average_cost DECIMAL(10,2) NOT NULL CHECK (average_cost >= 0),
    total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
    first_purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_symbol (user_id, symbol),
    INDEX idx_user_holdings (user_id)
) ENGINE=InnoDB;

-- =====================================================
-- TRANSACTIONS TABLE (Complete history)
-- =====================================================
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    transaction_type ENUM('buy', 'sell') NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    commission DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_user_transactions (user_id, transaction_date DESC),
    INDEX idx_symbol_transactions (symbol, transaction_date DESC)
) ENGINE=InnoDB;

-- =====================================================
-- PORTFOLIO SNAPSHOTS TABLE (Daily portfolio value)
-- =====================================================
CREATE TABLE portfolio_snapshots (
    snapshot_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    cash_balance DECIMAL(15,2) NOT NULL,
    holdings_value DECIMAL(15,2) NOT NULL,
    daily_return DECIMAL(10,4),
    total_return DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, snapshot_date),
    INDEX idx_user_snapshots (user_id, snapshot_date DESC)
) ENGINE=InnoDB;

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================
CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user_audit (user_id, created_at DESC),
    INDEX idx_action (action)
) ENGINE=InnoDB;

-- =====================================================
-- USER SESSIONS TABLE (Track active sessions)
-- =====================================================
CREATE TABLE user_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_jti VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_sessions (user_id, is_active),
    INDEX idx_token (token_jti),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Update holdings after order is filled
DELIMITER //

CREATE TRIGGER after_order_filled
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    DECLARE current_quantity INT;
    DECLARE current_avg_cost DECIMAL(10,2);
    DECLARE current_total DECIMAL(15,2);
    
    -- Only process when status changes to 'filled'
    IF OLD.status != 'filled' AND NEW.status = 'filled' THEN
        
        -- Insert transaction record
        INSERT INTO transactions (user_id, order_id, symbol, transaction_type, quantity, price, commission, total_amount)
        VALUES (NEW.user_id, NEW.order_id, NEW.symbol, NEW.side, NEW.filled_quantity, NEW.filled_price, NEW.commission, NEW.total_amount);
        
        -- Handle BUY orders
        IF NEW.side = 'buy' THEN
            -- Check if holding exists
            SELECT quantity, average_cost, total_invested 
            INTO current_quantity, current_avg_cost, current_total
            FROM holdings 
            WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
            
            IF current_quantity IS NULL THEN
                -- Create new holding
                INSERT INTO holdings (user_id, symbol, quantity, average_cost, total_invested)
                VALUES (NEW.user_id, NEW.symbol, NEW.filled_quantity, NEW.filled_price, NEW.total_amount);
            ELSE
                -- Update existing holding (weighted average cost)
                UPDATE holdings
                SET quantity = current_quantity + NEW.filled_quantity,
                    total_invested = current_total + NEW.total_amount,
                    average_cost = (current_total + NEW.total_amount) / (current_quantity + NEW.filled_quantity)
                WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
            END IF;
            
            -- Deduct from cash balance
            UPDATE users
            SET cash_balance = cash_balance - NEW.total_amount
            WHERE user_id = NEW.user_id;
            
        -- Handle SELL orders
        ELSEIF NEW.side = 'sell' THEN
            -- Update holding
            UPDATE holdings
            SET quantity = quantity - NEW.filled_quantity
            WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
            
            -- Delete holding if quantity becomes 0
            DELETE FROM holdings
            WHERE user_id = NEW.user_id AND symbol = NEW.symbol AND quantity = 0;
            
            -- Add to cash balance
            UPDATE users
            SET cash_balance = cash_balance + NEW.total_amount
            WHERE user_id = NEW.user_id;
        END IF;
        
        -- Log to audit
        INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value)
        VALUES (NEW.user_id, 'ORDER_FILLED', 'orders', NEW.order_id, 
                CONCAT('Symbol: ', NEW.symbol, ', Side: ', NEW.side, ', Quantity: ', NEW.filled_quantity, ', Price: ', NEW.filled_price));
    END IF;
END//

DELIMITER ;

-- Trigger: Audit user balance changes
DELIMITER //

CREATE TRIGGER audit_balance_change
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.cash_balance != NEW.cash_balance THEN
        INSERT INTO audit_log (user_id, action, entity_type, old_value, new_value)
        VALUES (NEW.user_id, 'BALANCE_CHANGE', 'users', OLD.cash_balance, NEW.cash_balance);
    END IF;
END//

DELIMITER ;

-- Trigger: Validate sell order quantity
DELIMITER //

CREATE TRIGGER validate_sell_order
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE available_quantity INT;
    
    IF NEW.side = 'sell' THEN
        -- Check if user has enough shares
        SELECT COALESCE(quantity, 0) INTO available_quantity
        FROM holdings
        WHERE user_id = NEW.user_id AND symbol = NEW.symbol;
        
        IF available_quantity < NEW.quantity THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Insufficient shares to sell';
        END IF;
    END IF;
END//

DELIMITER ;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

-- Get user portfolio summary
DELIMITER //

CREATE PROCEDURE get_portfolio_summary(IN p_user_id INT)
BEGIN
    SELECT 
        u.cash_balance,
        COALESCE(SUM(h.quantity * h.average_cost), 0) as total_invested,
        u.cash_balance + COALESCE(SUM(h.quantity * h.average_cost), 0) as total_portfolio_value,
        COUNT(DISTINCT h.symbol) as unique_holdings
    FROM users u
    LEFT JOIN holdings h ON u.user_id = h.user_id AND h.quantity > 0
    WHERE u.user_id = p_user_id
    GROUP BY u.user_id;
END//

DELIMITER ;

-- Get user holdings with current value (price needs to be passed from application)
DELIMITER //

CREATE PROCEDURE get_user_holdings(IN p_user_id INT)
BEGIN
    SELECT 
        h.holding_id,
        h.symbol,
        h.quantity,
        h.average_cost,
        h.total_invested,
        h.first_purchased_at,
        h.last_updated_at
    FROM holdings h
    WHERE h.user_id = p_user_id AND h.quantity > 0
    ORDER BY h.total_invested DESC;
END//

DELIMITER ;

-- Get transaction history
DELIMITER //

CREATE PROCEDURE get_transaction_history(
    IN p_user_id INT,
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        t.transaction_id,
        t.symbol,
        t.transaction_type,
        t.quantity,
        t.price,
        t.commission,
        t.total_amount,
        t.transaction_date
    FROM transactions t
    WHERE t.user_id = p_user_id
    ORDER BY t.transaction_date DESC
    LIMIT p_limit OFFSET p_offset;
END//

DELIMITER ;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create a test user (password: Test@123)
INSERT INTO users (email, password_hash, full_name, cash_balance, is_verified)
VALUES (
    'demo@nexustrade.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIq0rXYfGa',  -- bcrypt hash of 'Test@123'
    'Demo User',
    10000.00,
    TRUE
);

-- Create default watchlist for demo user
INSERT INTO watchlists (user_id, name, is_default)
VALUES (1, 'My Watchlist', TRUE);

-- Add some popular stocks to demo watchlist
INSERT INTO watchlist_items (watchlist_id, symbol, notes)
VALUES 
    (1, 'AAPL', 'Apple Inc.'),
    (1, 'GOOGL', 'Alphabet Inc.'),
    (1, 'MSFT', 'Microsoft Corporation'),
    (1, 'TSLA', 'Tesla Inc.'),
    (1, 'AMZN', 'Amazon.com Inc.');

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at DESC);
CREATE INDEX idx_transactions_user_symbol ON transactions(user_id, symbol, transaction_date DESC);
CREATE INDEX idx_watchlist_items_symbol ON watchlist_items(symbol);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Active holdings with basic info
CREATE VIEW v_active_holdings AS
SELECT 
    h.user_id,
    h.symbol,
    h.quantity,
    h.average_cost,
    h.total_invested,
    h.first_purchased_at,
    u.email as user_email,
    u.full_name as user_name
FROM holdings h
JOIN users u ON h.user_id = u.user_id
WHERE h.quantity > 0;

-- View: Recent orders
CREATE VIEW v_recent_orders AS
SELECT 
    o.order_id,
    o.user_id,
    u.full_name as user_name,
    o.symbol,
    o.order_type,
    o.side,
    o.quantity,
    o.filled_quantity,
    o.limit_price,
    o.filled_price,
    o.status,
    o.commission,
    o.total_amount,
    o.created_at,
    o.filled_at
FROM orders o
JOIN users u ON o.user_id = u.user_id
ORDER BY o.created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Database schema created successfully!' AS Status;
SELECT 'Tables: 10 | Triggers: 3 | Procedures: 3 | Views: 2' AS Summary;
SELECT 'Demo user created: demo@nexustrade.com (password: Test@123)' AS Note;
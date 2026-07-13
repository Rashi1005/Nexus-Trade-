"""
Main Flask application for Nexus Trade
Stage 2 - Backend API
"""

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import logging
import os

# Config
from config import Config

# Database
from utils.database import init_connection_pool, test_connection

# Routes
from routes.auth import auth_bp
from routes.market import market_bp
from routes.watchlist import watchlist_bp
from routes.portfolio import portfolio_bp
from routes.trading import trading_bp
from routes.analytics import analytics_bp

# --------------------------------------------------
# Logging Configuration
# --------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

logger = logging.getLogger("nexus-trade")


# --------------------------------------------------
# App Factory
# --------------------------------------------------
def create_app():
    app = Flask(__name__)

    # -------------------------------
    # Load Configuration
    # -------------------------------
    app.config.from_object(Config)

    # -------------------------------
    # JWT Setup
    # -------------------------------
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({
            "success": False,
            "message": "Authorization token required"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({
            "success": False,
            "message": "Invalid token"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "Token has expired"
        }), 401

    # -------------------------------
    # CORS Setup
    # -------------------------------
    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True
    )

    # -------------------------------
    # Database Initialization
    # -------------------------------
    logger.info("Initializing database connection pool...")
    init_connection_pool()

    if not test_connection():
        logger.error("Database connection test failed")
        raise RuntimeError("Database connection failed")

    logger.info("Database connection test successful")

    # -------------------------------
    # Register Blueprints
    # -------------------------------
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(market_bp, url_prefix="/api/market")
    app.register_blueprint(watchlist_bp, url_prefix="/api/watchlist")
    app.register_blueprint(portfolio_bp, url_prefix="/api/portfolio")
    app.register_blueprint(trading_bp, url_prefix="/api/trading")
    if Config.ENABLE_ANALYTICS:
        app.register_blueprint(analytics_bp, url_prefix="/api/analytics")

    # -------------------------------
    # Root Route
    # -------------------------------
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "success": True,
            "message": "Nexus Trade API is running",
            "stage": "Stage 2",
            "version": "1.0.0"
        })

    # -------------------------------
    # Health Check
    # -------------------------------
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "success": True,
            "status": "healthy",
            "database": "connected",
        })

    return app


# --------------------------------------------------
# App Entry Point
# --------------------------------------------------
if __name__ == "__main__":
    app = create_app()

    logger.info("Starting Nexus Trade API server...")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=Config.DEBUG
    )

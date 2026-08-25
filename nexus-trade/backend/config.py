"""
Configuration file for Nexus Trade application
Loads environment variables and provides app configuration
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-please-change')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'nexus_trade')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-please-change')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Alpha Vantage API Configuration
    ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
    
    # Application Settings
    DEFAULT_COMMISSION = float(os.getenv('COMMISSION_RATE', '0.99'))
    INITIAL_BALANCE = float(os.getenv('INITIAL_BALANCE', '10000.00'))
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        required_vars = [
            'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
            'SECRET_KEY', 'JWT_SECRET_KEY', 'ALPHA_VANTAGE_API_KEY'
        ]
        
        missing = []
        for var in required_vars:
            if not os.getenv(var):
                missing.append(var)
        
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                f"Please check your .env file"
            )
    
    @staticmethod
    def get_database_uri():
        """Get database connection URI"""
        return {
            'host': Config.DB_HOST,
            'user': Config.DB_USER,
            'password': Config.DB_PASSWORD,
            'database': Config.DB_NAME,
            'cursorclass': 'DictCursor'
        }
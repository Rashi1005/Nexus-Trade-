"""
Test database connection
"""
from utils.database import test_connection

if __name__ == '__main__':
    print("=" * 60)
    print("Testing Database Connection...")
    print("=" * 60)
    
    if test_connection():
        print("✅ Database connection successful!")
        print("\nYou can now:")
        print("  1. Run test_alpha_vantage.py to test API")
        print("  2. Proceed to Stage 2 (Flask routes)")
    else:
        print("❌ Database connection failed!")
        print("\nPlease check:")
        print("  1. MySQL server is running")
        print("  2. .env file has correct credentials")
        print("  3. Database 'nexus_trade' exists")
        print("\nTo create database:")
        print("  mysql -u root -p")
        print("  CREATE DATABASE nexus_trade;")
        print("  SOURCE database/schema.sql;")
    
    print("=" * 60)
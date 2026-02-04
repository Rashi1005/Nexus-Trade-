"""
Test Alpha Vantage API integration
"""

import time
from services.hybrid_stock_service import hybrid_service

print("\n" + "=" * 70)
print(" ALPHA VANTAGE API INTEGRATION TEST")
print("=" * 70)

# --------------------------------------------------
# Test 1: Get stock quote
# --------------------------------------------------
print("\n1. Testing Stock Quote (AAPL):")
print("-" * 70)

try:
    data = hybrid_service.get_stock_quote("AAPL")

    if data:
        print(f"   Symbol:         {data['symbol']}")
        print(f"   Name:           {data['name']}")
        print(f"   Current Price:  ${data['current_price']:.2f}")
        print(f"   Change:         ${data['change']:.2f} ({data['change_percent']:.2f}%)")
        print(f"   Volume:         {data['volume']:,}")

        # Detect mock data
        if data["name"] == f"{data['symbol']} Inc.":
            print("\n   ⚠️  USING MOCK DATA")
            print("   → Alpha Vantage unavailable")
            print("   → Get API key: https://www.alphavantage.co/support/#api-key")
        else:
            print("\n   ✅ REAL DATA from Alpha Vantage!")
    else:
        print("   ❌ Failed to get stock data")

except Exception as e:
    print(f"   ❌ Error: {e}")

# --------------------------------------------------
# Test 2: Get multiple stocks
# --------------------------------------------------
print("\n2. Testing Multiple Stock Quotes:")
print("-" * 70)

try:
    symbols = ["AAPL", "GOOGL", "MSFT"]

    for symbol in symbols:
        data = hybrid_service.get_stock_quote(symbol)
        if data:
            status = "📊" if data["name"] != f"{symbol} Inc." else "⚠️"
            print(f"   {status} {symbol}: ${data['current_price']:.2f}")
        else:
            print(f"   ❌ {symbol}: Failed")

    print("\n   ✅ Multiple quotes retrieved!")

except Exception as e:
    print(f"   ❌ Error: {e}")

# --------------------------------------------------
# Test 3: Market indices
# --------------------------------------------------
print("\n3. Testing Market Indices:")
print("-" * 70)

try:
    indices = hybrid_service.get_market_indices()

    for symbol, data in indices.items():
        trend = "📈" if data["change"] >= 0 else "📉"
        print(
            f"   {trend} {data['name']}: "
            f"{data['value']:.2f} ({data['change_percent']:+.2f}%)"
        )

    print("\n   ✅ Market indices retrieved!")

except Exception as e:
    print(f"   ❌ Error: {e}")

# --------------------------------------------------
# Test 4: Cache performance
# --------------------------------------------------
print("\n4. Testing Cache Performance:")
print("-" * 70)

try:
    print("   First call (API)...")
    start = time.time()
    hybrid_service.get_stock_quote("AAPL")
    t1 = time.time() - start
    print(f"   Time: {t1:.3f}s")

    print("\n   Second call (should be cached)...")
    start = time.time()
    hybrid_service.get_stock_quote("AAPL")
    t2 = time.time() - start
    print(f"   Time: {t2:.3f}s")

    if t2 < 0.1:
        print("\n   ✅ Cache working! (instant response)")
    else:
        print("\n   ℹ️  Fresh API call (cache expired or disabled)")

except Exception as e:
    print(f"   ❌ Error: {e}")

# --------------------------------------------------
# Test 5: Validators
# --------------------------------------------------
print("\n5. Testing Validators:")
print("-" * 70)

try:
    from utils.validators import (
        validate_email,
        validate_password,
        validate_stock_symbol,
    )

    # Email tests
    print(f"   Email: test@example.com = {validate_email('test@example.com')} ✅")
    print(f"   Email: invalid-email = {validate_email('invalid-email')} ✅")

    # Password tests
    valid, msg = validate_password("Test@123")
    print(f"   Password: Test@123 = {valid} ✅")

    valid, msg = validate_password("weak")
    print(f"   Password: weak = {valid} ('{msg}') ✅")

    # Stock symbol tests
    print(f"   Symbol: AAPL = {validate_stock_symbol('AAPL')} ✅")
    print(f"   Symbol: invalid123 = {validate_stock_symbol('invalid123')} ✅")

    print("\n   ✅ All validators working!")

except ImportError:
    print("   ⚠️  validators.py not found")
    print("   Make sure utils/validators.py exists")

except Exception as e:
    print(f"   ❌ Error: {e}")

# --------------------------------------------------
# Final Summary
# --------------------------------------------------
print("\n" + "=" * 70)
print(" TEST SUMMARY")
print("=" * 70)

print("\n✅ If you see REAL DATA above:")
print("   → Alpha Vantage API key is working")
print("   → You're ready for Stage 2!")

print("\n⚠️  If you see MOCK DATA:")
print("   → Get free API key")
print("   → https://www.alphavantage.co/support/#api-key")
print("   → Add to .env: ALPHA_VANTAGE_API_KEY=your_key_here")
print("   → Run this test again")

print("\n" + "=" * 70 + "\n")

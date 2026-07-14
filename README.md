# Nexus Trade

## Prerequisites
- Python 3.12+
- Node.js 20+
- MySQL 8+
- Alpha Vantage API key

## 1) Backend setup (`nexus-trade/backend`)
```bash
cd nexus-trade/backend
pip install -r requirements.txt
```

Create `.env` in `nexus-trade/backend`:
```env
FLASK_ENV=development
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me-too
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nexus_trade
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
COMMISSION_RATE=0.99
INITIAL_BALANCE=10000.00
```

Initialize database:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p nexus_trade < database/seed_data.sql
```

Start backend:
```bash
python app.py
```
Backend runs on `http://localhost:5000`.

## 2) Frontend setup (`nexus-trade/frontend`)
```bash
cd nexus-trade/frontend
npm ci
npm run dev
```
Frontend runs on `http://localhost:5173` and talks to backend at `http://localhost:5000/api`.

## Validation commands
```bash
# Frontend
cd nexus-trade/frontend && npm run lint && npm run build

# Backend syntax check
cd nexus-trade/backend && python -m compileall .
```

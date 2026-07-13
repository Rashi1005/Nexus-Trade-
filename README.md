# Nexus Trade

Monorepo root: `/home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade`

## Backend setup
1. Create DB and load schema:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS nexus_trade;"
mysql -u root -p nexus_trade < /home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/backend/database/schema.sql
```
2. Configure env file `/home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/backend/.env`:
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nexus_trade
SECRET_KEY=change-me
JWT_SECRET_KEY=change-me
COMMISSION_RATE=0.99
ALPHA_VANTAGE_API_KEY=
ENABLE_ANALYTICS=false
```
3. Install and run:
```bash
cd /home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/backend
python -m pip install -r requirements.txt
python app.py
```

## Frontend setup
1. Configure env file `/home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```
2. Install and run:
```bash
cd /home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/frontend
npm ci
npm run dev
```

## Validation flow
After both apps are running, validate:
1. Signup / Login
2. Dashboard + Portfolio load
3. Quote/search
4. Buy/Sell
5. Holdings + cash + transactions updates

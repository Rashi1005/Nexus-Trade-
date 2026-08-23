# Nexus Trade Frontend

## Prerequisites
- Node.js 20+
- Nexus Trade backend running locally or remotely

## Environment setup
Create `/home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/frontend/.env` with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`VITE_API_BASE_URL` controls where the frontend sends API requests.

## Install and run
```bash
cd /home/runner/work/Nexus-Trade-/Nexus-Trade-/nexus-trade/frontend
npm ci
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Validation
```bash
npm run lint
npm run build
```

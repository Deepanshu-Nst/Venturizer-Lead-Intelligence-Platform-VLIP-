# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn
- A Railway account (backend hosting)
- A Vercel account (frontend hosting)
- (Optional) AWS S3 bucket for production file storage

---

## Local Development

### 1. Clone and Install

```bash
git clone <repo-url> venturizer-lead-platform
cd venturizer-lead-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/venturizer
DATABASE_SSL=false
CORS_ORIGIN=http://localhost:5173
API_KEY=dev-api-key-change-in-production
LOG_LEVEL=info
STORAGE_DRIVER=disk
UPLOAD_PATH=./uploads
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=/api/v1
```

### 3. Database Setup

```bash
# Create the database
createdb venturizer

# Run migrations
cd backend
npm run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev
# Starts on http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm run dev
# Starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3001`.

### 5. Verify

- Open `http://localhost:5173` — Landing page
- Click "For Founders" — starts founder qualification flow
- Complete the flow — submits to backend
- Navigate to `http://localhost:5173/dashboard` — ERP dashboard

---

## Production Build

### Frontend

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Backend

```bash
cd backend
npm run build
# Output: backend/dist/
```

---

## Deploy to Railway (Backend)

### 1. Create a Railway Project

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize in the backend directory
cd backend
railway init
```

### 2. Configure Environment Variables in Railway Dashboard

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | Railway PostgreSQL connection string |
| `DATABASE_SSL` | `true` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |
| `API_KEY` | Secure random string (min 8 chars) |
| `LOG_LEVEL` | `info` |
| `STORAGE_DRIVER` | `disk` (or `s3` for cloud storage) |
| `UPLOAD_PATH` | `./uploads` |

### 3. Add PostgreSQL Plugin

In Railway dashboard:
1. Click "New Plugin"
2. Select "PostgreSQL"
3. Railway auto-generates `DATABASE_URL`

### 4. Deploy

```bash
railway up
```

### 5. Run Migrations

```bash
railway run npm run migrate
```

### 6. Verify

```bash
# Health check
curl https://your-backend.railway.app/api/v1/health
# → {"status":"ok","timestamp":"...","uptime":...}
```

---

## Deploy to Vercel (Frontend)

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Configure Vercel Project

```bash
cd frontend
vercel init
```

### 3. Set Environment Variables in Vercel Dashboard

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.railway.app/api/v1` |

### 4. Configure `vercel.json` (already in `frontend/`)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routing works — all paths serve `index.html`.

### 5. Deploy

```bash
vercel --prod
```

### 6. Custom Domain (Optional)

1. Go to Vercel dashboard → Project → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `CORS_ORIGIN` in Railway to match the custom domain

---

## S3 File Storage (Production)

For production, use S3 instead of disk storage:

### 1. Create an S3 Bucket

```bash
aws s3 mb s3://venturizer-uploads --region us-east-1
```

### 2. Configure CORS on the Bucket

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-frontend.vercel.app"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"]
    }
  ]
}
```

### 3. Update Environment Variables

```env
STORAGE_DRIVER=s3
S3_REGION=us-east-1
S3_BUCKET=venturizer-uploads
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_URL_BASE=https://venturizer-uploads.s3.amazonaws.com
```

---

## CI/CD (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: venturizer_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: backend
      - run: npm run migrate
        working-directory: backend
      - run: npm test
        working-directory: backend

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend

  deploy-backend:
    needs: [test-backend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        run: npx @railway/cli up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        working-directory: backend

  deploy-frontend:
    needs: [test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        working-directory: frontend
```

---

## Post-Deployment Checklist

- [ ] Backend health check responds `200`
- [ ] Database migrations ran successfully
- [ ] Frontend loads without console errors
- [ ] Founder flow completes end-to-end
- [ ] Investor flow completes end-to-end
- [ ] File upload (PDF) works end-to-end
- [ ] Dashboard loads with summary stats
- [ ] Lead table loads with data
- [ ] Lead detail page renders scores, documents, activity
- [ ] Status changes persist and log activity
- [ ] Analytics page renders charts
- [ ] Mobile responsive on iPhone/Pixel viewports
- [ ] CORS configured correctly for frontend domain
- [ ] API key set and dashboard endpoints accessible
- [ ] File uploads stored (disk or S3) and retrievable

---

## Troubleshooting

### Frontend shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` points to correct backend
- Ensure `vercel.json` has SPA rewrite rule

### Backend 503 on /health/ready
- Check PostgreSQL connection
- Verify `DATABASE_URL` is correct
- Ensure SSL setting matches database config

### Upload fails
- Check file is PDF and under 10MB
- Verify `UPLOAD_PATH` exists and is writable
- For S3: check credentials and bucket permissions

### CORS errors
- Verify `CORS_ORIGIN` matches the exact frontend URL (including protocol and trailing slash)
- Check for https/http mismatch

# 🚀 Deployment Guide — GymFlow Pro
## Database Hosting, Backend & Frontend Deployment

> **Stack**: MongoDB Atlas · Render/Railway (Backend) · Vercel (Frontend) · Docker · GitHub Actions CI/CD
> **Version**: 1.0.0 | **Last Updated**: May 2026

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [MongoDB Atlas — Database Hosting](#2-mongodb-atlas--database-hosting)
3. [Backend Deployment — Render](#3-backend-deployment--render)
4. [Backend Deployment — Railway (Alternative)](#4-backend-deployment--railway-alternative)
5. [Frontend Deployment — Vercel](#5-frontend-deployment--vercel)
6. [Docker & Docker Compose (Self-Host)](#6-docker--docker-compose-self-host)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [CI/CD — GitHub Actions](#8-cicd--github-actions)
9. [Production Checklist](#9-production-checklist)
10. [Monitoring & Logs](#10-monitoring--logs)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                           │
│                                                             │
│   Vercel (Frontend CDN)                                     │
│   https://app.gymflowpro.com  ──────────────────────────┐  │
│                                                          │  │
│   Render / Railway (Backend API)                         │  │
│   https://api.gymflowpro.com  (port 5000)               │  │
│        │                                                 │  │
│        ├── MongoDB Atlas (Primary DB)                    │  │
│        │   mongodb+srv://cluster.mongodb.net/gymflow     │  │
│        │                                                 │  │
│        ├── Cloudinary (Image CDN)                        │  │
│        │                                                 │  │
│        ├── Firebase FCM (Push Notifications)             │  │
│        │                                                 │  │
│        └── SendGrid / Nodemailer (Email)                 │  │
│                                                          │  │
│   Socket.IO real-time events ◄──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. MongoDB Atlas — Database Hosting

> **Recommended Tier**: M10 (Production) · M0 Free Cluster (Dev/Test)

### 2.1 Create a Cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. Click **"Build a Database"** → Choose **Shared (M0 Free)** for dev or **Dedicated M10** for production.
3. Select cloud provider (**AWS**) and region (choose closest to your server — e.g., `ap-south-1` for India).
4. Name your cluster: `gymflow-prod`.

### 2.2 Create a Database User

1. Sidebar → **Database Access** → **Add New Database User**.
2. **Authentication Method**: Password.
3. Username: `gymflow_admin`
4. Password: Generate a strong password (save it securely).
5. **Built-in Role**: `Atlas Admin` (or restrict to `readWrite` on `gymflow_production` database).
6. Click **Add User**.

### 2.3 Whitelist IP Addresses

1. Sidebar → **Network Access** → **Add IP Address**.
2. For **Render/Railway**: Add `0.0.0.0/0` (allow from anywhere — Render uses dynamic IPs).
   > ⚠️ For maximum security on dedicated plans, use a static IP or VPC peering.
3. For **local dev**: Add your machine's current IP.

### 2.4 Get the Connection String

1. Sidebar → **Database** → Click **Connect** → **Connect your application**.
2. Driver: **Node.js** · Version: **5.5 or later**.
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://gymflow_admin:<password>@gymflow-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your DB user password.
5. Append the database name:
   ```
   mongodb+srv://gymflow_admin:<password>@gymflow-prod.xxxxx.mongodb.net/gymflow_production?retryWrites=true&w=majority
   ```
6. Set this as `MONGO_URI` in your backend environment variables.

### 2.5 Create Indexes (Run Once After First Deploy)

Connect via MongoDB Compass or Atlas shell and run:

```js
// Critical performance indexes
db.members.createIndex({ gymId: 1, membershipStatus: 1 })
db.members.createIndex({ memberId: 1 }, { unique: true })
db.members.createIndex({ accessPin: 1 })              // Kiosk PIN lookups

db.workout_logs.createIndex({ memberId: 1, date: -1 })
db.workout_logs.createIndex({ gymId: 1, date: -1 })

db.attendance.createIndex({ gymId: 1, checkedInAt: -1 })
db.attendance.createIndex({ memberId: 1, checkedInAt: -1 })

db.payments.createIndex({ gymId: 1, createdAt: -1 })
db.payments.createIndex({ memberId: 1, status: 1 })

db.class_sessions.createIndex({ gymId: 1, startsAt: 1 })
db.notifications.createIndex({ recipientId: 1, isRead: 1, createdAt: -1 })
```

### 2.6 Enable Automated Backups

1. Atlas sidebar → **Backup** → **Configure** (requires M10+).
2. Set **Snapshot Frequency**: Daily.
3. **Retention**: 7 days (minimum for production).
4. Enable **Point-in-Time Recovery** if on M10+.

---

## 3. Backend Deployment — Render

> **Recommended**: Render Starter plan ($7/mo) — always-on server, no cold starts.

### 3.1 Connect Repository

1. Go to [https://render.com](https://render.com) and sign in with GitHub.
2. Click **New** → **Web Service**.
3. Connect your GitHub repo: `meet252501/GYM-SAAS`.
4. Configure:
   - **Name**: `gymflow-api`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: `main`

### 3.2 Set Environment Variables on Render

In your Render service → **Environment** tab, add all variables from [Section 7](#7-environment-variables-reference).

Key ones to set immediately:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://gymflow_admin:<pass>@gymflow-prod.xxxxx.mongodb.net/gymflow_production?retryWrites=true&w=majority
JWT_SECRET=<generate-with-openssl-rand-hex-64>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-hex-64>
CLIENT_URL=https://your-app.vercel.app
USE_MEMORY_DB=false
```

### 3.3 Deploy

1. Click **Deploy** — Render will pull code, run `npm install`, and start `node server.js`.
2. Wait for the **"Your service is live"** green status.
3. Your API URL will be: `https://gymflow-api.onrender.com`
4. Test: `GET https://gymflow-api.onrender.com/health` → `{"status":"ok"}`

### 3.4 Auto-Deploy on Push

Render auto-deploys when you push to `main`. To disable:
- Service settings → **Auto-Deploy**: Off (manual deploys only).

---

## 4. Backend Deployment — Railway (Alternative)

### 4.1 Setup

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo**.
3. Select your repo, set **Root Directory** to `server`.

### 4.2 Configure

```
# Railway will auto-detect Node.js
# Set these in Railway Variables tab:
NODE_ENV=production
PORT=5000
MONGO_URI=<your-atlas-connection-string>
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
CLIENT_URL=https://your-app.vercel.app
```

### 4.3 Railway vs Render Comparison

| Feature | Render Starter | Railway Hobby |
|---------|---------------|---------------|
| Price | $7/mo | $5/mo |
| Always-on | ✅ | ✅ |
| Free tier | ✅ (sleeps) | $5 credit/mo |
| Custom domain | ✅ | ✅ |
| Logs | ✅ | ✅ |
| Auto-deploy | ✅ | ✅ |

---

## 5. Frontend Deployment — Vercel

> **Recommended**: Vercel Hobby (Free) for personal projects, Pro ($20/mo) for teams.

### 5.1 Connect Repository

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** → Import `meet252501/GYM-SAAS`.
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 5.2 Set Environment Variables on Vercel

In Vercel project → **Settings** → **Environment Variables**:

```
VITE_API_URL=https://gymflow-api.onrender.com/api/v1
VITE_SOCKET_URL=https://gymflow-api.onrender.com
```

> ⚠️ All Vite env vars **must** be prefixed with `VITE_` to be accessible in the browser bundle.

### 5.3 Configure SPA Routing

Create `client/public/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router client-side routes (`/admin/dashboard`, `/member/workout`) work on refresh.

### 5.4 Custom Domain (Optional)

1. Vercel project → **Settings** → **Domains**.
2. Add `app.gymflowpro.com`.
3. Follow DNS configuration instructions (add CNAME record in your DNS provider).

---

## 6. Docker & Docker Compose (Self-Host)

Use this for **local full-stack testing** or **VPS self-hosting** (e.g., DigitalOcean, Hetzner).

### 6.1 Project docker-compose.yml (Root Level)

```yaml
version: '3.8'

services:
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: always

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/gym_db
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - NODE_ENV=production
      - CLIENT_URL=http://localhost
      - USE_MEMORY_DB=false
    depends_on:
      - mongo
    restart: always

  client:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - server
    restart: always

volumes:
  mongo-data:
```

### 6.2 Run Locally with Docker

```bash
# From project root:

# 1. Copy and fill env vars
cp server/.env.example server/.env

# 2. Build and start all services
docker compose up --build -d

# 3. Check logs
docker compose logs -f server

# 4. Seed the database
docker compose exec server npm run seed

# 5. Stop everything
docker compose down
```

### 6.3 Server Dockerfile (server/Dockerfile)

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### 6.4 Client Dockerfile (client/Dockerfile)

```dockerfile
# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage — serve with nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 7. Environment Variables Reference

### Backend (`server/.env`)

```env
# ── App ──────────────────────────────────────────────────────
NODE_ENV=production
PORT=5000
CLIENT_URL=https://app.gymflowpro.com

# ── Database ─────────────────────────────────────────────────
MONGO_URI=mongodb+srv://gymflow_admin:<password>@gymflow-prod.xxxxx.mongodb.net/gymflow_production?retryWrites=true&w=majority

# Disable in-memory DB for production
USE_MEMORY_DB=false

# ── Authentication ───────────────────────────────────────────
JWT_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
QR_SECRET=<32-char-random-hex>

# ── Email (SendGrid SMTP) ────────────────────────────────────
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>
EMAIL_FROM=noreply@gymflowpro.com
GYM_NAME=GymFlow Pro

# ── Cloudinary (Image Storage) ───────────────────────────────
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# ── Payment Gateways ─────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=<razorpay-secret>

# ── Dodo Payments ────────────────────────────────────────────
DODO_API_KEY=sk_live_...
DODO_ENVIRONMENT=live_mode
DODO_WEBHOOK_KEY=whsec_live_...

# ── Firebase (Push Notifications) ───────────────────────────
FIREBASE_PROJECT_ID=gymflow-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@gymflow-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── AI Integrations ──────────────────────────────────────────
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
```

### Frontend (`client/.env`)

```env
VITE_API_URL=https://gymflow-api.onrender.com/api/v1
VITE_SOCKET_URL=https://gymflow-api.onrender.com
```

### Generating Secure Secrets

```bash
# On Windows PowerShell:
[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# On Linux/Mac:
openssl rand -hex 64
```

---

## 8. CI/CD — GitHub Actions

Create `.github/workflows/deploy.yml` in your repository root:

```yaml
name: Deploy GymFlow Pro

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./server
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          USE_MEMORY_DB: true

  build-frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./client
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SOCKET_URL: ${{ secrets.VITE_SOCKET_URL }}

  # Render auto-deploys on push to main (no extra step needed)
  # Vercel auto-deploys on push to main (no extra step needed)
  # Add deploy steps here only if you need manual trigger or custom logic
```

> **Note**: Both Render and Vercel have native GitHub integrations that auto-trigger deployments on push to `main`. The workflow above primarily runs tests and build validation before those deployments.

---

## 9. Production Checklist

### 🔴 Critical (Before Launch)

- [ ] `USE_MEMORY_DB=false` in production env
- [ ] `MONGO_URI` points to MongoDB Atlas (not `localhost`)
- [ ] `NODE_ENV=production` set on the server
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong (64+ char) random strings
- [ ] `CLIENT_URL` matches your actual Vercel domain (CORS enforcement)
- [ ] HTTPS active on both frontend and backend
- [ ] MongoDB Atlas Network Access configured (IP whitelist)

### 🟡 Database

- [ ] All performance indexes created (see [Section 2.5](#25-create-indexes-run-once-after-first-deploy))
- [ ] `accessPin` field indexed for kiosk lookups
- [ ] Automated daily backups enabled in Atlas
- [ ] Run `npm run seed` to initialize owner account and exercise catalog
- [ ] Test DB connection: check server startup logs for `✅ MongoDB Connected`

### 🟢 Services

- [ ] Cloudinary account connected (profile photos, exercise images)
- [ ] SendGrid / SMTP email verified and sending correctly
- [ ] Firebase FCM project configured and push notifications working
- [ ] Payment gateway keys switched from `test` → `live`
- [ ] Webhook endpoints registered in Stripe/Razorpay dashboards

### 🔵 Frontend

- [ ] `VITE_API_URL` points to production backend
- [ ] PWA manifest tested on mobile (Install prompt works)
- [ ] Google Site Verification meta tag in `index.html`
- [ ] Lighthouse score > 90 (Performance + Accessibility)
- [ ] SPA routing rewrites configured in Vercel

---

## 10. Monitoring & Logs

### Backend Logs (Winston)

The server uses **Winston** for structured logging. Logs are written to:
- **Console**: Always (all levels)
- **`server/logs/`**: File output (if configured)

View live logs on Render:
- Service dashboard → **Logs** tab → Filter by `ERROR` or `WARN`

### Health Check Endpoint

```
GET /health
→ { "status": "ok", "timestamp": "2026-05-16T11:00:00.000Z" }
```

Use this URL for uptime monitors (e.g., UptimeRobot, Better Uptime).

### MongoDB Atlas Monitoring

- Atlas sidebar → **Metrics** → View queries, connections, op counters.
- Set **Atlas Alerts** for:
  - Connections > 80% of max
  - Query targeting (slow queries)
  - Disk IOPS spikes

### Recommended Free Monitoring Stack

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| [UptimeRobot](https://uptimerobot.com) | Uptime + downtime alerts | ✅ 50 monitors |
| MongoDB Atlas Metrics | DB performance | ✅ Built-in |
| Render Logs | App logs | ✅ Built-in |
| Vercel Analytics | Frontend traffic | ✅ Built-in |

---

## 🔗 Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| Render | https://render.com | Backend hosting |
| Railway | https://railway.app | Backend alt |
| Vercel | https://vercel.com | Frontend hosting |
| Cloudinary | https://cloudinary.com | Image CDN |
| Firebase | https://console.firebase.google.com | Push notifications |
| SendGrid | https://sendgrid.com | Transactional email |
| Stripe | https://dashboard.stripe.com | Payments |
| Razorpay | https://dashboard.razorpay.com | Payments (India) |

---

*Document generated based on GymFlow Pro project structure — May 2026*

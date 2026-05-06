# 🛠️ Tech Stack & Architecture — GymFlow Pro

---

## 1. Architecture Overview

```
CLIENT (React + Vite + PWA)
        │ HTTPS / REST + WebSocket
API GATEWAY (Node.js + Express)
   │ JWT Auth │ Rate Limiting │ CORS
   ├── Auth Service
   ├── Member Service
   ├── Workout Service
   └── Analytics Service
        │
   MongoDB Atlas (Primary DB)
        │
   Redis (Cache / Rate Limit)   Cloudinary (Images)
```

---

## 2. Frontend Stack
| Tech | Version | Purpose |
|------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool |
| React Router | 6.x | Routing |
| Zustand | 4.x | Global state |
| TanStack Query | 5.x | Server state + caching |
| Recharts | 2.x | Charts |
| Framer Motion | 11.x | Animations |
| React Hook Form | 7.x | Forms |
| Zod | 3.x | Schema validation |
| QRCode.react | 3.x | QR generation |
| html5-qrcode | 2.x | QR scanning |

## 3. Backend Stack
| Tech | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | Runtime |
| Express | 4.x | HTTP framework |
| Mongoose | 8.x | MongoDB ODM |
| jsonwebtoken | 9.x | Auth tokens |
| bcryptjs | 2.x | Password hashing |
| Socket.io | 4.x | Real-time events |
| node-cron | 3.x | Scheduled jobs |
| Nodemailer | 6.x | Email |
| Stripe | 14.x | Payments |
| helmet | 7.x | Security headers |
| express-rate-limit | 7.x | Rate limiting |
| Winston | 3.x | Logging |

## 4. Infrastructure
| Tech | Purpose |
|------|---------|
| MongoDB Atlas | Primary database |
| Redis | Sessions, caching, rate limits |
| Cloudinary | Profile photos, exercise images |
| Firebase FCM | Push notifications |
| SendGrid | Transactional email |
| Stripe + Razorpay | Payment gateways |
| Docker + Docker Compose | Containerization |
| GitHub Actions | CI/CD |
| Vercel | Frontend hosting |
| Render / Railway | Backend hosting |

---

## 5. Folder Structure

### Backend `/server`
```
server/
├── src/
│   ├── config/       # db, redis, stripe, constants
│   ├── models/       # Mongoose schemas
│   ├── routes/       # Express route definitions
│   ├── controllers/  # Business logic handlers
│   ├── middleware/   # Auth, RBAC, validation, upload
│   ├── services/     # Email, payments, QR, AI, gamification
│   ├── jobs/         # Cron jobs (expiry alerts, birthdays)
│   ├── utils/        # apiResponse, logger, helpers
│   └── validators/   # Joi validators
├── server.js
├── .env.example
└── package.json
```

### Frontend `/client`
```
client/
├── src/
│   ├── components/
│   │   ├── ui/       # Button, Card, Modal, Input, Table
│   │   ├── layout/   # AdminLayout, MemberLayout, Sidebar
│   │   ├── member/   # MemberCard, MemberForm, QRModal
│   │   ├── workout/  # ExerciseCard, WorkoutLogger, RestTimer
│   │   ├── classes/  # ClassCalendar, BookingCard
│   │   └── analytics/# StatCard, RevenueChart, AttendanceChart
│   ├── pages/
│   │   ├── admin/    # Dashboard, Members, Classes, Payments
│   │   ├── member/   # Home, Workout, Progress, Profile
│   │   └── auth/     # Login, Register
│   ├── store/        # Zustand stores
│   ├── hooks/        # useAuth, useWorkout, useTimer
│   ├── api/          # Axios client + API functions
│   └── styles/       # index.css (design tokens)
└── package.json
```

---

## 6. Environment Variables (`.env.example`)

```env
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=change_me
JWT_REFRESH_SECRET=change_me_too
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# SendGrid
SENDGRID_API_KEY=
FROM_EMAIL=noreply@gymflowpro.com

# Firebase FCM
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

---

## 7. API Design Conventions

- Base path: `/api/v1/`
- Auth header: `Authorization: Bearer <token>`
- Pagination: `?page=1&limit=20`
- Filtering: `?status=active&tier=premium`
- Sorting: `?sortBy=createdAt&order=desc`
- **Success**: `{ success: true, data: {}, meta: { total, page } }`
- **Error**: `{ success: false, message: "...", errors: [] }`

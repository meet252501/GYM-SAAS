# 🚀 Sprint Roadmap — GymFlow Pro
## 12-Week Build Plan

---

## Milestones Overview

```
Week  1-2  → Foundation: Auth, DB setup, core backend
Week  3-4  → Member Management + Admin Dashboard
Week  5-6  → Workout Engine (programs, logging, PRs)
Week  7-8  → Class Scheduling + QR Check-in
Week  9-10 → Payments + Notifications
Week 11-12 → Gamification + AI + Polish + Deploy
```

---

## Sprint 1 (Week 1-2): Foundation

### Backend
- [x] Project scaffolding (Express + Mongoose)
- [/] MongoDB Atlas connection + Redis setup
- [x] User model + Auth routes (register, login, refresh, logout)
- [/] JWT middleware + RBAC middleware
- [x] Gym model + gym creation on owner register
- [x] Environment config + Helmet + Rate limiting
- [x] Error handling middleware
- [ ] Logger (Winston)
- [ ] Docker + docker-compose for local dev

### Frontend
- [x] Vite + React project setup
- [x] Design system CSS variables (index.css)
- [x] Google Fonts integration
- [x] Zustand auth store
- [x] Axios client with token interceptor
- [x] Login page (animated, dark mode)
- [x] Protected route setup
- [x] Basic layout shells (admin + member)

---

## Sprint 2 (Week 3-4): Member Management + Dashboard

### Backend
- [ ] Member model + CRUD routes
- [ ] Body metrics collection
- [ ] Membership plan model + routes
- [ ] Membership assignment + status tracking
- [ ] QR code generation (JWT-signed)
- [ ] Member ID auto-generation (GF-YYYY-NNN)
- [ ] Cron job: expiry alerts (7-day, 1-day)
- [ ] Cron job: birthday alerts
- [ ] Analytics endpoints (dashboard stats)
- [ ] Cloudinary integration for photo uploads

### Frontend
- [x] Admin sidebar + topbar layout
- [x] Dashboard page (StatCards + Charts)
- [x] Members list page (search, filter, paginate)
- [x] Add/Edit member modal
- [x] Member profile page
- [x] Digital membership card + QR modal
- [ ] Expiring members widget
- [x] Recharts: Revenue + Attendance charts

---

## Sprint 3 (Week 5-6): Workout Engine

### Backend
- [ ] Exercise library (seed 100+ exercises)
- [ ] Exercise CRUD routes (custom exercises)
- [ ] Workout program model + builder routes
- [ ] Program assignment to members
- [ ] Workout log model + routes
- [ ] Personal records auto-detection
- [ ] Volume + stats aggregation endpoint
- [ ] AI suggestion endpoint (rule-based)

### Frontend
- [ ] Exercise library browser (search, filter by muscle/equipment)
- [ ] Program builder UI (drag & drop days/exercises)
- [ ] Workout logger screen (member)
  - Set × Rep × Weight input
  - Rest timer (auto-start, configurable)
  - PR indicator (🏆 flash)
  - Volume progress bar
- [ ] Workout history calendar
- [ ] Progress charts (volume over time, PRs)
- [ ] AI suggestion card on member home

---

## Sprint 4 (Week 7-8): Classes + Attendance

### Backend
- [ ] GymClass model + CRUD
- [x] ClassSession model (recurring expansion)
- [x] Class booking routes (book, cancel, waitlist)
- [x] Attendance model + check-in routes
- [x] QR scan endpoint (JWT verify)
- [x] Manual check-in + check-out
- [x] Attendance export (CSV)
- [ ] Socket.io: live attendance board

### Frontend
- [ ] Class calendar (week view)
- [ ] Class create/edit modal
- [ ] Session roster view (trainer)
- [ ] Member class booking flow
- [ ] QR scanner (html5-qrcode for staff tablet)
- [ ] Digital membership card QR (member)
- [ ] Today's attendance board (admin)
- [ ] Attendance history table

---

## Sprint 5 (Week 9-10): Payments + Notifications

### Backend
- [ ] Razorpay order creation + verification
- [ ] Stripe payment intent flow
- [ ] Manual cash payment recording
- [ ] Invoice generation (PDF via puppeteer)
- [ ] Coupon system
- [ ] Stripe webhook handler
- [ ] Payment history routes
- [ ] Notification model + service
- [ ] Email service (SendGrid templates)
- [ ] Firebase FCM push setup
- [ ] Notification broadcast for owners

### Frontend
- [x] Payments list page (admin)
- [ ] Payment modal (Razorpay/Stripe embed)
- [ ] Invoice download button
- [ ] Payment history (member view)
- [x] Notification bell + dropdown
- [x] Notification preferences settings
- [ ] Coupon code input at checkout

---

## Sprint 6 (Week 11-12): Gamification + AI + Polish + Deploy

### Backend
- [ ] Badge definitions seed (20 badges)
- [ ] Badge award engine (trigger-based)
- [ ] Streak calculation on each check-in
- [ ] Leaderboard aggregation endpoint
- [ ] Monthly challenge model + routes
- [ ] OpenAI integration (optional, feature-flagged)
- [ ] Nutrition calculator endpoint

### Frontend
- [ ] Streak counter + flame animation (member home)
- [ ] Badge collection view
- [ ] Badge earned modal (celebration animation)
- [ ] Gym leaderboard page
- [ ] Monthly challenge card
- [ ] AI workout suggestion enhanced UI
- [ ] PWA manifest + service worker
- [ ] Full mobile responsive audit
- [ ] Micro-animation polish pass
- [ ] Loading skeletons everywhere
- [ ] Empty states design

### DevOps
- [ ] GitHub Actions CI (lint + test)
- [ ] Dockerfile for backend
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel
- [ ] MongoDB Atlas production cluster
- [ ] Redis Cloud setup
- [ ] Environment secrets management
- [ ] Domain + HTTPS setup

---

## Tech Debt / v1.1 Backlog
- [ ] Native mobile app (React Native)
- [ ] Multi-branch/franchise support
- [ ] Wearable sync (Apple Health, Google Fit)
- [ ] Video exercise library
- [ ] Advanced AI (custom fine-tuned model)
- [ ] Staff scheduling module
- [ ] Inventory management (protein, supplements)
- [ ] WhatsApp notification integration
- [ ] Referral system

---

## Definition of Done (DoD)
- Feature works end-to-end (frontend + backend)
- API endpoint has validation + error handling
- Mobile responsive (375px → 1440px)
- Consistent with design system
- No console errors in production
- Passing lint (ESLint + Prettier)

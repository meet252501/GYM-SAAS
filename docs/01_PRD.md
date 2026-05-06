# 📋 Product Requirements Document (PRD)
## GymFlow Pro — v1.0

---

## 1. Problem Statement

Current gym management solutions are either:
- Too expensive for small/mid gyms (e.g., Mindbody)
- Too basic for scaling (e.g., spreadsheet-based tracking)
- Disconnected — separate tools for payments, scheduling, and workout tracking

**GymFlow Pro** solves this with one unified platform combining gym ops + member fitness experience.

---

## 2. Goals & Non-Goals

### ✅ In Scope (v1.0)
- Multi-role auth (owner, trainer, member)
- Member CRUD with profile, photos, membership tier
- Workout program builder + AI suggestion engine
- Class scheduling with capacity management
- QR code check-in (digital membership card)
- Payment management (Stripe/Razorpay integration)
- Push notifications (birthday alerts, expiry warnings, class reminders)
- Real-time dashboard analytics
- Streak + badge gamification
- Mobile-responsive PWA

### ❌ Out of Scope (v1.0)
- Native iOS/Android apps (planned v2.0)
- Live video coaching
- Wearable integrations (v2.0)
- Franchise/multi-branch management (v3.0)

---

## 3. User Stories

### 🏢 Gym Owner
```
AS A gym owner
I WANT TO see revenue, attendance, and retention metrics at a glance
SO THAT I can make data-driven decisions to grow my business
```
```
AS A gym owner
I WANT TO set membership plans (monthly, quarterly, annual)
SO THAT members can self-enroll with automated billing
```
```
AS A gym owner
I WANT TO get alerts when a membership is about to expire
SO THAT I can proactively follow up with members
```

### 👨‍💼 Trainer / Staff
```
AS A trainer
I WANT TO create and assign workout programs to members
SO THAT I can guide them toward their fitness goals
```
```
AS A trainer
I WANT TO view today's class roster with check-in status
SO THAT I can manage attendance efficiently
```

### 💪 Member
```
AS A member
I WANT TO log my workouts with sets, reps, and weights
SO THAT I can track my progress over time
```
```
AS A member
I WANT TO see my streak, badges, and rank on the leaderboard
SO THAT I stay motivated to show up consistently
```
```
AS A member
I WANT TO book classes and receive reminders
SO THAT I never miss a session
```
```
AS A member
I WANT TO see a QR code for gym entry
SO THAT I can check in without staff assistance
```

---

## 4. Functional Requirements

### 4.1 Authentication & Authorization
| ID | Requirement |
|----|-------------|
| AUTH-01 | JWT-based auth with refresh tokens |
| AUTH-02 | Role-based access control (Owner, Trainer, Member) |
| AUTH-03 | Email + Password signup; Google OAuth optional |
| AUTH-04 | Password reset via email OTP |
| AUTH-05 | Session management with device tracking |

### 4.2 Member Management
| ID | Requirement |
|----|-------------|
| MEM-01 | Create/edit/deactivate member profiles |
| MEM-02 | Profile: name, photo, age, weight, height, goal |
| MEM-03 | Membership plan assignment and history |
| MEM-04 | Membership expiry alerts (7 days, 1 day before) |
| MEM-05 | Birthday notification automation |
| MEM-06 | Digital membership card with QR code |
| MEM-07 | Emergency contact storage |

### 4.3 Workout Engine
| ID | Requirement |
|----|-------------|
| WRK-01 | Exercise library (500+ exercises with muscle maps) |
| WRK-02 | Program builder (trainer creates multi-week plans) |
| WRK-03 | Workout logger (sets × reps × weight per exercise) |
| WRK-04 | Personal Record (PR) tracking with date |
| WRK-05 | Rest timer between sets (auto-start) |
| WRK-06 | Volume and intensity charts (weekly/monthly) |
| WRK-07 | AI-suggested next workout based on history |

### 4.4 Class Scheduling
| ID | Requirement |
|----|-------------|
| CLS-01 | Create recurring/one-time classes |
| CLS-02 | Class capacity limits with waitlist |
| CLS-03 | Member booking with cancellation window |
| CLS-04 | Trainer assignment to classes |
| CLS-05 | Calendar view (week/month) |
| CLS-06 | Push notification 1 hour before class |

### 4.5 Payments & Memberships
| ID | Requirement |
|----|-------------|
| PAY-01 | Stripe + Razorpay gateway integration |
| PAY-02 | Subscription plans (monthly/quarterly/annual) |
| PAY-03 | One-time class booking payments |
| PAY-04 | Invoice generation and email delivery |
| PAY-05 | Payment history per member |
| PAY-06 | Failed payment retry and notification |
| PAY-07 | Coupon/discount code support |

### 4.6 Attendance & Check-In
| ID | Requirement |
|----|-------------|
| ATT-01 | QR code scan for check-in (camera-based) |
| ATT-02 | Manual override check-in by staff |
| ATT-03 | Attendance history per member |
| ATT-04 | Bulk attendance report (CSV export) |

### 4.7 Analytics Dashboard
| ID | Requirement |
|----|-------------|
| ANL-01 | Total active members, new members this month |
| ANL-02 | Revenue: MRR, total revenue, pending payments |
| ANL-03 | Attendance rate chart (daily/weekly) |
| ANL-04 | Member retention and churn rate |
| ANL-05 | Top performing classes by attendance |
| ANL-06 | Member goal achievement distribution |

### 4.8 Notifications
| ID | Requirement |
|----|-------------|
| NOT-01 | In-app notification center |
| NOT-02 | Email notifications (SMTP / SendGrid) |
| NOT-03 | Push notifications via Firebase Cloud Messaging |
| NOT-04 | WhatsApp integration for expiry alerts (optional) |

### 4.9 Gamification
| ID | Requirement |
|----|-------------|
| GAM-01 | Daily check-in streak counter |
| GAM-02 | Workout streak with flame icon |
| GAM-03 | Badge system (20+ badges) |
| GAM-04 | Gym-wide leaderboard (attendance + workout volume) |
| GAM-05 | Monthly challenges with completion rewards |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | API response < 300ms for 95th percentile |
| **Scalability** | Handle 10,000 concurrent members per gym |
| **Availability** | 99.9% uptime SLA |
| **Security** | OWASP Top 10 compliance, HTTPS only |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Mobile** | Fully responsive, PWA installable |
| **Data Privacy** | GDPR-ready, data export + deletion |

---

## 6. Success Metrics

| KPI | Target |
|-----|--------|
| Member check-in rate via QR | > 80% within 30 days |
| Workout log completion rate | > 60% of members per week |
| Class booking fill rate | > 70% capacity |
| Admin time saved | -50% vs manual operations |
| App store rating (PWA) | ≥ 4.5 stars |

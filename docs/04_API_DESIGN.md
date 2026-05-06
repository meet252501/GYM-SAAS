# 🔌 REST API Design — GymFlow Pro
## All Endpoints v1.0

Base URL: `/api/v1`

---

## Auth Routes `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register owner + create gym |
| POST | `/auth/login` | Public | Login → returns access + refresh token |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Auth | Invalidate refresh token |
| POST | `/auth/forgot-password` | Public | Send OTP to email |
| POST | `/auth/reset-password` | Public | Reset with OTP |
| GET | `/auth/me` | Auth | Get current user profile |
| PATCH | `/auth/update-password` | Auth | Change password |

---

## Member Routes `/api/v1/members`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/members` | owner,trainer | List all members (paginated, filterable) |
| POST | `/members` | owner,trainer | Create new member |
| GET | `/members/:id` | owner,trainer,member(self) | Get member profile |
| PATCH | `/members/:id` | owner,trainer | Update member |
| DELETE | `/members/:id` | owner | Soft-delete member |
| GET | `/members/:id/qr` | owner,trainer,member(self) | Get QR code |
| GET | `/members/:id/metrics` | owner,trainer,member(self) | Get body metrics history |
| POST | `/members/:id/metrics` | owner,trainer,member(self) | Add body metrics snapshot |
| GET | `/members/:id/workouts` | owner,trainer,member(self) | Get workout logs |
| GET | `/members/:id/attendance` | owner,trainer,member(self) | Get attendance history |
| GET | `/members/:id/badges` | all | Get earned badges |
| GET | `/members/expiring-soon` | owner,trainer | Members expiring in 7 days |
| GET | `/members/birthdays-today` | owner,trainer | Today's birthdays |

**Query Params for GET /members:**
```
?page=1&limit=20
&status=active|expired|trial
&tier=monthly|quarterly|annual
&search=john
&sortBy=joinedAt&order=desc
```

---

## Membership Routes `/api/v1/memberships`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/memberships/plans` | auth | List membership plans |
| POST | `/memberships/plans` | owner | Create plan |
| PATCH | `/memberships/plans/:id` | owner | Update plan |
| DELETE | `/memberships/plans/:id` | owner | Deactivate plan |
| POST | `/memberships/assign` | owner,trainer | Assign plan to member |
| POST | `/memberships/renew` | owner,trainer | Renew membership |
| POST | `/memberships/cancel` | owner | Cancel membership |
| POST | `/memberships/pause` | owner | Pause membership |

---

## Workout Routes `/api/v1/workouts`

### Exercise Library
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/workouts/exercises` | auth | List exercises (filter by muscle, category) |
| GET | `/workouts/exercises/:id` | auth | Get exercise details |
| POST | `/workouts/exercises` | owner,trainer | Create custom exercise |
| PATCH | `/workouts/exercises/:id` | owner,trainer | Update exercise |

### Programs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/workouts/programs` | auth | List programs |
| POST | `/workouts/programs` | owner,trainer | Create program |
| GET | `/workouts/programs/:id` | auth | Get program details |
| PATCH | `/workouts/programs/:id` | owner,trainer | Update program |
| DELETE | `/workouts/programs/:id` | owner,trainer | Delete program |
| POST | `/workouts/programs/:id/assign` | owner,trainer | Assign to members |

### Workout Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/workouts/logs` | member | Get my logs (paginated) |
| POST | `/workouts/logs` | member | Log a workout session |
| GET | `/workouts/logs/:id` | member | Get log detail |
| PATCH | `/workouts/logs/:id` | member | Update log |
| DELETE | `/workouts/logs/:id` | member | Delete log |
| GET | `/workouts/prs` | member | Get personal records |
| GET | `/workouts/stats` | member | Volume, frequency charts |
| GET | `/workouts/ai-suggestion` | member | AI next workout suggestion |

---

## Class Routes `/api/v1/classes`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/classes` | auth | List class definitions |
| POST | `/classes` | owner,trainer | Create class |
| PATCH | `/classes/:id` | owner,trainer | Update class |
| DELETE | `/classes/:id` | owner | Delete class |
| GET | `/classes/sessions` | auth | Get sessions (date range) |
| POST | `/classes/sessions/:id/book` | member | Book a session |
| DELETE | `/classes/sessions/:id/cancel` | member | Cancel booking |
| GET | `/classes/sessions/:id/roster` | owner,trainer | Get session attendees |
| POST | `/classes/sessions/:id/mark-attendance` | owner,trainer | Mark attendance for session |
| GET | `/classes/my-bookings` | member | Get my upcoming bookings |

---

## Attendance Routes `/api/v1/attendance`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/attendance/check-in` | owner,trainer | Manual check-in |
| POST | `/attendance/qr-scan` | owner,trainer | QR code check-in |
| POST | `/attendance/check-out` | owner,trainer | Manual check-out |
| GET | `/attendance` | owner,trainer | Attendance list (date range) |
| GET | `/attendance/today` | owner,trainer | Today's check-ins |
| GET | `/attendance/export` | owner | Export CSV |
| GET | `/attendance/stats` | owner | Attendance analytics |

---

## Payment Routes `/api/v1/payments`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payments` | owner | All payments (paginated) |
| GET | `/payments/:id` | owner,member(self) | Payment detail |
| POST | `/payments/create-order` | auth | Create Razorpay/Stripe order |
| POST | `/payments/verify` | auth | Verify payment signature |
| POST | `/payments/manual` | owner | Record cash/manual payment |
| POST | `/payments/refund` | owner | Issue refund |
| GET | `/payments/member/:memberId` | owner,member(self) | Member payment history |
| GET | `/payments/invoice/:id` | owner,member(self) | Download invoice PDF |
| POST | `/payments/coupons` | owner | Create coupon |
| GET | `/payments/coupons` | owner | List coupons |
| POST | `/payments/validate-coupon` | auth | Validate coupon code |

---

## Analytics Routes `/api/v1/analytics`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/dashboard` | owner | Main dashboard stats |
| GET | `/analytics/revenue` | owner | Revenue charts (daily/weekly/monthly) |
| GET | `/analytics/members` | owner | Member growth chart |
| GET | `/analytics/attendance` | owner | Attendance heatmap data |
| GET | `/analytics/retention` | owner | Churn & retention metrics |
| GET | `/analytics/classes` | owner | Class performance stats |
| GET | `/analytics/top-members` | owner | Most active members |

**Dashboard Response Schema:**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 245,
      "active": 198,
      "newThisMonth": 23,
      "expiringSoon": 12
    },
    "revenue": {
      "mrr": 184500,
      "thisMonth": 92300,
      "lastMonth": 87100,
      "pending": 15600
    },
    "attendance": {
      "today": 47,
      "thisWeek": 312,
      "rate": 0.78
    },
    "classes": {
      "scheduledToday": 5,
      "totalBookingsToday": 67,
      "avgFillRate": 0.74
    }
  }
}
```

---

## Notification Routes `/api/v1/notifications`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notifications` | auth | My notifications |
| PATCH | `/notifications/:id/read` | auth | Mark as read |
| PATCH | `/notifications/read-all` | auth | Mark all as read |
| DELETE | `/notifications/:id` | auth | Delete notification |
| POST | `/notifications/broadcast` | owner | Send to all/segment members |
| PATCH | `/notifications/settings` | auth | Update notification preferences |

---

## Gamification Routes `/api/v1/gamification`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/gamification/badges` | auth | All available badges |
| GET | `/gamification/leaderboard` | auth | Gym leaderboard |
| GET | `/gamification/my-stats` | member | My points, streak, badges |
| GET | `/gamification/challenges` | auth | Active challenges |
| POST | `/gamification/challenges` | owner | Create challenge |
| POST | `/gamification/challenges/:id/join` | member | Join challenge |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Minimum 8 characters required" }
  ]
}
```

## Common HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (DELETE) |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

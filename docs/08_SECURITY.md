# 🔐 Security Architecture — GymFlow Pro

---

## 1. Authentication Flow

```
Client                  API Server              Database
  │                         │                      │
  ├── POST /auth/login ──→  │                      │
  │   { email, password }   │                      │
  │                    verify password hash        │
  │                         ├──────────────────→   │
  │                         │  user record         │
  │                    generate tokens             │
  │ ←── { accessToken,  ──  │                      │
  │        refreshToken }   │                      │
  │                         │                      │
  ├── API Request ────────→ │                      │
  │   Authorization:        │                      │
  │   Bearer <accessToken>  │                      │
  │                    verify JWT signature        │
  │                    check expiry (15min)        │
  │ ←── Response ─────────  │                      │
  │                         │                      │
  ├── POST /auth/refresh ─→ │                      │
  │   { refreshToken }      │                      │
  │                    verify refresh token        │
  │                    (stored in Redis, 7d)       │
  │ ←── { new accessToken } │                      │
```

---

## 2. JWT Strategy

```js
// Access Token: Short-lived (15 minutes)
const accessTokenPayload = {
  userId: user._id,
  role: user.role,
  gymId: user.gymId,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (15 * 60)
};

// Refresh Token: Long-lived (7 days), stored in Redis
const refreshTokenPayload = {
  userId: user._id,
  tokenFamily: uuidv4(),  // Rotation detection
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
};

// Redis Key: `refresh:${userId}:${tokenFamily}`
```

---

## 3. Role-Based Access Control (RBAC)

```js
// middleware/rbac.middleware.js
const PERMISSIONS = {
  owner: [
    'members:read', 'members:write', 'members:delete',
    'payments:read', 'payments:write', 'payments:refund',
    'classes:read', 'classes:write', 'classes:delete',
    'analytics:read',
    'staff:read', 'staff:write',
    'settings:read', 'settings:write',
    'notifications:broadcast'
  ],
  trainer: [
    'members:read', 'members:write',
    'classes:read', 'classes:write',
    'attendance:read', 'attendance:write',
    'workouts:read', 'workouts:write'
  ],
  member: [
    'profile:read', 'profile:write',
    'workouts:self',
    'classes:read', 'classes:book',
    'payments:self',
    'notifications:self',
    'gamification:read'
  ]
};

function authorize(...requiredPermissions) {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    const hasAll = requiredPermissions.every(p => userPermissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }
    next();
  };
}
```

---

## 4. Data Security

### Password Hashing
```js
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);
```

### Input Validation & Sanitization
```js
// All inputs validated with Joi before reaching controller
// Mongoose schemas enforce types
// Mongoose sanitize plugin prevents NoSQL injection

const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### Security Headers (Helmet)
```js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"]
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true,
  xssFilter: true
}));
```

### Rate Limiting
```js
// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests' }
});

// Auth endpoints - stricter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true
});
```

---

## 5. Data Privacy (GDPR-Ready)

| Requirement | Implementation |
|-------------|---------------|
| Data export | `GET /api/v1/members/:id/export` → JSON/PDF |
| Right to delete | Soft delete + anonymization after 30 days |
| Consent | Accept ToS flag on registration |
| Data minimization | Only collect fields needed per feature |
| Audit log | All member data changes logged with userId + timestamp |
| Encryption at rest | MongoDB Atlas encryption enabled |
| Encryption in transit | HTTPS only (TLS 1.3) |

---

## 6. Payment Security

- Never store raw card numbers (handled by Stripe/Razorpay)
- Webhook signature verification for all payment events
- Idempotency keys on all payment creation requests
- Payment amounts validated server-side (never trust client)

```js
// Stripe webhook verification
app.post('/api/v1/payments/webhook', 
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle event...
  }
);
```

---

## 7. QR Code Security

- QR codes encode a **signed JWT token** (not raw member ID)
- Token contains: `{ memberId, gymId, purpose: 'checkin', exp: +1hour }`
- Staff scanner verifies token signature before allowing check-in
- Prevents forged/shared QR codes

```js
// Generate check-in QR
function generateQRToken(memberId, gymId) {
  return jwt.sign(
    { memberId, gymId, purpose: 'checkin' },
    process.env.QR_SECRET,
    { expiresIn: '1h' }
  );
}
```

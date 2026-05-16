# 🏗️ GymFlow Pro — Hosting Strategy (20 Gyms, Multi-Tenant SaaS)

> **Scenario**: Up to 20 gym tenants · Member PWA must not lag · Data must be safe
> **Goal**: Find the best hosting + database stack for this exact scale

---

## 🔍 Your Requirements Summary

| Requirement | Detail |
|---|---|
| Tenants | Up to 20 gyms |
| Users | ~50–500 members per gym (~10,000 max total) |
| Data safety | Critical — member data, payments, attendance |
| Performance | PWA must feel instant, no lag |
| Cost | As low as possible |
| Type | Web app (PWA), not native mobile |

---

## 🏆 Ranked Options (Best → Worst for Your Use Case)

---

### 🥇 Option 1 — PocketBase on a VPS (BEST FOR YOU)

**What it is**: A single Go binary that includes database (SQLite), auth, file storage, real-time, and admin UI — all in one file. Self-hosted on a cheap VPS.

```
Cloudflare Pages (Frontend PWA)         ← Free, unlimited bandwidth, fastest in India
         │ HTTPS API calls
         ▼
 Hetzner VPS €4/mo (CX11)              ← 2 vCPU, 2GB RAM, 40GB SSD (Germany/Singapore)
 ┌─────────────────────────────────┐
 │  Caddy (reverse proxy + HTTPS)  │   ← Automatic SSL, free
 │  PocketBase (single binary)     │   ← DB + Auth + Storage + Realtime
 │  Litestream (auto DB backup)    │   ← Continuous backup to Cloudflare R2 (free)
 └─────────────────────────────────┘
         │
 Cloudflare R2 (backup storage)         ← 10GB free, SQLite backups every 1 minute
```

**Multi-tenant setup**: One PocketBase instance, all 20 gyms share it with `gymId` field isolation + API rules (like your current MongoDB `gymId` approach — no change needed in logic).

**Cost Breakdown**:
| Service | Cost |
|---|---|
| Hetzner CX11 VPS (2 vCPU, 2GB) | €3.79/mo (~₹340/mo) |
| Cloudflare Pages (Frontend) | Free |
| Cloudflare R2 (DB Backups) | Free (10GB) |
| Domain (optional) | ~₹800/year |
| **Total** | **~₹340/month** |

**Why it's the best for your scale**:
- ✅ 20 gyms on a €4 VPS = overkill capacity (PocketBase handles 10,000+ realtime connections)
- ✅ SQLite = insanely fast reads, no network round-trip to separate DB server
- ✅ Litestream = continuous DB backup every 60 seconds to cloud storage
- ✅ Zero vendor lock-in — your data is a plain `.db` file you can download any time
- ✅ Built-in admin dashboard for managing all 20 gyms
- ✅ Real-time subscriptions built-in (replaces Socket.IO)
- ❌ Requires migrating from MongoDB/Mongoose to PocketBase SDK (work involved)

---

### 🥈 Option 2 — Keep Express Backend + MongoDB Atlas M0 (EASIEST — Zero Migration)

**What it is**: Your existing codebase deployed as-is. Zero code changes.

```
Cloudflare Pages (Frontend PWA)         ← Free, fastest in India
         │
Render.com (Express Backend)            ← Free tier (cold start) OR $7/mo (always on)
         │
MongoDB Atlas M0 (Database)             ← FREE forever, 512MB
```

**Cost Breakdown**:
| Service | Cost |
|---|---|
| Cloudflare Pages | Free |
| Render (free tier) | Free (30s cold start) |
| Render (starter, no cold start) | $7/mo (~₹580/mo) |
| MongoDB Atlas M0 | Free |
| **Total (with always-on)** | **~₹580/month** |

**Reality check for 20 gyms + 512MB Atlas M0**:

| Data | Estimated Size |
|---|---|
| 20 gyms × 200 members each = 4,000 members | ~16MB |
| 1 year of workout logs | ~40MB |
| Attendance records | ~20MB |
| Payments | ~10MB |
| **Total** | **~86MB** — well under 512MB ✅ |

**Why this works**:
- ✅ Zero code changes — deploy today
- ✅ Your full Express + Mongoose stack works as-is
- ✅ Free MongoDB tier is more than enough for 20 gyms
- ❌ Render free tier has 30s cold start (fix: $7/mo starter plan)
- ❌ Slightly more latency than PocketBase (DB is separate from server)

---

### 🥉 Option 3 — Supabase (PostgreSQL BaaS)

**What it is**: Open-source Firebase alternative, hosted PostgreSQL with auth, realtime, storage.

```
Cloudflare Pages → Supabase (DB + Auth + Realtime + Storage)
```

**Free tier limits**:
| Limit | Value |
|---|---|
| Storage | 500MB |
| Monthly Active Users | 50,000 |
| Bandwidth | 5GB |
| **Inactivity pause** | ⚠️ Pauses after 1 week of no use (DEALBREAKER for production) |
| Backups | ❌ None on free tier |

**Cost for production**:
- Free tier → fine for dev/testing
- **Pro plan = $25/mo** (~₹2,100/mo) needed for always-on + backups

**Why it's 3rd**:
- ✅ Excellent multi-tenancy via Row Level Security (RLS)
- ✅ SQL is more powerful than MongoDB for relational gym data
- ❌ Requires full rewrite from Mongoose to Supabase client
- ❌ Free tier pauses (not suitable for live gym app)
- ❌ $25/mo for production — most expensive of the options

---

### Option 4 — Firebase Firestore

**Not recommended** for your use case:
- ❌ High vendor lock-in (Google can change pricing anytime)
- ❌ NoSQL but not document-model like MongoDB — complex queries are painful
- ❌ Multi-tenancy is complex and must be done manually
- ❌ "Bill shock" risk if any gym goes viral

---

### Option 5 — Turso (Edge SQLite)

**Interesting but overkill** for 20 gyms:
- ✅ Database-per-tenant model (one SQLite DB per gym = perfect isolation)
- ✅ Blazing fast edge reads globally
- ✅ Free tier: 100 databases, 5GB storage
- ❌ Requires full rewrite to Turso/LibSQL client
- ❌ Best fit when you have 100+ tenants, not 20

---

## 🎯 Final Recommendation

### If you want to launch FAST (this week) → **Option 2**

```bash
# No code changes needed. Just:
# 1. Set up MongoDB Atlas M0 (free)
# 2. Deploy server to Render
# 3. Deploy client to Cloudflare Pages
# Done in 2-3 hours.
```

### If you want the best long-term solution → **Option 1 (PocketBase)**

```bash
# Better performance, lower cost, safer data
# But requires 1-2 weeks of migration work
```

---

## ⚡ PWA Performance — How to Make It Feel Instant

Regardless of which backend you choose, the PWA speed comes from:

### 1. Cloudflare Pages for Frontend
- 300+ edge locations globally
- Serves your React bundle from a server within 10-50ms of any Indian city
- Unlimited bandwidth (free)

### 2. Service Worker Caching (Already in your app via vite-plugin-pwa)
```
First load:  App downloads and caches all assets
Every load after: App loads from cache = INSTANT
Data: Load stale data from cache, refresh in background (stale-while-revalidate)
```

### 3. PWA Offline Strategy
```
Member opens app on slow/no internet:
  → Loads from Service Worker cache (instant)
  → Shows cached workout/schedule data
  → Syncs with server when connection returns
```

### 4. For member-facing pages — cache these aggressively:
- Workout schedule
- Class timetable
- Their own profile
- Exercise library

---

## 📊 Side-by-Side Final Comparison

| | PocketBase VPS | Express + Atlas M0 | Supabase Pro |
|---|---|---|---|
| **Monthly Cost** | ~₹340 | ~₹580 | ~₹2,100 |
| **Migration Work** | High | None | High |
| **Data Safety** | ✅ Litestream backups | ✅ Atlas backups | ✅ Daily backups |
| **Performance** | ⚡ Fastest | ✅ Good | ✅ Good |
| **Multi-tenant** | ✅ gymId rules | ✅ gymId (already done) | ✅ RLS |
| **Realtime** | ✅ Built-in | ✅ Socket.IO | ✅ Built-in |
| **Vendor Lock-in** | ❌ None | Partial (Atlas) | Partial |
| **Launch Speed** | 1-2 weeks | **Today** | 2-3 weeks |
| **Scale ceiling** | 20-50 gyms | 20-100 gyms | 20-500 gyms |

---

## 🔐 Data Safety Checklist (All Options)

- [ ] Automated daily backups enabled
- [ ] Backup stored in a **different provider** than your main host
- [ ] Test restore procedure (actually restore a backup once)
- [ ] Each gym's data isolated by `gymId` with enforced API rules
- [ ] HTTPS everywhere (SSL on all endpoints)
- [ ] JWT secrets are long random strings (not default values)

---

*Research conducted May 2026 — GymFlow Pro Deployment Strategy*

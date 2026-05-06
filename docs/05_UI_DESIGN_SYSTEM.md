# 🎨 UI Design System — GymFlow Pro
## Design Tokens, Components & Patterns

---

## 1. Design Philosophy

**Dark Mode First** — gym environments have low lighting. High contrast, dark UI reduces eye strain.
**Accent: Amber/Green** — energetic, readable, gym-coded.
**Motion** — subtle animations make it feel alive without distraction.
**Density** — information-dense admin views; clean, focused member views.

---

## 2. Color System

```css
:root {
  /* === BRAND COLORS === */
  --color-primary: #F59E0B;         /* Amber 500 — main accent */
  --color-primary-light: #FCD34D;   /* Amber 300 */
  --color-primary-dark: #D97706;    /* Amber 600 */

  --color-success: #10B981;         /* Emerald 500 */
  --color-success-light: #34D399;
  --color-danger: #EF4444;          /* Red 500 */
  --color-warning: #F97316;         /* Orange 500 */
  --color-info: #3B82F6;            /* Blue 500 */

  /* === NEUTRAL PALETTE (Dark Mode Base) === */
  --color-bg: #0A0A0B;              /* Near black */
  --color-surface: #111113;         /* Cards, panels */
  --color-surface-2: #18181B;       /* Elevated cards */
  --color-surface-3: #27272A;       /* Hover states, borders */
  --color-border: #3F3F46;          /* Subtle borders */
  --color-border-light: #52525B;

  /* === TEXT === */
  --color-text-primary: #FAFAFA;    /* Main text */
  --color-text-secondary: #A1A1AA;  /* Muted text */
  --color-text-muted: #71717A;      /* Placeholder, hint */
  --color-text-disabled: #52525B;

  /* === GRADIENTS === */
  --gradient-primary: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  --gradient-success: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
  --gradient-surface: linear-gradient(135deg, #111113 0%, #1C1C1F 100%);
  --gradient-card: linear-gradient(145deg, rgba(245,158,11,0.1) 0%, rgba(0,0,0,0) 100%);

  /* === AMBER TINTED SURFACES === */
  --color-primary-surface: rgba(245, 158, 11, 0.08);
  --color-primary-border: rgba(245, 158, 11, 0.2);
  --color-success-surface: rgba(16, 185, 129, 0.08);
  --color-danger-surface: rgba(239, 68, 68, 0.08);
}
```

---

## 3. Typography

```css
/* Google Fonts: Inter + Outfit */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800;900&display=swap');

:root {
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Outfit', 'Inter', sans-serif;

  /* === SCALE === */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* === WEIGHT === */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;

  /* === LINE HEIGHT === */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

---

## 4. Spacing & Layout

```css
:root {
  /* === SPACING SCALE (4px base) === */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  /* === BORDER RADIUS === */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-2xl: 28px;
  --radius-full: 9999px;

  /* === SHADOWS === */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);
  --shadow-glow-amber: 0 0 20px rgba(245,158,11,0.25);
  --shadow-glow-green: 0 0 20px rgba(16,185,129,0.25);

  /* === LAYOUT === */
  --sidebar-width: 260px;
  --sidebar-collapsed: 72px;
  --topbar-height: 64px;
  --content-max-width: 1280px;
}
```

---

## 5. Animation Tokens

```css
:root {
  /* === TRANSITIONS === */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === COMMON ANIMATIONS === */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(245,158,11,0.2); }
  50%       { box-shadow: 0 0 25px rgba(245,158,11,0.5); }
}
@keyframes streak-flame {
  0%, 100% { transform: scale(1) rotate(-3deg); }
  50%       { transform: scale(1.1) rotate(3deg); }
}
```

---

## 6. Component Patterns

### Stat Card (Admin Dashboard)
```html
<div class="stat-card">
  <div class="stat-card__icon">👥</div>
  <div class="stat-card__content">
    <span class="stat-card__value">245</span>
    <span class="stat-card__label">Active Members</span>
    <span class="stat-card__change stat-card__change--up">+12% vs last month</span>
  </div>
</div>
```
```css
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  transition: var(--transition-base);
  animation: fadeIn 0.4s ease;
}
.stat-card:hover {
  border-color: var(--color-primary-border);
  background: var(--color-surface-2);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-amber);
}
.stat-card__value {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-black);
  color: var(--color-text-primary);
}
.stat-card__change--up { color: var(--color-success); }
.stat-card__change--down { color: var(--color-danger); }
```

### Member Card (Digital ID)
```css
.member-card {
  background: linear-gradient(145deg, #1A1A1D, #27272A);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}
.member-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
  pointer-events: none;
}
```

### Rest Timer (Workout Screen)
```css
.rest-timer {
  background: var(--color-surface-2);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-full);
  width: 160px;
  height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: pulse-glow 2s infinite;
}
.rest-timer__count {
  font-family: var(--font-display);
  font-size: var(--text-4xl);
  font-weight: var(--font-black);
  color: var(--color-primary);
}
```

### Badge Component
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}
.badge--active { background: var(--color-success-surface); color: var(--color-success); }
.badge--expired { background: var(--color-danger-surface); color: var(--color-danger); }
.badge--trial { background: var(--color-primary-surface); color: var(--color-primary); }
.badge--legendary { 
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  color: white;
  box-shadow: 0 2px 8px rgba(245,158,11,0.4);
}
```

### Button System
```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: var(--transition-base);
  border: none;
  outline: none;
}
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 4px 12px rgba(245,158,11,0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245,158,11,0.4);
}
.btn-secondary {
  background: var(--color-surface-3);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn-ghost:hover { background: var(--color-surface-3); color: var(--color-text-primary); }
.btn-danger {
  background: var(--color-danger-surface);
  color: var(--color-danger);
  border: 1px solid rgba(239,68,68,0.3);
}
```

---

## 7. Page Layouts

### Admin Layout
```
┌─ Sidebar (260px) ─────┬─ Main Content ─────────────────┐
│                       │  Topbar (64px)                 │
│  Logo                 │  ────────────────────────────  │
│  ──────────────────   │                                │
│  📊 Dashboard         │  Page Content                  │
│  👥 Members           │                                │
│  🏋️ Classes           │                                │
│  💳 Payments          │                                │
│  📈 Analytics         │                                │
│  ⚙️ Settings          │                                │
│                       │                                │
│  [Staff section]      │                                │
└───────────────────────┴────────────────────────────────┘
```

### Member Layout (Mobile-first)
```
┌─ App Shell ───────────────────┐
│  ← Back    [GymFlow Pro]  🔔  │  ← Topbar
│  ─────────────────────────── │
│                               │
│  Page Content                 │
│                               │
│  ─────────────────────────── │
│  🏠    🏋️    📅    📊    👤   │  ← Bottom nav
└───────────────────────────────┘
```

---

## 8. Key Screens Reference

| Screen | Key Components |
|--------|---------------|
| Admin Dashboard | StatCards (4), RevenueChart, AttendanceHeatmap, ExpiringMembers, TodayClasses |
| Member List | SearchBar, FilterBar, MemberTable (paginated), AddMemberModal |
| Member Profile | Avatar, InfoGrid, MembershipCard, AttendanceTimeline, WorkoutHistory |
| Workout Logger | ExerciseList, SetLogger, RestTimer (auto-start), PRIndicator, VolumeBar |
| Class Calendar | WeekView, ClassCard, BookingModal, CapacityIndicator |
| Member Mobile Home | StreakCounter, NextClass, WorkoutPrompt, RecentBadge, QuickCheckin |
| Digital Membership Card | QRCode, MemberInfo, MembershipTier, ValidityBar |

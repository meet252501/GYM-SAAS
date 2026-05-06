# ⚙️ Feature Specifications — GymFlow Pro

---

## F-01: QR Code Check-In System

**Description**: Members get a digital membership card with a QR code. Staff scan it at the entrance to record attendance.

**Flow**:
1. Member opens app → taps "My Card"
2. App fetches signed QR token (1-hour expiry) from server
3. Staff's tablet camera scans QR
4. Server verifies JWT signature + expiry + membership status
5. If valid → record attendance, increment streak, return success
6. If invalid → show error with reason (expired, suspended, etc.)

**Edge Cases**:
- QR expired → member taps "Refresh QR" → new token issued
- No internet on staff tablet → offline mode with last-known token (24h cache)
- Membership expired → deny entry, show renewal prompt to member

---

## F-02: Workout Logger with Rest Timer

**Description**: Members log exercises in real-time during their workout session.

**Flow**:
1. Member starts a workout (from program or free-style)
2. For each exercise → logs Set × Reps × Weight
3. On set completion → rest timer auto-starts (default 90s, customizable)
4. Timer shows full-screen countdown with pulse animation
5. Alert sound + vibration at 0s
6. If weight/reps beats previous best → PR badge flashes 🏆
7. On session complete → shows summary (total volume, duration, PRs)

**PR Detection Logic**:
```
For each exercise in session:
  query personal_records where exerciseId = X
  if current weight > best weight for same or more reps → new PR
```

---

## F-03: Membership Expiry Alert System

**Description**: Automated alerts sent before membership expires.

**Schedule** (cron: runs daily at 9:00 AM gym timezone):
```
1. Query members WHERE endDate = today + 7 days → send "7 days left" alert
2. Query members WHERE endDate = today + 1 day  → send "Last day!" alert
3. Query members WHERE endDate = yesterday      → mark status = 'expired'
                                                → notify owner
```

**Alert Channels**: In-app + Push (FCM) + Email

---

## F-04: Badge System

### Badge Catalog (20 Badges)

| Badge | Icon | Category | Criteria |
|-------|------|----------|----------|
| Early Bird | 🌅 | Attendance | Check in before 7am, 5 times |
| Iron Will | 🔩 | Streak | 7-day streak |
| Unstoppable | 🔥 | Streak | 30-day streak |
| Legend | 👑 | Streak | 100-day streak |
| First Workout | 💪 | Milestone | Complete first workout log |
| Century Club | 💯 | Milestone | 100 workouts logged |
| Class Act | 🎓 | Classes | Attend 10 classes |
| PR Machine | 🏆 | Workout | Set 10 personal records |
| Volume King | 📊 | Workout | Log 10,000kg total volume |
| Consistent | ✅ | Attendance | Attend 4 weeks in a row |
| Social Butterfly | 🦋 | Social | Join a challenge |
| Challenge Champ | 🥇 | Social | Complete a monthly challenge |
| New Year New Me | 🎆 | Seasonal | First workout in January |
| Comeback Kid | 🔄 | Milestone | Return after 14+ day gap |
| Marathon Man | 🏃 | Cardio | Log 100km total cardio |
| Heavy Lifter | 🏋️ | Strength | Bench/squat/deadlift 100kg |
| Nutrition Tracker | 🥗 | Nutrition | Log meals for 7 days |
| Goal Crusher | 🎯 | Milestone | Achieve initial body goal |
| Member of Month | ⭐ | Social | Top of gym leaderboard |
| Founding Member | 🏅 | Milestone | Joined in first 30 days |

---

## F-05: Analytics Dashboard

### Key Widgets

**1. Overview Stats (top row)**
- Total Members | Active Members | New This Month | Expiring Soon

**2. Revenue Panel**
- MRR (Monthly Recurring Revenue)
- This month vs last month (% change)
- Bar chart: daily revenue (last 30 days)
- Pending collections amount

**3. Attendance Heatmap**
- GitHub-style calendar heatmap
- Color intensity = check-in count
- Hover → exact count for that day

**4. Member Growth Chart**
- Line chart: cumulative members over 12 months
- Secondary line: churn (cancelled memberships)

**5. Class Performance**
- Table: Top 5 classes by attendance fill rate
- Avg fill rate gauge chart

**6. Goal Distribution**
- Donut chart: member goals (weight loss, muscle, etc.)

**7. Today's At-a-Glance**
- Checked in today: N / total active
- Classes today: N sessions, N bookings
- Birthdays today: [Member names]
- Expiring today: [Member names]

---

## F-06: Leaderboard

**Ranking Formula:**
```
score = (attendance_this_month × 10) 
      + (workouts_logged_this_month × 15)
      + (streak_days × 5)
      + (badges_earned × 20)
      + (challenge_completions × 50)
```

**Display**: Top 10 members with avatar, name (partially anonymized for privacy), score, rank change (↑↓)

**Reset**: Monthly (1st of each month)

---

## F-07: Class Scheduling

### Recurring Class Generation
When a recurring class is created:
1. Generate `ClassSession` documents for next 3 months
2. New sessions auto-generated via weekly cron job
3. Individual sessions can be modified/cancelled without affecting series

### Waitlist Logic
```
On booking:
  IF session.bookedCount < class.capacity
    → create booking (status: 'booked'), increment bookedCount
  ELSE
    → create booking (status: 'waitlisted'), increment waitlistCount

On cancellation:
  → mark booking 'cancelled', decrement bookedCount
  → IF waitlist exists
    → promote first waitlisted to 'booked', send notification
```

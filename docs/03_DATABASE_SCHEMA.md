# 🗄️ Database Schema — GymFlow Pro
## MongoDB Collections (Mongoose)

---

## 1. User (Auth)
```js
// users collection
{
  _id: ObjectId,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'trainer', 'member'], default: 'member' },
  gymId: { type: ObjectId, ref: 'Gym' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: String,
  fcmToken: String,               // Firebase push token
  createdAt: Date,
  updatedAt: Date
}
```

## 2. Gym (Multi-gym support)
```js
// gyms collection
{
  _id: ObjectId,
  name: String,
  logo: String,                   // Cloudinary URL
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'IN' }
  },
  phone: String,
  email: String,
  website: String,
  ownerId: { type: ObjectId, ref: 'User' },
  settings: {
    timezone: { type: String, default: 'Asia/Kolkata' },
    currency: { type: String, default: 'INR' },
    workingHours: {
      open: { type: String, default: '06:00' },
      close: { type: String, default: '22:00' }
    }
  },
  subscription: {
    plan: { type: String, enum: ['starter', 'pro', 'enterprise'] },
    expiresAt: Date
  },
  createdAt: Date
}
```

## 3. Member Profile
```js
// members collection
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', unique: true },
  gymId: { type: ObjectId, ref: 'Gym' },
  
  // Personal Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  photo: String,                  // Cloudinary URL
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Fitness Profile
  goal: { 
    type: String, 
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']
  },
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  
  // Body Metrics (latest snapshot — history in BodyMetric collection)
  currentMetrics: {
    weight: Number,               // kg
    height: Number,               // cm
    bmi: Number,
    bodyFatPercent: Number,
    updatedAt: Date
  },
  
  // Member Card
  memberId: { type: String, unique: true },  // e.g., GF-2024-001
  qrCode: String,                             // Base64 or Cloudinary URL
  
  // Membership
  currentMembershipId: { type: ObjectId, ref: 'Membership' },
  membershipStatus: { 
    type: String, 
    enum: ['active', 'expired', 'suspended', 'trial'],
    default: 'trial'
  },
  
  // Gamification
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastCheckIn: Date
  },
  totalPoints: { type: Number, default: 0 },
  
  joinedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 4. Membership Plan & Subscription
```js
// membership_plans collection (templates created by gym owner)
{
  _id: ObjectId,
  gymId: { type: ObjectId, ref: 'Gym' },
  name: String,                   // e.g., "Monthly Premium"
  description: String,
  duration: {
    value: { type: Number, required: true },  // e.g., 1, 3, 12
    unit: { type: String, enum: ['day', 'week', 'month', 'year'] }
  },
  price: { type: Number, required: true },    // in paise/cents
  currency: { type: String, default: 'INR' },
  features: [String],             // ["Unlimited classes", "Locker access"]
  isActive: { type: Boolean, default: true },
  stripeProductId: String,
  stripePriceId: String,
  createdAt: Date
}

// memberships collection (actual member subscriptions)
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  gymId: { type: ObjectId, ref: 'Gym' },
  planId: { type: ObjectId, ref: 'MembershipPlan' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'paused'],
    default: 'active'
  },
  paymentId: { type: ObjectId, ref: 'Payment' },
  autoRenew: { type: Boolean, default: false },
  pausedAt: Date,
  pauseDuration: Number,          // days
  createdAt: Date
}
```

## 5. Exercise Library
```js
// exercises collection
{
  _id: ObjectId,
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { 
    type: String, 
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'plyometric', 'sport']
  },
  primaryMuscle: [String],        // ['chest', 'triceps']
  secondaryMuscle: [String],      // ['shoulders']
  equipment: [String],            // ['barbell', 'bench']
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  instructions: [String],         // Step-by-step array
  tips: [String],
  videoUrl: String,
  imageUrl: String,
  isCustom: { type: Boolean, default: false },
  gymId: ObjectId,                // null = global library
  createdAt: Date
}
```

## 6. Workout Program & Logs
```js
// workout_programs collection (trainer-created plans)
{
  _id: ObjectId,
  gymId: { type: ObjectId, ref: 'Gym' },
  createdBy: { type: ObjectId, ref: 'User' },
  name: { type: String, required: true },
  description: String,
  goal: String,
  durationWeeks: Number,
  daysPerWeek: Number,
  weeks: [{
    weekNumber: Number,
    days: [{
      dayNumber: Number,
      label: String,              // e.g., "Push Day"
      exercises: [{
        exerciseId: { type: ObjectId, ref: 'Exercise' },
        sets: Number,
        reps: String,             // "8-12" or "AMRAP"
        restSeconds: Number,
        notes: String
      }]
    }]
  }],
  assignedMembers: [{ type: ObjectId, ref: 'Member' }],
  isPublic: { type: Boolean, default: false },
  createdAt: Date
}

// workout_logs collection (member's actual session)
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  gymId: { type: ObjectId, ref: 'Gym' },
  programId: { type: ObjectId, ref: 'WorkoutProgram' },
  date: { type: Date, required: true },
  label: String,                  // "Push Day - Week 1"
  duration: Number,               // minutes
  notes: String,
  exercises: [{
    exerciseId: { type: ObjectId, ref: 'Exercise' },
    exerciseName: String,         // denormalized for speed
    sets: [{
      setNumber: Number,
      reps: Number,
      weight: Number,             // kg
      rpe: Number,                // Rate of perceived exertion 1-10
      isWarmup: Boolean,
      isPR: Boolean,
      completedAt: Date
    }]
  }],
  totalVolume: Number,            // sum(reps × weight)
  caloriesBurned: Number,
  mood: { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'] },
  createdAt: Date
}

// personal_records collection
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  exerciseId: { type: ObjectId, ref: 'Exercise' },
  exerciseName: String,
  value: Number,                  // weight in kg, or time in seconds
  reps: Number,
  type: { type: String, enum: ['1rm', 'max_reps', 'timed'] },
  logId: { type: ObjectId, ref: 'WorkoutLog' },
  achievedAt: Date
}
```

## 7. Body Metrics History
```js
// body_metrics collection
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  weight: Number,
  height: Number,
  bmi: Number,
  bodyFatPercent: Number,
  chest: Number,                  // cm measurements
  waist: Number,
  hips: Number,
  arms: Number,
  thighs: Number,
  photo: String,                  // Progress photo
  notes: String,
  recordedAt: { type: Date, required: true },
  createdAt: Date
}
```

## 8. Classes & Bookings
```js
// gym_classes collection
{
  _id: ObjectId,
  gymId: { type: ObjectId, ref: 'Gym' },
  trainerId: { type: ObjectId, ref: 'User' },
  name: { type: String, required: true },
  description: String,
  category: { type: String, enum: ['yoga', 'hiit', 'zumba', 'spinning', 'boxing', 'pilates', 'strength', 'other'] },
  duration: Number,               // minutes
  capacity: { type: Number, required: true },
  location: String,               // "Studio A" or "Main Floor"
  color: String,                  // Hex color for calendar
  
  // Scheduling
  schedule: {
    type: { type: String, enum: ['one_time', 'recurring'] },
    startDate: Date,
    endDate: Date,                // null for ongoing recurring
    recurrence: {
      days: [Number],             // 0=Sun, 1=Mon...6=Sat
      time: String,               // "07:30"
    }
  },
  
  price: { type: Number, default: 0 },  // 0 = included in membership
  isActive: { type: Boolean, default: true },
  createdAt: Date
}

// class_sessions collection (individual instances)
{
  _id: ObjectId,
  classId: { type: ObjectId, ref: 'GymClass' },
  gymId: { type: ObjectId, ref: 'Gym' },
  trainerId: { type: ObjectId, ref: 'User' },
  startsAt: { type: Date, required: true },
  endsAt: Date,
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  bookedCount: { type: Number, default: 0 },
  waitlistCount: { type: Number, default: 0 },
  cancelReason: String,
  createdAt: Date
}

// class_bookings collection
{
  _id: ObjectId,
  sessionId: { type: ObjectId, ref: 'ClassSession' },
  memberId: { type: ObjectId, ref: 'Member' },
  gymId: { type: ObjectId, ref: 'Gym' },
  status: { type: String, enum: ['booked', 'waitlisted', 'cancelled', 'attended', 'no_show'], default: 'booked' },
  paymentId: { type: ObjectId, ref: 'Payment' },
  bookedAt: Date,
  cancelledAt: Date,
  createdAt: Date
}
```

## 9. Attendance
```js
// attendance collection
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  gymId: { type: ObjectId, ref: 'Gym' },
  method: { type: String, enum: ['qr_scan', 'manual', 'class_booking'] },
  sessionId: { type: ObjectId, ref: 'ClassSession' },  // if class
  checkedInAt: { type: Date, required: true },
  checkedOutAt: Date,
  staffId: { type: ObjectId, ref: 'User' },             // if manual
  notes: String
}
```

## 10. Payments
```js
// payments collection
{
  _id: ObjectId,
  gymId: { type: ObjectId, ref: 'Gym' },
  memberId: { type: ObjectId, ref: 'Member' },
  type: { type: String, enum: ['membership', 'class', 'product', 'refund'] },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  gateway: { type: String, enum: ['stripe', 'razorpay', 'cash', 'upi'] },
  gatewayTransactionId: String,
  gatewayOrderId: String,
  receipt: String,               // Receipt number
  membershipId: { type: ObjectId, ref: 'Membership' },
  sessionId: { type: ObjectId, ref: 'ClassSession' },
  couponCode: String,
  discountAmount: { type: Number, default: 0 },
  notes: String,
  paidAt: Date,
  createdAt: Date
}
```

## 11. Notifications
```js
// notifications collection
{
  _id: ObjectId,
  recipientId: { type: ObjectId, ref: 'User' },
  gymId: { type: ObjectId, ref: 'Gym' },
  type: { 
    type: String, 
    enum: [
      'membership_expiry', 'payment_success', 'payment_failed',
      'class_reminder', 'class_cancelled', 'birthday',
      'pr_achieved', 'badge_earned', 'streak_milestone',
      'challenge_completed', 'system'
    ]
  },
  title: String,
  message: String,
  data: Object,                   // Extra metadata (classId, badgeId, etc.)
  channels: [{
    type: { type: String, enum: ['in_app', 'push', 'email', 'sms'] },
    sentAt: Date,
    status: { type: String, enum: ['pending', 'sent', 'failed'] }
  }],
  isRead: { type: Boolean, default: false },
  readAt: Date,
  createdAt: Date
}
```

## 12. Gamification
```js
// badges collection (badge definitions)
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,                   // emoji or image URL
  category: { type: String, enum: ['attendance', 'workout', 'social', 'milestone'] },
  criteria: {
    type: String,                 // 'streak_days', 'workouts_completed', 'classes_attended'
    threshold: Number
  },
  points: { type: Number, default: 0 },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] }
}

// member_badges collection
{
  _id: ObjectId,
  memberId: { type: ObjectId, ref: 'Member' },
  badgeId: { type: ObjectId, ref: 'Badge' },
  earnedAt: Date,
  notified: { type: Boolean, default: false }
}

// challenges collection
{
  _id: ObjectId,
  gymId: { type: ObjectId, ref: 'Gym' },
  title: String,
  description: String,
  type: { type: String, enum: ['attendance', 'workout_volume', 'class_attendance', 'streak'] },
  target: Number,
  startDate: Date,
  endDate: Date,
  reward: {
    badgeId: ObjectId,
    points: Number
  },
  participants: [{
    memberId: ObjectId,
    progress: Number,
    completed: Boolean,
    completedAt: Date
  }]
}
```

---

## 13. Indexes (Performance)

```js
// Critical indexes to create
db.members.createIndex({ gymId: 1, membershipStatus: 1 })
db.members.createIndex({ 'currentMembership.endDate': 1 })  // expiry alerts
db.members.createIndex({ memberId: 1 }, { unique: true })

db.workout_logs.createIndex({ memberId: 1, date: -1 })
db.workout_logs.createIndex({ gymId: 1, date: -1 })

db.attendance.createIndex({ gymId: 1, checkedInAt: -1 })
db.attendance.createIndex({ memberId: 1, checkedInAt: -1 })

db.payments.createIndex({ gymId: 1, createdAt: -1 })
db.payments.createIndex({ memberId: 1, status: 1 })

db.class_sessions.createIndex({ gymId: 1, startsAt: 1 })
db.notifications.createIndex({ recipientId: 1, isRead: 1, createdAt: -1 })
```

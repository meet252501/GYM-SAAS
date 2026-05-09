/**
 * GymFlow Pro — Mock Data Layer
 * Realistic Indian gym demo data. Used when backend is offline.
 */
import { subDays, addDays, format } from 'date-fns';

const now = new Date();

export const mockMembers = [
  { _id: 'm1', memberId: 'GF-2026-0001', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun@email.com', phone: '+91 98765 43210', status: 'active', membershipPlan: 'Premium', membershipExpiry: addDays(now, 45), joinDate: subDays(now, 120), streak: 23, totalWorkouts: 89, goal: 'Muscle Gain', weight: 78, height: 178, badges: ['streak_7', 'first_workout'] },
  { _id: 'm2', memberId: 'GF-2026-0002', firstName: 'Priya', lastName: 'Patel', email: 'priya@email.com', phone: '+91 87654 32109', status: 'active', membershipPlan: 'Basic', membershipExpiry: addDays(now, 12), joinDate: subDays(now, 90), streak: 7, totalWorkouts: 42, goal: 'Weight Loss', weight: 62, height: 162, badges: ['streak_7'] },
  { _id: 'm3', memberId: 'GF-2026-0003', firstName: 'Rohan', lastName: 'Mehta', email: 'rohan@email.com', phone: '+91 76543 21098', status: 'active', membershipPlan: 'Premium', membershipExpiry: addDays(now, 78), joinDate: subDays(now, 200), streak: 45, totalWorkouts: 156, goal: 'Strength', weight: 85, height: 182, badges: ['streak_30', 'streak_7', 'first_workout'] },
  { _id: 'm4', memberId: 'GF-2026-0004', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@email.com', phone: '+91 65432 10987', status: 'expired', membershipPlan: 'Basic', membershipExpiry: subDays(now, 5), joinDate: subDays(now, 95), streak: 0, totalWorkouts: 28, goal: 'General Fitness', weight: 55, height: 158, badges: [] },
  { _id: 'm5', memberId: 'GF-2026-0005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram@email.com', phone: '+91 54321 09876', status: 'active', membershipPlan: 'Elite', membershipExpiry: addDays(now, 180), joinDate: subDays(now, 365), streak: 92, totalWorkouts: 312, goal: 'Strength', weight: 92, height: 185, badges: ['streak_100', 'streak_30', 'streak_7', 'first_workout', 'champion'] },
  { _id: 'm6', memberId: 'GF-2026-0006', firstName: 'Kavya', lastName: 'Nair', email: 'kavya@email.com', phone: '+91 43210 98765', status: 'trial', membershipPlan: 'Trial', membershipExpiry: addDays(now, 3), joinDate: subDays(now, 4), streak: 4, totalWorkouts: 4, goal: 'Weight Loss', weight: 68, height: 165, badges: [] },
  { _id: 'm7', memberId: 'GF-2026-0007', firstName: 'Aditya', lastName: 'Kumar', email: 'aditya@email.com', phone: '+91 32109 87654', status: 'active', membershipPlan: 'Premium', membershipExpiry: addDays(now, 6), joinDate: subDays(now, 84), streak: 11, totalWorkouts: 67, goal: 'Muscle Gain', weight: 74, height: 176, badges: ['streak_7', 'first_workout'] },
  { _id: 'm8', memberId: 'GF-2026-0008', firstName: 'Meera', lastName: 'Iyer', email: 'meera@email.com', phone: '+91 21098 76543', status: 'suspended', membershipPlan: 'Basic', membershipExpiry: subDays(now, 20), joinDate: subDays(now, 150), streak: 0, totalWorkouts: 45, goal: 'General Fitness', weight: 58, height: 160, badges: ['first_workout'] },
  { _id: 'm9', memberId: 'GF-2026-0009', firstName: 'Rajesh', lastName: 'Gupta', email: 'rajesh@email.com', phone: '+91 11987 65432', status: 'active', membershipPlan: 'Elite', membershipExpiry: addDays(now, 210), joinDate: subDays(now, 540), streak: 128, totalWorkouts: 445, goal: 'Strength', weight: 88, height: 180, badges: ['streak_100', 'streak_30', 'streak_7', 'champion', 'first_workout'] },
  { _id: 'm10', memberId: 'GF-2026-0010', firstName: 'Divya', lastName: 'Menon', email: 'divya@email.com', phone: '+91 99876 54321', status: 'active', membershipPlan: 'Premium', membershipExpiry: addDays(now, 55), joinDate: subDays(now, 75), streak: 18, totalWorkouts: 52, goal: 'Muscle Gain', weight: 61, height: 170, badges: ['streak_7', 'first_workout'] },
  { _id: 'm11', memberId: 'GF-2026-0011', firstName: 'Karan', lastName: 'Malhotra', email: 'karan@email.com', phone: '+91 88765 43210', status: 'active', membershipPlan: 'Elite', membershipExpiry: addDays(now, 120), joinDate: subDays(now, 420), streak: 67, totalWorkouts: 278, goal: 'Strength', weight: 82, height: 181, badges: ['streak_30', 'streak_7', 'champion', 'first_workout'] },
  { _id: 'm12', memberId: 'GF-2026-0012', firstName: 'Ananya', lastName: 'Bose', email: 'ananya@email.com', phone: '+91 77654 32109', status: 'active', membershipPlan: 'Basic', membershipExpiry: addDays(now, 22), joinDate: subDays(now, 38), streak: 5, totalWorkouts: 15, goal: 'Weight Loss', weight: 70, height: 163, badges: ['first_workout'] },
];

export const mockPlans = [
  { _id: 'p1', name: 'Trial', price: 0, duration: 7, color: '#F59E0B', features: ['Basic gym access', 'Locker room', 'Basic equipment'] },
  { _id: 'p2', name: 'Basic', price: 799, duration: 30, color: '#6B7280', features: ['Full gym access', 'Locker room', 'All equipment', '2 group classes/month'] },
  { _id: 'p3', name: 'Premium', price: 1499, duration: 30, color: '#F59E0B', features: ['Full gym access', 'Unlimited classes', '2 PT sessions', 'Diet consultation', 'Locker'] },
  { _id: 'p4', name: 'Elite', price: 2999, duration: 30, color: '#8B5CF6', features: ['All Premium', 'Unlimited PT', 'Nutrition plan', 'Body composition', 'Priority booking', '2 guest passes/month'] },
];

// FIX: Expanded to 90 days so the 90D analytics range shows real data
export const generateAttendanceSeries = () =>
  Array.from({ length: 90 }, (_, i) => ({
    date: format(subDays(now, 89 - i), 'MMM d'),
    count: Math.floor(Math.random() * 20) + 8,
  }));

export const generateRevenueSeries = () =>
  Array.from({ length: 90 }, (_, i) => ({
    date: format(subDays(now, 89 - i), 'MMM d'),
    revenue: Math.floor(Math.random() * 12000) + 7000,
    members: Math.floor(Math.random() * 8) + 4,
  }));

export const mockRecentCheckins = [
  { _id: 'c1', member: mockMembers[2], checkedInAt: new Date(now.getTime() - 5 * 60000), method: 'qr' },
  { _id: 'c2', member: mockMembers[0], checkedInAt: new Date(now.getTime() - 18 * 60000), method: 'qr' },
  { _id: 'c3', member: mockMembers[4], checkedInAt: new Date(now.getTime() - 32 * 60000), method: 'manual' },
  { _id: 'c4', member: mockMembers[9], checkedInAt: new Date(now.getTime() - 47 * 60000), method: 'qr' },
  { _id: 'c5', member: mockMembers[1], checkedInAt: new Date(now.getTime() - 65 * 60000), method: 'qr' },
  { _id: 'c6', member: mockMembers[6], checkedInAt: new Date(now.getTime() - 82 * 60000), method: 'manual' },
  { _id: 'c7', member: mockMembers[8], checkedInAt: new Date(now.getTime() - 110 * 60000), method: 'qr' },
];

export const mockPayments = [
  { _id: 'pay1', member: mockMembers[0], amount: 1499, plan: 'Premium', date: subDays(now, 2), status: 'paid', method: 'UPI', transactionId: 'TXN28471' },
  { _id: 'pay2', member: mockMembers[2], amount: 1499, plan: 'Premium', date: subDays(now, 5), status: 'paid', method: 'Card', transactionId: 'TXN28362' },
  { _id: 'pay3', member: mockMembers[4], amount: 2999, plan: 'Elite', date: subDays(now, 7), status: 'paid', method: 'Bank Transfer', transactionId: 'TXN28201' },
  { _id: 'pay4', member: mockMembers[1], amount: 799, plan: 'Basic', date: subDays(now, 10), status: 'pending', method: 'Cash', transactionId: null },
  { _id: 'pay5', member: mockMembers[9], amount: 1499, plan: 'Premium', date: subDays(now, 12), status: 'paid', method: 'UPI', transactionId: 'TXN28100' },
  { _id: 'pay6', member: mockMembers[3], amount: 799, plan: 'Basic', date: subDays(now, 15), status: 'overdue', method: 'Cash', transactionId: null },
  { _id: 'pay7', member: mockMembers[8], amount: 2999, plan: 'Elite', date: subDays(now, 20), status: 'paid', method: 'Card', transactionId: 'TXN27890' },
  { _id: 'pay8', member: mockMembers[6], amount: 1499, plan: 'Premium', date: subDays(now, 22), status: 'pending', method: 'UPI', transactionId: null },
  { _id: 'pay9', member: mockMembers[10], amount: 2999, plan: 'Elite', date: subDays(now, 1), status: 'paid', method: 'Card', transactionId: 'TXN28500' },
  { _id: 'pay10', member: mockMembers[7], amount: 799, plan: 'Basic', date: subDays(now, 28), status: 'overdue', method: 'Cash', transactionId: null },
];

export const mockClasses = [
  { _id: 'cl1', name: 'Power Yoga', instructor: 'Priya Singh', day: 'Monday', time: '06:00', duration: 60, capacity: 20, enrolled: 17, type: 'yoga', color: '#8B5CF6' },
  { _id: 'cl2', name: 'HIIT Blast', instructor: 'Rahul Kumar', day: 'Monday', time: '07:30', duration: 45, capacity: 15, enrolled: 15, type: 'hiit', color: '#EF4444' },
  { _id: 'cl3', name: 'Zumba Dance', instructor: 'Anjali Verma', day: 'Tuesday', time: '06:30', duration: 60, capacity: 25, enrolled: 22, type: 'dance', color: '#F59E0B' },
  { _id: 'cl4', name: 'Strength & Conditioning', instructor: 'Vikram Nair', day: 'Wednesday', time: '08:00', duration: 75, capacity: 12, enrolled: 8, type: 'strength', color: '#10B981' },
  { _id: 'cl5', name: 'Pilates Core', instructor: 'Meera Iyer', day: 'Thursday', time: '07:00', duration: 50, capacity: 18, enrolled: 13, type: 'pilates', color: '#3B82F6' },
  { _id: 'cl6', name: 'CrossFit WOD', instructor: 'Arjun Dev', day: 'Friday', time: '06:00', duration: 60, capacity: 15, enrolled: 14, type: 'crossfit', color: '#EF4444' },
  { _id: 'cl7', name: 'Meditation & Mobility', instructor: 'Kavya Menon', day: 'Saturday', time: '08:00', duration: 45, capacity: 30, enrolled: 19, type: 'wellness', color: '#10B981' },
  { _id: 'cl8', name: 'Boxing Basics', instructor: 'Rohan Singh', day: 'Saturday', time: '10:00', duration: 60, capacity: 20, enrolled: 16, type: 'boxing', color: '#F97316' },
];

export const mockDashboard = {
  members: { total: mockMembers.length, active: mockMembers.filter(m => m.status === 'active').length, expiringSoon: mockMembers.filter(m => { const d = Math.floor((new Date(m.membershipExpiry) - now) / 86400000); return d >= 0 && d <= 7; }).length, newThisMonth: 3 },
  revenue: { thisMonth: 48750, lastMonth: 42300, growth: 15.2, pending: 4298 },
  attendance: { today: 14, thisWeek: 87, avgPerDay: 18 },
};

export const generateHeatmapData = () => {
  const data = {};
  for (let i = 365; i >= 0; i--) {
    const d = format(subDays(now, i), 'yyyy-MM-dd');
    data[d] = Math.random() > 0.25 ? Math.floor(Math.random() * 28) + 1 : 0;
  }
  return data;
};

export const ATTENDANCE_DATA = generateAttendanceSeries();
export const REVENUE_DATA = generateRevenueSeries();

export const MOCK_STATS = {
  activeMembers: mockDashboard.members.active,
  newThisMonth: mockDashboard.members.newThisMonth,
  revenueThisMonth: mockDashboard.revenue.thisMonth,
  avgDailyAttendance: mockDashboard.attendance.avgPerDay,
  expiringSoon: mockDashboard.members.expiringSoon
};

export const MOCK_MEMBERS = mockMembers;
export const MOCK_PLANS = mockPlans;

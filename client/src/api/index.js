import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  getMe: () => client.get('/auth/me'),
  updateMe: (data) => client.patch('/auth/me', data),
};

export const membersApi = {
  getAll: (params) => client.get('/members', { params }),
  getOne: (id) => client.get(`/members/${id}`),
  create: (data) => client.post('/members', data),
  update: (id, data) => client.patch(`/members/${id}`, data),
  delete: (id) => client.delete(`/members/${id}`),
  getQR: (id) => client.get(`/members/${id}/qr`),
  getExpiringSoon: (days = 7) => client.get('/members/expiring-soon', { params: { days } }),
  getStats: () => client.get('/members/stats'),
  getLeaderboard: () => client.get('/members/leaderboard'),
};

export const analyticsApi = {
  getDashboard: () => client.get('/analytics/dashboard'),
  getRevenue: (days = 30) => client.get('/analytics/revenue', { params: { days } }),
  getAttendanceChart: (days = 30) => client.get('/analytics/attendance', { params: { days } }),
  getMuscleFocus: (days = 30) => client.get('/analytics/muscle-focus', { params: { days } }),
  getMember: (id) => client.get(`/analytics/member/${id}`),
};

let MOCK_PIN = '123456';
let MOCK_TODAY = [];
setInterval(() => { MOCK_PIN = Math.floor(100000 + Math.random() * 900000).toString(); }, 30000);

export const attendanceApi = {
  manual: () => Promise.resolve({ data: { success: true } }),
  mark: () => Promise.resolve({ data: { success: true } }),
  dynamicCheckin: (pin) => {
    if (pin.pin !== MOCK_PIN) return Promise.reject({ response: { data: { message: "Invalid PIN" } } });
    MOCK_TODAY.unshift({
      _id: Math.random().toString(),
      memberId: { firstName: 'Meet', lastName: 'Demo', photo: '', streak: 12 },
      checkedInAt: new Date().toISOString()
    });
    return Promise.resolve({ data: { success: true } });
  },
  getAll: () => Promise.resolve({ data: { data: MOCK_TODAY } }),
  getMy: () => Promise.resolve({ data: { data: MOCK_TODAY } }),
  getToday: () => Promise.resolve({ data: { data: MOCK_TODAY } }),
  pinCheckin: () => Promise.resolve({ data: { success: true } }),
  getKioskPin: () => Promise.resolve({ data: { data: { pin: MOCK_PIN } } }),
};

export const paymentApi = {
  getAll: (params) => client.get('/payments', { params }),
  record: (data) => client.post('/payments/record', data),
  getStats: (days) => client.get('/payments/stats', { params: { days } }),
  getInvoice: (id) => client.get(`/payments/${id}/invoice`, { responseType: 'blob' }),
};

export const membershipApi = {
  getPlans: () => client.get('/memberships/plans'),
  createPlan: (data) => client.post('/memberships/plans', data),
  assign: (data) => client.post('/memberships/assign', data),
};

export const nutritionApi = {
  getDay:        (date)          => client.get(`/nutrition/${date}`),
  addEntry:      (date, data)    => client.post(`/nutrition/${date}/entries`, data),
  deleteEntry:   (date, entryId) => client.delete(`/nutrition/${date}/entries/${entryId}`),
  updateGoal:    (data)          => client.patch('/nutrition/goal', data),
  search:        (q)             => client.get('/nutrition/search', { params: { q } }),
  barcodeSearch: (code)          => client.get(`/nutrition/barcode/${code}`),
  getWeekly:     ()              => client.get('/nutrition/weekly'),
};

export const badgeApi = {
  getAll: () => client.get('/badges'),
  getMember: () => client.get('/badges/member'),
  getNotifications: () => client.get('/badges/notifications'),
  markNotified: (id) => client.patch(`/badges/notifications/${id}`),
};

export const progressApi = {
  getOverview: () => client.get('/progress/overview'),
  getWeight: () => client.get('/progress/weight'),
  getRecords: () => client.get('/progress/records'),
};

export const classesApi = {
  getAll: (params) => client.get('/classes', { params }),
  create: (data) => client.post('/classes', data),
  update: (id, data) => client.put(`/classes/${id}`, data),
  delete: (id) => client.delete(`/classes/${id}`),
  getSessions: (params) => client.get('/classes/sessions', { params }),
  createSession: (data) => client.post('/classes/sessions', data),
  book: (sessionId) => client.post(`/classes/sessions/${sessionId}/book`),
  cancel: (bookingId) => client.post(`/classes/bookings/${bookingId}/cancel`),
  getMyBookings: () => client.get('/classes/bookings'),
};

export const workoutsApi = {
  getExercises: (params) => client.get('/workouts/exercises', { params }),
  getLogs: () => client.get('/workouts/logs'),
  createLog: (data) => client.post('/workouts/logs', data),
  getPrograms: () => client.get('/workouts/programs'),
  createProgram: (data) => client.post('/workouts/programs', data),
  assignProgram: (id, data) => client.post(`/workouts/programs/${id}/assign`, data),
};

export const gymApi = {
  getSettings: () => client.get('/gym/settings'),
  updateSettings: (data) => client.put('/gym/settings', data),
};

export const dietPlanApi = {
  getAll: () => client.get('/diet-plans'),
  getOne: (id) => client.get(`/diet-plans/${id}`),
  create: (data) => client.post('/diet-plans', data),
  update: (id, data) => client.put(`/diet-plans/${id}`, data),
  delete: (id) => client.delete(`/diet-plans/${id}`),
  assign: (id, data) => client.post(`/diet-plans/${id}/assign`, data),
};

export const notificationsApi = {
  getAll: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.post('/notifications/mark-all-read'),
};

export const aiApi = {
  getUsage: () => client.get('/ai/usage'),
  trackUsage: () => client.post('/ai/track'),
};


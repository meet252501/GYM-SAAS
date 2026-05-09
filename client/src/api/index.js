import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  getMe: () => client.get('/auth/me'),
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
  getMember: (id) => client.get(`/analytics/member/${id}`),
};

export const attendanceApi = {
  qrScan: (token) => client.post('/attendance/qr-scan', { token }),
  manual: (data) => client.post('/attendance/manual', data),
  getAll: (params) => client.get('/attendance', { params }),
  getToday: () => client.get('/attendance/today'),
  getMemberQR: () => client.get('/attendance/member-qr'),
  getGymQR: () => client.get('/attendance/qr-token'),
  memberCheckin: (data) => client.post('/attendance/checkin', typeof data === 'string' ? { token: data } : data),
};

export const paymentApi = {
  getAll: (params) => client.get('/payments', { params }),
  record: (data) => client.post('/payments/record', data),
  getStats: (days) => client.get('/payments/stats', { params: { days } }),
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
  cancel: (bookingId) => client.post(`/classes/sessions/${bookingId}/cancel`),
  getMyBookings: () => client.get('/classes/bookings'),
};

export const workoutsApi = {
  getExercises: (params) => client.get('/workouts/exercises', { params }),
  getLogs: () => client.get('/workouts/logs'),
  createLog: (data) => client.post('/workouts/logs', data),
  getPrograms: () => client.get('/workouts/programs'),
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
};

export const notificationsApi = {
  getAll: () => client.get('/notifications'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.post('/notifications/mark-all-read'),
};

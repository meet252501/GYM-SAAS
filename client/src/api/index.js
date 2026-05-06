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
};

export const analyticsApi = {
  getDashboard: () => client.get('/analytics/dashboard'),
  getRevenue: (days = 30) => client.get('/analytics/revenue', { params: { days } }),
  getAttendanceChart: (days = 30) => client.get('/analytics/attendance', { params: { days } }),
};

export const attendanceApi = {
  qrScan: (token) => client.post('/attendance/qr-scan', { token }),
  manual: (data) => client.post('/attendance/manual', data),
  getAll: (params) => client.get('/attendance', { params }),
  getToday: () => client.get('/attendance/today'),
};

export const membershipApi = {
  getPlans: () => client.get('/memberships/plans'),
  createPlan: (data) => client.post('/memberships/plans', data),
  assign: (data) => client.post('/memberships/assign', data),
};

import { create } from 'zustand';
import { authApi } from '../api';
import { mockMembers } from '../data/mockData';

const useAuthStore = create((set) => ({
  user: null,
  gym: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ isLoading: false }); return; }

    if (token === 'mock-token') {
      const mockAdmin = { _id: 'admin1', firstName: 'Admin', lastName: 'Owner', email: 'admin@gym.com', role: 'owner' };
      const mockGym = { _id: 'gym1', name: 'GymFlow Pro' };
      set({ user: mockAdmin, gym: mockGym, isAuthenticated: true, isLoading: false });
      return;
    }
    if (token === 'mock-member-token') {
      // Reload the specific member that was saved at login time
      try {
        const savedUser = JSON.parse(localStorage.getItem('mock_member_user') || '{}');
        const mockGym = { _id: 'gym1', name: 'GymFlow Pro' };
        if (savedUser._id) {
          set({ user: savedUser, gym: mockGym, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch { /* ignore */ }
      // Fallback generic member
      const fallback = { _id: 'member1', memberId: 'GF-2026-DEMO', firstName: 'Demo', lastName: 'Member', email: 'member@gym.com', role: 'member', membershipPlan: 'Premium', streak: 14, totalWorkouts: 56, goal: 'Muscle Gain', weight: 75, height: 175 };
      const mockGym = { _id: 'gym1', name: 'GymFlow Pro' };
      set({ user: fallback, gym: mockGym, isAuthenticated: true, isLoading: false });
      return;
    }

    try {
      const { data } = await authApi.getMe();
      set({ user: data.data.user, gym: data.data.gym, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    try {
      const { data } = await authApi.login({ email, password });
      const { user, gym, accessToken, refreshToken } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, gym, isAuthenticated: true });
      return user;
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
        console.warn('Backend offline — using mock login.');

        const MEMBER_EMAILS = mockMembers.map(m => m.email.toLowerCase());
        const emailLower = email.toLowerCase().trim();
        const isMember = MEMBER_EMAILS.includes(emailLower) || emailLower.includes('member');

        let mockUser;
        if (isMember) {
          // Find the specific member from mock data
          const found = mockMembers.find(m => m.email.toLowerCase() === emailLower);
          if (found) {
            mockUser = { ...found, role: 'member' };
          } else {
            // Generic fallback member
            mockUser = { _id: 'member1', memberId: 'GF-2026-DEMO', firstName: 'Demo', lastName: 'Member', email, role: 'member', membershipPlan: 'Premium', streak: 14, totalWorkouts: 56, goal: 'Muscle Gain', weight: 75, height: 175 };
          }
          // Persist member identity so initialize() can reload it
          localStorage.setItem('mock_member_user', JSON.stringify(mockUser));
        } else {
          mockUser = { _id: 'admin1', firstName: 'Admin', lastName: 'Owner', email, role: 'owner' };
        }

        const mockGym = { _id: 'gym1', name: 'GymFlow Pro' };
        localStorage.setItem('accessToken', isMember ? 'mock-member-token' : 'mock-token');
        set({ user: mockUser, gym: mockGym, isAuthenticated: true });
        return mockUser;
      }
      throw err;
    }
  },

  register: async (formData) => {
    const { data } = await authApi.register(formData);
    const { user, gym, accessToken, refreshToken } = data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, gym, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    try { await authApi.logout(); } catch (e) { console.error('Logout error:', e); }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('mock_member_user');
    set({ user: null, gym: null, isAuthenticated: false });
  },

  updateGym: (gym) => set({ gym }),
}));

export default useAuthStore;

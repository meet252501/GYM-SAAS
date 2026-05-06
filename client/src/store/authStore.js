import { create } from 'zustand';
import { authApi } from '../api';

const useAuthStore = create((set) => ({
  user: null,
  gym: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ isLoading: false }); return; }
    
    if (token === 'mock-token' || token === 'mock-member-token') {
      const isMember = token === 'mock-member-token';
      const mockUser = { _id: isMember ? 'member1' : 'admin1', name: isMember ? 'Demo Member' : 'Demo Admin', email: isMember ? 'member@gym.com' : 'admin@gym.com', role: isMember ? 'member' : 'owner' };
      const mockGym = { _id: 'gym1', name: 'GymFlow Demo HQ' };
      set({ user: mockUser, gym: mockGym, isAuthenticated: true, isLoading: false });
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
        console.warn("Backend offline. Using mock login.");
        const isMember = email.includes('member');
        const mockUser = { _id: isMember ? 'member1' : 'admin1', name: isMember ? 'Demo Member' : 'Demo Admin', email, role: isMember ? 'member' : 'owner' };
        const mockGym = { _id: 'gym1', name: 'GymFlow Demo HQ' };
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
    set({ user: null, gym: null, isAuthenticated: false });
  },

  updateGym: (gym) => set({ gym }),
}));

export default useAuthStore;

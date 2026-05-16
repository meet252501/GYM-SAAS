import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      gym: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { set({ isLoading: false }); return; }



        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user, gym: data.data.gym, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
          // Note: In basement mode, we keep the user authenticated if offline
          if (navigator.onLine) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ isAuthenticated: false, user: null, gym: null });
          }
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
          console.error('Login error:', err);
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
      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),
    }),
    {
      name: 'gymflow-auth-storage', // name of item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, gym: state.gym, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

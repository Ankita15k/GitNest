import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser, registerUser, getMe } from '../api/authApi';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await loginUser({ email, password });
          set({
            user: { _id: res.data._id, username: res.data.username, email: res.data.email },
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            loading: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const res = await registerUser(userData);
          set({
            user: { _id: res.data._id, username: res.data.username, email: res.data.email },
            token: res.data.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            loading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
      clearError: () => {
        set({ error: null });
      },
      checkAuth: async () => {
        set({ loading: true, error: null });
        try {
          const res = await getMe();
          set({
            user: res.data,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // local storage key
    }
  )
);

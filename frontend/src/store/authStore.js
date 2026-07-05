import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, registerUser, getMe, forgotPassword as forgotPasswordApi } from "../api/authApi";

// Fixed the error extraction to safely handle backend error messages without crashing
const extractErrorMessage = (error) => {
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((err) => err.message).join(', ');
  }
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors.map((err) => err.message).join(", ");
  }
  return error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
};

export const useAuthStore = create(
  persist(
    (set) => ({
      // state
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // login
      login: async (email, password) => {
        set({ loading: true, error: null });

        try {
          const res = await loginUser({ email, password });

          // extract user data no matter how the backend nests the response
          const userData = res?.data?.user || res?.user || res?.data?.data || res?.data || res || {};
          const tokenStr = res?.data?.token || res?.token || userData?.token || null;

          set({
            user: {
              _id: userData?._id,
              username: userData?.username,
              email: userData?.email,
            },
            token: tokenStr,
            isAuthenticated: true,
            error: null,
          });

          return userData;
        } catch (error) {
          set({ error: extractErrorMessage(error) });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // register
      register: async (userDataInput) => {
        set({ loading: true, error: null });

        try {
          const res = await registerUser(userDataInput);

          // extract user data no matter how the backend nests the response
          const userData = res?.data?.user || res?.user || res?.data?.data || res?.data || res || {};
          const tokenStr = res?.data?.token || res?.token || userData?.token || null;

          set({
            user: {
              _id: userData?._id,
              username: userData?.username,
              email: userData?.email,
            },
            token: tokenStr,
            isAuthenticated: true,
            error: null,
          });
          return userData;
        } catch (error) {
          set({ error: extractErrorMessage(error) });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      },

      // clear error
      clearError: () => {
        set({ error: null });
      },

      // check auth
      checkAuth: async () => {
        set({ loading: true, error: null });

        try {
          const res = await getMe();
          
          // extract from getMe
          const userData = res?.data?.user || res?.user || res?.data?.data || res?.data || res || {};

          set({
            user: userData,
            isAuthenticated: true,
          });
        } catch {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        } finally {
          set({ loading: false });
        }
      },

      // forgot password
      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const res = await forgotPasswordApi(email);
          return res;
        } catch (error) {
          set({ error: extractErrorMessage(error) });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      // persist only required state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

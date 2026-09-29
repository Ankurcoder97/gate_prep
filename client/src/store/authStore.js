import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => {
  // Read initial stored user
  let initialUser = null;
  const saved = localStorage.getItem('gate_auth');
  if (saved) {
    try {
      initialUser = JSON.parse(saved);
    } catch (e) {}
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser?.token,
    isLoading: false,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.login(email, password);
        const userData = response.data;
        localStorage.setItem('gate_auth', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
        set({ error: message, isLoading: false });
        return { success: false, message };
      }
    },

    register: async (formData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.register(formData);
        const userData = response.data;
        localStorage.setItem('gate_auth', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || 'Registration failed.';
        set({ error: message, isLoading: false });
        return { success: false, message };
      }
    },

    updateUserBranch: (branch) => {
      const currentUser = get().user;
      if (currentUser) {
        const updated = { ...currentUser, selectedBranch: branch };
        localStorage.setItem('gate_auth', JSON.stringify(updated));
        set({ user: updated });
      }
    },

    fetchMe: async () => {
      try {
        const res = await authService.getMe();
        if (res.data) {
          const current = get().user || {};
          const merged = { ...current, ...res.data };
          localStorage.setItem('gate_auth', JSON.stringify(merged));
          set({ user: merged, isAuthenticated: true });
        }
      } catch (err) {
        // if token invalid, will be handled by interceptor
      }
    },

    logout: () => {
      localStorage.removeItem('gate_auth');
      set({ user: null, isAuthenticated: false, error: null });
    },
  };
});

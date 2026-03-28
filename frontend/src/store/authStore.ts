import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'SUPER_ADMIN' | 'CLIENT_COORDINATOR' | 'DESIGNER' | 'PRODUCTION' | 'PAYMENT_MANAGER';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      setAuth: (user) => 
        set({ 
          user, 
          role: user?.role || null, 
          isAuthenticated: !!user 
        }),
      logout: () => set({ user: null, role: null, isAuthenticated: false }),
    }),
    {
      name: 'senifo-auth',
    }
  )
);

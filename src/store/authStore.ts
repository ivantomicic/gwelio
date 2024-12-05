import { create } from 'zustand';
import { User } from '../types';
import { signInWithEmail, signOut as supabaseSignOut, getCurrentUser } from '../lib/supabase';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  previousAdminUser: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  switchUser: (email: string) => Promise<void>;
  switchBackToAdmin: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      previousAdminUser: null,
      loading: true,
      
      setUser: (user) => set({ user }),
      
      initialize: async () => {
        try {
          const user = await getCurrentUser();
          set({ user: user || null, loading: false });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, loading: false });
        }
      },

      signIn: async (email, password, rememberMe = false) => {
        const { user } = await signInWithEmail(email, password);
        if (user) {
          const profile = await getCurrentUser();
          if (!profile) throw new Error('Failed to get user profile');
          set({ user: profile });
        } else {
          throw new Error('Invalid credentials');
        }
      },

      signOut: async () => {
        await supabaseSignOut();
        set({ user: null, previousAdminUser: null });
      },

      switchUser: async (email) => {
        const { user } = get();
        if (user?.is_admin) {
          const newUser = await getCurrentUser();
          if (newUser) {
            set({ 
              user: newUser,
              previousAdminUser: user
            });
          }
        }
      },

      switchBackToAdmin: () => {
        const { previousAdminUser } = get();
        if (previousAdminUser?.is_admin) {
          set({ user: previousAdminUser, previousAdminUser: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        previousAdminUser: state.previousAdminUser,
      }),
    }
  )
);
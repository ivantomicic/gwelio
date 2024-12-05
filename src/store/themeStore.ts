import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  setTheme: (dark: boolean) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      setTheme: (dark: boolean) => set({ isDark: dark }),
      toggle: () => set((state) => ({ isDark: !state.isDark })),
    }),
    {
      name: 'theme-storage',
    }
  )
);
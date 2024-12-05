import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

export function useTheme() {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches);
    };

    // Set initial theme based on system preference
    setTheme(mediaQuery.matches);

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark };
}
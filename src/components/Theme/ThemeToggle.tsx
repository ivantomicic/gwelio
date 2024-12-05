import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
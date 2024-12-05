import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { LoginForm } from '../Auth/LoginForm';
import { RegisterForm } from '../Auth/RegisterForm';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '../../store/themeStore';

export function AuthLayout() {
  const [showLogin, setShowLogin] = useState(true);
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Table Tennis Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showLogin ? 'Sign in to track your matches' : 'Create a new account'}
          </p>
        </div>
        {showLogin ? (
          <>
            <LoginForm />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Create one
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm onToggle={() => setShowLogin(true)} />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
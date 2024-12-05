import React from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserSwitcher } from '../User/UserSwitcher';
import { ThemeToggle } from '../Theme/ThemeToggle';
import { Link } from 'react-router-dom';

export function Header() {
  const { user, signOut } = useAuthStore();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Gwelio Logo" 
                className="h-8 w-8"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Gwelio
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Switcher (Admin Only) */}
            {user?.is_admin && (
              <div className="hidden sm:block">
                <UserSwitcher />
              </div>
            )}

            {/* User Info */}
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
              {user?.full_name}
            </div>

            {/* Settings Link */}
            <Link
              to="/settings"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign Out Button */}
            <button
              onClick={signOut}
              className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile User Info */}
        <div className="sm:hidden py-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {user?.full_name}
            </div>
            {user?.is_admin && <UserSwitcher />}
          </div>
        </div>
      </div>
    </nav>
  );
}
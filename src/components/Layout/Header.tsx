import React from 'react';
import { Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserSwitcher } from '../User/UserSwitcher';

export function Header() {
  const { user, signOut } = useAuthStore();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <span className="ml-2 text-lg md:text-xl font-semibold">TT Tracker</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {user?.is_admin && <UserSwitcher />}
            <div className="text-sm text-gray-600">
              Logged in as: {user?.full_name}
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
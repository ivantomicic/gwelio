import React from 'react';
import { PasswordChange } from './PasswordChange';
import { Settings } from 'lucide-react';

export function SettingsScreen() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
      </div>
      
      <div className="space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Security
          </h3>
          <PasswordChange />
        </div>
      </div>
    </div>
  );
}
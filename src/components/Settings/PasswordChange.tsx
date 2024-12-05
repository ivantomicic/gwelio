import React, { useState } from 'react';
import { updatePassword } from '../../lib/supabase';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(newPassword);
      toast.success('Password updated successfully');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Current Password
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            minLength={6}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <div className="mt-1 relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            required
            minLength={6}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
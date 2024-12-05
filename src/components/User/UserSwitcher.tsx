import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getAllUsers } from '../../lib/supabase';
import { User, ArrowLeft } from 'lucide-react';
import { User as UserType } from '../../types';
import toast from 'react-hot-toast';

export function UserSwitcher() {
  const { user, previousAdminUser, switchUser, switchBackToAdmin } = useAuthStore();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleUserSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      await switchUser(e.target.value);
    } catch (error) {
      toast.error('Failed to switch user');
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="flex items-center space-x-2">
      {!user?.is_admin && previousAdminUser && (
        <button
          onClick={switchBackToAdmin}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin</span>
        </button>
      )}
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-gray-500" />
        <select
          value={user?.email}
          onChange={handleUserSwitch}
          className="text-sm border border-gray-300 rounded-md px-2 py-1"
        >
          {users.map(user => (
            <option key={user.id} value={user.email}>
              {user.full_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
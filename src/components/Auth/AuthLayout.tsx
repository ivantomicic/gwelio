import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Toaster } from 'react-hot-toast';
import { getAllUsers } from '../../lib/supabase';
import { User } from '../../types';

export function AuthLayout() {
  const [showLogin, setShowLogin] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
        console.log('Fetched users:', allUsers);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Table Tennis Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showLogin ? 'Sign in to track your matches' : 'Create a new account'}
          </p>
        </div>
        {showLogin ? (
          <>
            <LoginForm />
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Create one
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm onToggle={() => setShowLogin(true)} />
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>

      {/* Debug section */}
      <div className="mt-8 w-full max-w-md bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Debug: Registered Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="p-2 bg-gray-50 rounded">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Name:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Admin:</strong> {user.is_admin ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
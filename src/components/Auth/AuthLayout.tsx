import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { GoogleButton } from './GoogleButton';
import { AuthDivider } from './AuthDivider';
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
        console.log('Dohvaćeni korisnici:', allUsers);
        setUsers(allUsers);
      } catch (error) {
        console.error('Greška pri dohvatanju korisnika:', error);
        setError(error instanceof Error ? error.message : 'Neuspešno dohvatanje korisnika');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Stoni Tenis Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {showLogin ? 'Prijavite se da pratite svoje mečeve' : 'Napravite novi nalog'}
          </p>
        </div>

        <GoogleButton />
        <AuthDivider />
        
        {showLogin ? (
          <>
            <LoginForm />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Nemate nalog?{' '}
              <button
                onClick={() => setShowLogin(false)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Napravite ga
              </button>
            </p>
          </>
        ) : (
          <>
            <RegisterForm onToggle={() => setShowLogin(true)} />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Već imate nalog?{' '}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Prijavite se
              </button>
            </p>
          </>
        )}
      </div>

      {/* Debug sekcija */}
      <div className="mt-8 w-full max-w-md bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Debug: Registrovani Korisnici</h3>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Učitavanje korisnika...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Nema pronađenih korisnika</p>
        ) : (
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Ime:</strong> {user.full_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Admin:</strong> {user.is_admin ? 'Da' : 'Ne'}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
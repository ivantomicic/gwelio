import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPassword } from "./ForgotPassword";
import { GoogleButton } from "./GoogleButton";
import { AuthDivider } from "./AuthDivider";
import { Toaster } from "react-hot-toast";
import { getAllUsers } from "../../lib/supabase";
import { User } from "../../types";

type AuthView = 'login' | 'register' | 'forgot-password';

export function AuthLayout() {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const allUsers = await getAllUsers();
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

  const renderAuthContent = () => {
    switch (currentView) {
      case 'forgot-password':
        return (
          <div className="w-full max-w-md">
            <ForgotPassword onBack={() => setCurrentView('login')} />
          </div>
        );
      case 'register':
        return (
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Registracija
              </h2>
            </div>
            <RegisterForm onToggle={() => setCurrentView('login')} />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Imaš nalog?{" "}
              <button
                onClick={() => setCurrentView('login')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Prijavi se
              </button>
            </p>
          </div>
        );
      default:
        return (
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Trophy className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-500" />
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                Stoni Tenis Tracker
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Prijavite se da pratite svoje mečeve
              </p>
            </div>

            <GoogleButton />
            <AuthDivider />
            
            <LoginForm onForgotPassword={() => setCurrentView('forgot-password')} />
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Nemaš nalog?{" "}
              <button
                onClick={() => setCurrentView('register')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Registruj se
              </button>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      {renderAuthContent()}
      <Toaster position="top-right" />
    </div>
  );
}
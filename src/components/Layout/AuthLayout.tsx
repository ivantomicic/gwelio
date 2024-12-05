import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { LoginForm } from '../Auth/LoginForm';
import { RegisterForm } from '../Auth/RegisterForm';
import { Toaster } from 'react-hot-toast';

export function AuthLayout() {
  const [showLogin, setShowLogin] = useState(true);

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
      <Toaster position="top-right" />
    </div>
  );
}
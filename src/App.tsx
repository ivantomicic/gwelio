import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthLayout } from './components/Layout/AuthLayout';
import { DashboardLayout } from './components/Layout/DashboardLayout';

function App() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <AuthLayout />;
  }

  return (
    <Router>
      <DashboardLayout />
    </Router>
  );
}

export default App;
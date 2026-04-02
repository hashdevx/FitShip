import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';

// Lazy load pages later or import now for simplicity
import Home from './pages/Home';
import Auth from './pages/Auth';
import Discover from './pages/Discover';
import Wallet from './pages/Wallet';
import Workouts from './pages/Workouts';
import OwnerPanel from './pages/OwnerPanel';
import AdminPanel from './pages/AdminPanel';

function PrivateRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (role && profile?.role !== role && profile?.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/discover" element={<Discover />} />
              
              <Route path="/wallet" element={
                <PrivateRoute>
                  <Wallet />
                </PrivateRoute>
              } />
              
              <Route path="/workouts" element={
                <PrivateRoute>
                  <Workouts />
                </PrivateRoute>
              } />
              
              <Route path="/owner" element={
                <PrivateRoute role="owner">
                  <OwnerPanel />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <PrivateRoute role="admin">
                  <AdminPanel />
                </PrivateRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

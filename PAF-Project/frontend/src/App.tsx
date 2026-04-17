import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthCallback from './pages/AuthCallback';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Login';

// Placeholder pages — other modules will fill these in
function Dashboard() { return <h1>Dashboard</h1>; }
function AdminPanel() { return <h1>Admin Panel</h1>; }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Protected — ADMIN only */}
          <Route path="/admin/*" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <AdminPanel />
            </PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AuthCallback from './pages/AuthCallback';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileCompletion from './pages/ProfileCompletion';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

import AdminDashboard from './pages/AdminDashboard';

import StaffDashboard from './pages/StaffDashboard';
import TicketsPage from './pages/TicketsPage';
import CreateTicketPage from './pages/CreateTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import BookingsPage from './pages/BookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import ResourcesPage from './pages/ResourcesPage';
import UserNotificationPage from './pages/UserNotificationPage';
import AdminNotificationPage from './pages/AdminNotificationPage';
import StaffManagement from './pages/StaffManagement';
import StaffApprovals from './pages/StaffApprovals';
import CalendarPage from './pages/CalendarPage';
import NotificationBell from './components/user/Notificationbell';
import { useAuth } from './context/AuthContext';

function GlobalNotification() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <div style={{ position: 'fixed', bottom: '30px', left: '30px', zIndex: 9999 }}>
      <NotificationBell />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalNotification />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<ProfileCompletion />} />
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
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/staff" element={
            <PrivateRoute requiredRoles={['ADMIN']}>
              <StaffManagement />
            </PrivateRoute>
          } />

          {/* Protected — STAFF_MEMBER only */}
          <Route path="/staff/*" element={
            <PrivateRoute requiredRoles={['STAFF_MEMBER']}>
              <StaffDashboard />
            </PrivateRoute>
          } />
          <Route path="/staff/approvals" element={
            <PrivateRoute requiredRoles={['STAFF_MEMBER']}>
              <StaffApprovals />
            </PrivateRoute>
          } />

          {/* Tickets — all authenticated roles */}
          <Route path="/tickets" element={<PrivateRoute><TicketsPage /></PrivateRoute>} />
          <Route path="/tickets/create" element={<PrivateRoute><CreateTicketPage /></PrivateRoute>} />
          <Route path="/tickets/:id" element={<PrivateRoute><TicketDetailPage /></PrivateRoute>} />

          {/* Bookings — student can view/create */}
          <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />

          {/* Resources — student and admin catalogue */}
          <Route path="/resources" element={<PrivateRoute><ResourcesPage /></PrivateRoute>} />
          <Route path="/admin/resources" element={<PrivateRoute requiredRoles={['ADMIN']}><ResourcesPage /></PrivateRoute>} />

          {/* Admin Bookings — admin only */}
          <Route path="/admin/bookings" element={<PrivateRoute requiredRoles={['ADMIN']}><AdminBookingsPage /></PrivateRoute>} />

          {/* Notifications */}
          <Route path="/notifications" element={<PrivateRoute><UserNotificationPage /></PrivateRoute>} />
          <Route path="/admin/notifications" element={<PrivateRoute requiredRoles={['ADMIN']}><AdminNotificationPage /></PrivateRoute>} />

          {/* Calendar */}
          <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />



          {/* Default redirect */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

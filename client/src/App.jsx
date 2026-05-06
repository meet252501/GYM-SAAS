import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin pages
import Dashboard from './pages/admin/Dashboard';

import Members from './pages/admin/Members';
import Classes from './pages/admin/Classes';
import Attendance from './pages/admin/Attendance';
import Payments from './pages/admin/Payments';
import Analytics from './pages/admin/Analytics';
import Leaderboard from './pages/admin/Leaderboard';
import Settings from './pages/admin/Settings';

// Member pages
import MemberLayout from './components/layout/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import QRCard from './pages/member/QRCard';
import Workouts from './pages/member/Workouts';
import MemberClasses from './pages/member/Classes';
import Profile from './pages/member/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  }
});

// ─── Route Guards ─────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'member' ? '/member' : '/admin'} replace />;
  return children;
};

function App() {
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Members /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/classes" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Classes /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Attendance /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Payments /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Analytics /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Leaderboard /></AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute roles={['owner', 'trainer']}>
              <AdminLayout><Settings /></AdminLayout>
            </ProtectedRoute>
          } />

          {/* Member */}
          <Route path="/member" element={
            <ProtectedRoute roles={['member']}>
              <MemberLayout><MemberDashboard /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/member/pass" element={
            <ProtectedRoute roles={['member']}>
              <MemberLayout><QRCard /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/member/workouts" element={
            <ProtectedRoute roles={['member']}>
              <MemberLayout><Workouts /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/member/classes" element={
            <ProtectedRoute roles={['member']}>
              <MemberLayout><MemberClasses /></MemberLayout>
            </ProtectedRoute>
          } />
          <Route path="/member/profile" element={
            <ProtectedRoute roles={['member']}>
              <MemberLayout><Profile /></MemberLayout>
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text-1)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10B981', secondary: 'white' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
        }}
      />

      <style>{`
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
        }
      `}</style>
    </QueryClientProvider>
  );
}

export default App;

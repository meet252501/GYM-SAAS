import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import MemberLayout from './components/layout/MemberLayout';

// Auth pages (lazy)
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Admin pages (lazy)
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Members = lazy(() => import('./pages/admin/Members'));
const Classes = lazy(() => import('./pages/admin/Classes'));
const Attendance = lazy(() => import('./pages/admin/Attendance'));
const Payments = lazy(() => import('./pages/admin/Payments'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Leaderboard = lazy(() => import('./pages/admin/Leaderboard'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const AppSettings = lazy(() => import('./pages/admin/AppSettings'));
const DietPlans = lazy(() => import('./pages/admin/DietPlans'));

// Member pages (lazy)
const MemberDashboard = lazy(() => import('./pages/member/MemberDashboard'));
const QRCard = lazy(() => import('./pages/member/QRCard'));
const Workouts = lazy(() => import('./pages/member/Workouts'));
const ExerciseLibrary = lazy(() => import('./pages/member/ExerciseLibrary'));
const MemberClasses = lazy(() => import('./pages/member/Classes'));
const Profile = lazy(() => import('./pages/member/Profile'));
const MemberAIPage = lazy(() => import('./pages/member/MemberAIPage'));
const Progress = lazy(() => import('./pages/member/Progress'));
const Nutrition = lazy(() => import('./pages/member/Nutrition'));
const AnimatedWorkouts = lazy(() => import('./pages/member/AnimatedWorkouts'));
const AttendanceScanner = lazy(() => import('./pages/member/AttendanceScanner'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
        <Suspense fallback={<div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>}>
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
            <Route path="/admin/diet-plans" element={
              <ProtectedRoute roles={['owner', 'trainer']}>
                <AdminLayout><DietPlans /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute roles={['owner', 'trainer']}>
                <AdminLayout><Settings /></AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/app-settings" element={
              <ProtectedRoute roles={['owner', 'trainer']}>
                <AdminLayout><AppSettings /></AdminLayout>
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
            <Route path="/member/exercises" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><ExerciseLibrary /></MemberLayout>
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
            <Route path="/member/ai" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><MemberAIPage /></MemberLayout>
              </ProtectedRoute>
            } />
            <Route path="/member/progress" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><Progress /></MemberLayout>
              </ProtectedRoute>
            } />
            <Route path="/member/nutrition" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><Nutrition /></MemberLayout>
              </ProtectedRoute>
            } />
            <Route path="/member/animated" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><AnimatedWorkouts /></MemberLayout>
              </ProtectedRoute>
            } />
            <Route path="/member/scan" element={
              <ProtectedRoute roles={['member']}>
                <MemberLayout><AttendanceScanner /></MemberLayout>
              </ProtectedRoute>
            } />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
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

import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import MemberLayout from './components/layout/MemberLayout';

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const MemberLogin = lazy(() => import('./pages/auth/MemberLogin'));
const Register = lazy(() => import('./pages/auth/Register'));

// Admin pages
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
const Programs = lazy(() => import('./pages/admin/Programs'));
const Help = lazy(() => import('./pages/Help'));

// Member pages (Consolidated)
const MemberDashboard = lazy(() => import('./pages/member/Dashboard'));
const AccessPass = lazy(() => import('./pages/member/AccessPass'));
const TrainingHub = lazy(() => import('./pages/member/TrainingPlan'));
const LiveStudio = lazy(() => import('./pages/member/LiveStudio'));
const Profile = lazy(() => import('./pages/member/Profile'));
const CoachAI = lazy(() => import('./pages/member/CoachAI'));
const FuelHQ = lazy(() => import('./pages/member/FuelHQ'));
const NeuralBasement = lazy(() => import('./pages/member/NeuralBasement'));
const AttendanceTerminal = lazy(() => import('./pages/admin/terminal/AttendanceTerminal'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false }
  }
});

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'member' ? '/member' : '/admin'} replace />;
  return children;
};

function App() {
  const initialize = useAuthStore(s => s.initialize);
  const gym = useAuthStore(s => s.gym);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (gym?.accentColor) {
      document.documentElement.style.setProperty('--primary', gym.accentColor);
      // Generate lighter/darker shades or opacity for other variables if needed
      document.documentElement.style.setProperty('--primary-surface', `${gym.accentColor}15`);
      document.documentElement.style.setProperty('--primary-border', `${gym.accentColor}40`);
      document.documentElement.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${gym.accentColor} 0%, #EF4444 100%)`);
    } else {
      // Reset to default
      document.documentElement.style.setProperty('--primary', '#F59E0B');
      document.documentElement.style.setProperty('--primary-surface', 'rgba(245, 158, 11, 0.08)');
      document.documentElement.style.setProperty('--primary-border', 'rgba(245, 158, 11, 0.25)');
      document.documentElement.style.setProperty('--gradient-brand', 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)');
    }
  }, [gym]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/member-login" element={<PublicRoute><MemberLogin /></PublicRoute>} />
            {/* /register is for gym owner signup only — members are added by admin */}
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Members /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/classes" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Classes /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/attendance" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Attendance /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Payments /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Analytics /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/leaderboard" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Leaderboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/programs" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Programs /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/diet-plans" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><DietPlans /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/app-settings" element={<ProtectedRoute roles={['owner', 'trainer']}><AdminLayout><AppSettings /></AdminLayout></ProtectedRoute>} />

            {/* Member */}
            <Route path="/member" element={<ProtectedRoute roles={['member']}><MemberLayout><MemberDashboard /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/pass" element={<ProtectedRoute roles={['member']}><MemberLayout><AccessPass /></MemberLayout></ProtectedRoute>} />
            
            {/* Consolidated Training Hub */}
            <Route path="/member/training" element={<ProtectedRoute roles={['member']}><MemberLayout><TrainingHub /></MemberLayout></ProtectedRoute>} />
            
            {/* Legacy Training Redirects */}
            <Route path="/member/workouts" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/matrix" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/exercises" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/flow" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/animated" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/performance" element={<Navigate to="/member/training?tab=EVOLUTION" replace />} />
            <Route path="/member/vault" element={<Navigate to="/member/training" replace />} />
            <Route path="/member/progress" element={<Navigate to="/member/training" replace />} />

            <Route path="/member/studio" element={<ProtectedRoute roles={['member']}><MemberLayout><LiveStudio /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/profile" element={<ProtectedRoute roles={['member']}><MemberLayout><Profile /></MemberLayout></ProtectedRoute>} />
            
            <Route path="/member/coach" element={<ProtectedRoute roles={['member']}><MemberLayout><CoachAI /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/ai" element={<Navigate to="/member/coach" replace />} />
            
            <Route path="/member/nutrition" element={<ProtectedRoute roles={['member']}><MemberLayout><FuelHQ /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/fuel" element={<Navigate to="/member/nutrition" replace />} />

            <Route path="/member/basement" element={<ProtectedRoute roles={['member']}><MemberLayout><NeuralBasement /></MemberLayout></ProtectedRoute>} />
            <Route path="/member/local-ai" element={<Navigate to="/member/basement" replace />} />

            <Route path="/support" element={<ProtectedRoute><Help /></ProtectedRoute>} />

            <Route path="/admin/terminal" element={<ProtectedRoute roles={['member', 'owner', 'trainer']}><AttendanceTerminal /></ProtectedRoute>} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface-2)', color: 'var(--text-1)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '0.875rem' } }} />
      <style>{`
        .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
        .spinner { width: 32px; height: 32px; border: 3px solid rgba(245,158,11,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </QueryClientProvider>
  );
}

export default App;

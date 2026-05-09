import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, QrCode, CreditCard,
  BarChart3, Trophy, Settings, ChevronLeft, LogOut, Smartphone, Utensils
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AdminAI from '../ai/AdminAI';
import NotificationBell from '../ui/NotificationBell';

const NAV = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/members', icon: Users, label: 'Members' },
  { path: '/admin/classes', icon: Dumbbell, label: 'Classes' },
  { path: '/admin/diet-plans', icon: Utensils, label: 'Diet Plans' },
  { path: '/admin/attendance', icon: QrCode, label: 'Attendance' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
  { path: '/admin/app-settings', icon: Smartphone, label: 'Mobile App' },
];

function NavItem({ item, collapsed }) {
  const { pathname } = useLocation();
  const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
  return (
    <Link
      to={item.path}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: collapsed ? '12px 0' : '10px 14px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--primary)' : 'var(--text-3)',
        background: isActive ? 'var(--primary-surface)' : 'transparent',
        border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
        transition: 'var(--transition)',
        textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
        position: 'relative', whiteSpace: 'nowrap',
      }}
      title={collapsed ? item.label : undefined}
      onMouseEnter={e => {
        if (!isActive) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-1)'; }
      }}
      onMouseLeave={e => {
        if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }
      }}
    >
      {isActive && (
        <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, background: 'var(--primary)', borderRadius: '0 3px 3px 0' }} />
      )}
      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pageTitle = NAV.find(n => n.exact ? pathname === n.path : pathname.startsWith(n.path))?.label || 'GymFlow Pro';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'linear-gradient(180deg, #0D0D0F 0%, #111113 100%)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 100, overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 14px' : '20px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 36, height: 36, background: 'var(--gradient-brand)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-amber)' }}>
            <Dumbbell size={18} color="white" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1rem', color: 'var(--text-1)', lineHeight: 1.1 }}>GymFlow</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pro Admin</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '16px 10px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}
        </nav>

        {/* User + Collapse */}
        <div style={{ padding: collapsed ? '12px 10px' : '12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 32, height: 32, background: 'var(--gradient-brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                {(user?.firstName?.[0] || 'A')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName || 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{user?.role || 'admin'}</div>
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCollapsed(c => !c)}
            style={{ justifyContent: 'center', padding: '8px', border: 'none' }}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <motion.div
        animate={{ marginLeft: collapsed ? 68 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      >
        {/* Topbar */}
        <header style={{
          height: 64, background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 28px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>{pageTitle}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotificationBell />
            <button className="btn btn-ghost btn-sm" onClick={async () => { await logout(); navigate('/login'); }} style={{ gap: 6, color: 'var(--text-3)' }}>
              <LogOut size={15} />
              <span style={{ fontSize: '0.8rem' }}>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px', overflowX: 'hidden' }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>

      {/* Floating Admin AI */}
      <AdminAI />
    </div>
  );
}

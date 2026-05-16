import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Dumbbell, QrCode, CreditCard,
  BarChart3, Trophy, Settings, ChevronLeft, LogOut, Smartphone, Utensils, ClipboardList, HelpCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import AdminAI from '../ai/AdminAI';
import NotificationBell from '../ui/NotificationBell';

const NAV = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/members', icon: Users, label: 'Members' },
  { path: '/admin/classes', icon: Dumbbell, label: 'Classes' },
  { path: '/admin/programs', icon: ClipboardList, label: 'Programs' },
  { path: '/admin/diet-plans', icon: Utensils, label: 'Diet Plans' },
  { path: '/admin/terminal', icon: QrCode, label: 'Attendance Terminal' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
  { path: '/admin/app-settings', icon: Smartphone, label: 'Mobile App' },
  { path: '/support', icon: HelpCircle, label: 'Command Support' },
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
          background: 'linear-gradient(180deg, #09090B 0%, #050507 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 100, overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ padding: collapsed ? '20px 14px' : '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12, justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <div style={{ width: 40, height: 40, background: 'var(--gradient-brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-amber)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Dumbbell size={20} color="white" strokeWidth={2.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-1)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>GymFlow</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>Quantum Admin</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '16px 10px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}
        </nav>

        {/* User + Collapse */}
        <div style={{ padding: collapsed ? '12px 10px' : '16px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: 34, height: 34, background: 'var(--gradient-brand)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                {(user?.firstName?.[0] || 'A')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName || 'Admin'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'admin'}</div>
              </div>
            </div>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCollapsed(c => !c)}
            style={{ justifyContent: 'center', padding: '10px', border: 'none', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}
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
          height: 72, background: 'rgba(5,5,7,0.85)', backdropFilter: 'blur(30px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 32px',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.25rem', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>{pageTitle}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <NotificationBell />
            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />
            <button className="btn btn-ghost btn-sm" onClick={async () => { await logout(); navigate('/login'); }} style={{ gap: 8, color: 'var(--text-3)', padding: '8px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <LogOut size={15} color="var(--danger)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-2)' }}>LOGOUT</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
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

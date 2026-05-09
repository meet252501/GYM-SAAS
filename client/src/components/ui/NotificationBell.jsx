import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CreditCard, Users, Calendar, Zap, Trophy } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'expiry', icon: CreditCard, color: '#ef4444', title: 'Membership Expiring', body: 'Priya Patel\'s plan expires in 3 days', time: '5m ago', unread: true },
  { id: 2, type: 'member', icon: Users, color: '#10b981', title: 'New Member Joined', body: 'Ananya Bose signed up for Basic plan', time: '1h ago', unread: true },
  { id: 3, type: 'class', icon: Calendar, color: '#3b82f6', title: 'Class Full', body: 'HIIT Blast is at full capacity (15/15)', time: '2h ago', unread: true },
  { id: 4, type: 'payment', icon: CreditCard, color: '#f59e0b', title: 'Payment Received', body: 'Arjun Sharma paid ₹1,499 (Premium)', time: '3h ago', unread: false },
  { id: 5, type: 'streak', icon: Trophy, color: '#8b5cf6', title: 'Leaderboard Update', body: 'Vikram Singh now leads with 312 pts', time: '5h ago', unread: false },
  { id: 6, type: 'expiry', icon: Zap, color: '#ef4444', title: 'Overdue Payment', body: 'Sneha Reddy — ₹799 overdue (Basic)', time: '1d ago', unread: false },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const dismiss = (id) => setNotifications(n => n.filter(x => x.id !== id));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(o => !o)}
        className="btn btn-ghost btn-icon btn-sm" style={{ position: 'relative' }}>
        <motion.div animate={unreadCount > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}>
          <Bell size={17} />
        </motion.div>
        {unreadCount > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, background: 'var(--danger)', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg)' }}>
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: 340, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 500, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Notifications</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 1 }}>{unreadCount} unread</div>
              </div>
              {unreadCount > 0 && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={markAllRead}
                  style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all read
                </motion.button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              <AnimatePresence>
                {notifications.map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0, padding: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.unread ? 'rgba(245,158,11,0.04)' : 'transparent', position: 'relative' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <n.icon size={16} color={n.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {n.title}
                        {n.unread && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-4)', marginTop: 4 }}>{n.time}</div>
                    </div>
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => dismiss(n.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', flexShrink: 0, padding: 2 }}>
                      <X size={13} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {notifications.length === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
                  <Bell size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
                  <div style={{ fontWeight: 600 }}>All caught up!</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

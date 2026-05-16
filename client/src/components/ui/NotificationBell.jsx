import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Info, AlertTriangle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount()
      ]);
      setNotifications(notifsRes.data.data);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchNotifications, 0);
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'membership': return <AlertTriangle size={16} color="var(--warning)" />;
      case 'badge': return <Trophy size={16} color="var(--primary)" />;
      case 'leaderboard': return <Check size={16} color="var(--success)" />;
      default: return <Info size={16} color="var(--info)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          width: 38, height: 38,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-2)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <Bell size={20} fill={unreadCount > 0 ? 'var(--primary)' : 'transparent'} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--primary)', color: 'black',
            fontSize: '0.65rem', fontWeight: 800,
            minWidth: 16, height: 16, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid var(--bg)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute', top: '140%', right: -10,
              width: 320, maxHeight: 420,
              background: 'rgba(15, 15, 18, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
              zIndex: 9999, overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
                  <Bell size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
                  <div style={{ fontSize: '0.85rem' }}>No notifications yet</div>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: notif.read ? 'transparent' : 'rgba(245,158,11,0.03)',
                      cursor: notif.read ? 'default' : 'pointer',
                      display: 'flex', gap: 12, transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, 
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                      {getIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: notif.read ? 500 : 700, color: 'var(--text-1)', marginBottom: 2 }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 4 }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    {!notif.read && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 6 }} />
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div style={{ padding: 12, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
               <button onClick={() => setNotifications([])} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.75rem', cursor: 'pointer' }}>
                 Clear History
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function NotFound() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const goHome = () => {
    if (!isAuthenticated) return navigate('/login');
    navigate(user?.role === 'member' ? '/member' : '/admin');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', gap: 28, textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-20%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.06, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(90px)', opacity: 0.055, pointerEvents: 'none' }} />

      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ position: 'relative' }}
      >
        <div style={{
          fontSize: 'clamp(7rem, 28vw, 12rem)',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.04em',
          filter: 'drop-shadow(0 0 60px rgba(245,158,11,0.25))',
        }}>
          404
        </div>
        {/* Dumbbell emoji floating */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: -20, right: -20,
            fontSize: '3rem',
          }}
        >
          🏋️
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', margin: 0, maxWidth: 340, lineHeight: 1.6 }}>
          Looks like this page skipped leg day — it's not here.<br />
          Let's get you back on track.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={goHome}
        style={{
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          color: '#000', fontWeight: 800, fontSize: '1rem',
          padding: '14px 36px', borderRadius: 50,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
        }}
      >
        💪 Back to GymFlow
      </motion.button>
    </div>
  );
}

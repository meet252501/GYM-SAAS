import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function MemberLogin() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const login    = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== 'member') {
        toast.error('This portal is for members only. Use /login for admin access.');
        await useAuthStore.getState().logout();
        return;
      }
      toast.success(`Let's go, ${user.firstName || 'champ'}! 💪`);
      navigate('/member');
    } catch (err) {
      if (!err.response) {
        toast.error('Cannot reach server. Try again in a moment.');
      } else {
        toast.error(err.response?.data?.message || 'Invalid credentials');
      }
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: '55vw', height: '55vw',
        background: 'radial-gradient(circle, rgba(251,176,64,0.18) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: '45vw', height: '45vw',
        background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(70px)', pointerEvents: 'none',
      }} />
      {/* Animated particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          style={{
            position: 'absolute',
            width: `${4 + (i % 3) * 3}px`, height: `${4 + (i % 3) * 3}px`,
            background: i % 2 === 0 ? 'rgba(251,176,64,0.6)' : 'rgba(239,68,68,0.5)',
            borderRadius: '50%',
            left: `${10 + i * 11}%`,
            top: `${15 + (i % 4) * 18}%`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(14,14,20,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '2.5rem',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
          background: 'linear-gradient(90deg, transparent, #F59E0B, #EF4444, transparent)',
          borderRadius: '2px',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <Zap size={24} color="#fff" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{
              fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.5px',
              background: 'linear-gradient(90deg, #FBB040, #fff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>GymFlow Pro</div>
            <div style={{ fontSize: '10px', color: '#F59E0B', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Member Portal
            </div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Welcome back 💪
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Sign in with the credentials sent to your email
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{
                  width: '100%', padding: '12px 14px 12px 42px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{
                  width: '100%', padding: '12px 42px 12px 42px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#fff', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0,
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontSize: '0.95rem', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(245,158,11,0.35)',
              marginTop: '4px',
              letterSpacing: '0.3px',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <>Enter Portal <ChevronRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* Info note */}
        <div style={{
          marginTop: '1.5rem', padding: '12px 16px',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '10px', fontSize: '12px', color: 'rgba(255,255,255,0.4)',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          🔑 Your credentials were sent to your email when your gym enrolled you.
          <br />Contact your gym if you didn't receive them.
        </div>

        {/* Admin link */}
        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
          <a href="/login" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', textDecoration: 'none' }}>
            Gym admin? Sign in here →
          </a>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Dumbbell, Mail, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back! 💪`);
      navigate(user.role === 'member' ? '/member' : '/admin');
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
        toast.error('Cannot connect to server. Is the backend running?');
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Dumbbell size={28} strokeWidth={2.5} />
          </div>
          <div>
            <div className="auth-logo-name">GymFlow Pro</div>
            <div className="auth-logo-sub">Admin Portal</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-desc">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="you@gym.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Member? Your credentials were sent by your gym via email.</span>
        </div>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          pointer-events: none;
        }
        .auth-orb-1 {
          width: 400px; height: 400px;
          background: var(--primary);
          top: -100px; right: -80px;
        }
        .auth-orb-2 {
          width: 300px; height: 300px;
          background: var(--success);
          bottom: -80px; left: -60px;
        }
        .auth-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          box-shadow: var(--shadow-lg);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin-bottom: 2rem;
        }
        .auth-logo-icon {
          width: 48px; height: 48px;
          border-radius: var(--radius-lg);
          background: var(--gradient-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-amber);
        }
        .auth-logo-name {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-1);
        }
        .auth-logo-sub {
          font-size: 0.75rem;
          color: var(--text-3);
        }
        .auth-title {
          font-size: 1.75rem;
          font-weight: 900;
          margin-bottom: 0.375rem;
        }
        .auth-desc {
          color: var(--text-2);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: var(--text-2);
        }
        .auth-link { color: var(--primary); font-weight: 600; }
        .auth-link:hover { text-decoration: underline; }
        .auth-demo-hint {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: var(--surface-2);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-3);
        }
      `}</style>
    </div>
  );
}

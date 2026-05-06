import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Mail, Lock, User, Phone, Building } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', gymName: '', gymPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Gym created successfully! 🎉');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-logo">
          <div className="auth-logo-icon"><Dumbbell size={28} strokeWidth={2.5} /></div>
          <div>
            <div className="auth-logo-name">GymFlow Pro</div>
            <div className="auth-logo-sub">Create your gym</div>
          </div>
        </div>

        <h1 className="auth-title">Set up your gym</h1>
        <p className="auth-desc">Everything you need to run a modern gym</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Owner name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <div className="input-wrapper">
                <User size={15} className="input-icon" />
                <input className="form-input" placeholder="Meet" value={form.firstName} onChange={set('firstName')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Sutariya" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gym Name</label>
            <div className="input-wrapper">
              <Building size={15} className="input-icon" />
              <input className="form-input" placeholder="Iron Paradise Gym" value={form.gymName} onChange={set('gymName')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail size={15} className="input-icon" />
              <input type="email" className="form-input" placeholder="owner@gym.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gym Phone</label>
            <div className="input-wrapper">
              <Phone size={15} className="input-icon" />
              <input className="form-input" placeholder="+91 98765 43210" value={form.gymPhone} onChange={set('gymPhone')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={15} className="input-icon" />
              <input type="password" className="form-input" placeholder="Min 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating gym...</> : 'Create Gym Account 🚀'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </motion.div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 1.5rem; position: relative; overflow: hidden; }
        .auth-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; pointer-events: none; }
        .auth-orb-1 { width: 400px; height: 400px; background: var(--primary); top: -100px; right: -80px; }
        .auth-orb-2 { width: 300px; height: 300px; background: var(--success); bottom: -80px; left: -60px; }
        .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-2xl); padding: 2.5rem; width: 100%; max-width: 480px; position: relative; z-index: 1; box-shadow: var(--shadow-lg); }
        .auth-logo { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.75rem; }
        .auth-logo-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); background: var(--gradient-brand); display: flex; align-items: center; justify-content: center; color: white; box-shadow: var(--shadow-amber); }
        .auth-logo-name { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; }
        .auth-logo-sub { font-size: 0.75rem; color: var(--text-3); }
        .auth-title { font-size: 1.6rem; font-weight: 900; margin-bottom: 0.375rem; }
        .auth-desc { color: var(--text-2); font-size: 0.875rem; margin-bottom: 1.75rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: var(--text-2); }
        .auth-link { color: var(--primary); font-weight: 600; }
      `}</style>
    </div>
  );
}

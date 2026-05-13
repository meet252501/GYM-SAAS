import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Mail, Lock, User, Phone, Building,
  ArrowLeft, ArrowRight, MapPin, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STEPS = ['Your Details', 'Your Gym'];

export default function Register() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    gymName: '', gymPhone: '', gymCity: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore(s => s.register);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        toast.error('Please fill all fields');
        return;
      }
      if (form.password.length < 8) {
        toast.error('Password must be at least 8 characters');
        return;
      }
    }
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.gymName) { toast.error('Gym name is required'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Gym created successfully! 🎉');
      navigate('/admin');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message;
      if (!err.response) {
        toast.error('Database connection failed. Please ensure MongoDB is running.');
      } else {
        toast.error(msg || 'Registration failed. Please check your details.');
      }
    } finally { setLoading(false); }
  };

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
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
        style={{ maxWidth: 460 }}
      >
        {/* Header */}
        <div className="auth-logo">
          <button
            type="button"
            onClick={() => step === 0 ? navigate('/login') : setStep(0)}
            className="auth-back-btn"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="auth-logo-icon"><Dumbbell size={26} strokeWidth={2.5} /></div>
          <div>
            <div className="auth-logo-name">GymFlow Pro</div>
            <div className="auth-logo-sub">New gym setup</div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="reg-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`reg-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="reg-step-dot">
                {i < step ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
              </div>
              <span className="reg-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className="reg-step-line" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait" custom={step}>
          {step === 0 && (
            <motion.form
              key="step-0"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onSubmit={nextStep}
              className="auth-form"
            >
              <div>
                <h1 className="auth-title">Your details</h1>
                <p className="auth-desc">Who's running this gym?</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <div className="input-wrapper">
                    <User size={15} className="input-icon" />
                    <input className="form-input" placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Smith" value={form.lastName} onChange={set('lastName')} required />
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
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={15} className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                    minLength={8}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block">
                Next — Set up your gym <ArrowRight size={16} />
              </button>
            </motion.form>
          )}

          {step === 1 && (
            <motion.form
              key="step-1"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onSubmit={handleSubmit}
              className="auth-form"
            >
              <div>
                <h1 className="auth-title">Your gym</h1>
                <p className="auth-desc">Tell us about your gym — you'll get your own private workspace.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Gym Name</label>
                <div className="input-wrapper">
                  <Building size={15} className="input-icon" />
                  <input className="form-input" placeholder="Iron Paradise Gym" value={form.gymName} onChange={set('gymName')} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-wrapper">
                  <MapPin size={15} className="input-icon" />
                  <input className="form-input" placeholder="Mumbai" value={form.gymCity} onChange={set('gymCity')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <div className="input-wrapper">
                  <Phone size={15} className="input-icon" />
                  <input className="form-input" placeholder="+91 98765 43210" value={form.gymPhone} onChange={set('gymPhone')} />
                </div>
              </div>

              {/* Isolation callout */}
              <div className="reg-isolation-badge">
                <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
                <span>Your gym gets a private workspace — members, attendance, and data are fully isolated from other gyms.</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? <><span className="spinner" /> Creating gym...</> : 'Create Gym Account 🚀'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="auth-footer" style={{ marginTop: '1.25rem' }}>
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </motion.div>

      <style>{`
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 1.5rem; position: relative; overflow: hidden; }
        .auth-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2; pointer-events: none; }
        .auth-orb-1 { width: 400px; height: 400px; background: var(--primary); top: -100px; right: -80px; }
        .auth-orb-2 { width: 300px; height: 300px; background: var(--success); bottom: -80px; left: -60px; }
        .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-2xl); padding: 2.25rem; width: 100%; position: relative; z-index: 1; box-shadow: var(--shadow-lg); }
        .auth-logo { display: flex; align-items: center; gap: 0.875rem; margin-bottom: 1.5rem; }
        .auth-logo-icon { width: 44px; height: 44px; border-radius: var(--radius-lg); background: var(--gradient-brand); display: flex; align-items: center; justify-content: center; color: white; box-shadow: var(--shadow-amber); }
        .auth-logo-name { font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; }
        .auth-logo-sub { font-size: 0.72rem; color: var(--text-3); }
        .auth-title { font-size: 1.5rem; font-weight: 900; margin-bottom: 0.3rem; }
        .auth-desc { color: var(--text-2); font-size: 0.875rem; margin-bottom: 1.5rem; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .auth-footer { text-align: center; font-size: 0.875rem; color: var(--text-2); }
        .auth-link { color: var(--primary); font-weight: 600; }
        .auth-back-btn { background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); width: 38px; height: 38px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .auth-back-btn:hover { background: var(--surface-3); color: var(--text-1); transform: translateX(-2px); }

        /* Step indicator */
        .reg-steps { display: flex; align-items: center; gap: 0; margin-bottom: 1.75rem; }
        .reg-step { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
        .reg-step-dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: var(--text-3); background: var(--surface-2); transition: all 0.3s; flex-shrink: 0; }
        .reg-step.active .reg-step-dot { border-color: var(--primary); color: var(--primary); background: rgba(245,158,11,0.12); }
        .reg-step.done .reg-step-dot { border-color: var(--success); color: var(--success); background: rgba(34,197,94,0.12); }
        .reg-step-label { font-size: 0.75rem; font-weight: 600; color: var(--text-3); white-space: nowrap; }
        .reg-step.active .reg-step-label { color: var(--text-1); }
        .reg-step.done .reg-step-label { color: var(--success); }
        .reg-step-line { flex: 1; height: 1px; background: var(--border); margin: 0 0.5rem; }

        /* Isolation badge */
        .reg-isolation-badge { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.75rem 1rem; background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-md); font-size: 0.8rem; color: var(--text-2); line-height: 1.5; }
      `}</style>
    </div>
  );
}

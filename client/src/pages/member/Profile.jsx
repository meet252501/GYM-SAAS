import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CreditCard, Bell, Shield, Heart, ChevronRight, Save, CheckCircle, Edit2, Camera } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// Toggle switch
function Toggle({ value, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!value)}
      style={{
        width: 46, height: 25, borderRadius: 13,
        background: value ? 'var(--success)' : 'var(--surface-4, var(--surface-3))',
        padding: 3, cursor: 'pointer', display: 'flex', alignItems: 'center',
        transition: 'background 0.2s'
      }}
    >
      <motion.div
        animate={{ x: value ? 21 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 19, height: 19, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      />
    </motion.div>
  );
}

// Generic expandable row
function SettingsRow({ icon, label, iconClass, children, isToggle, toggleValue, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => isToggle ? onToggle(!toggleValue) : setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className={iconClass}>{icon}</div>
          <span style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.95rem' }}>{label}</span>
        </div>
        {isToggle
          ? <Toggle value={toggleValue} onChange={onToggle} />
          : (
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight size={18} style={{ color: 'var(--text-3)' }} />
            </motion.div>
          )
        }
      </button>

      <AnimatePresence>
        {!isToggle && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '16px 20px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Save toast
function Toast({ msg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        position: 'fixed', top: 80, right: 20, zIndex: 200,
        background: 'var(--success)', color: 'white',
        padding: '10px 18px', borderRadius: 16, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(16,185,129,0.5)'
      }}
    >
      <CheckCircle size={16} /> {msg}
    </motion.div>
  );
}

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState({ email: true, push: true, class: false });
  const [healthSync, setHealthSync] = useState(true);
  const [editProfile, setEditProfile] = useState({ name: user?.name || 'Alex Johnson', email: 'alex@gymflowpro.com', weight: '76', height: '180' });
  const [saving, setSaving] = useState(false);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); showToast('Profile updated!'); }, 900);
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
    >
      <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>

      {/* ── Avatar Hero ────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: 16 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--danger))', padding: '3px'
          }}>
            <img
              src="https://i.pravatar.cc/150?img=11"
              alt="Profile"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--bg)' }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => showToast('Photo upload coming soon!')}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary)', border: '3px solid var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Camera size={13} color="white" />
          </motion.button>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginTop: 14, marginBottom: 4 }}>{editProfile.name || 'Alex Johnson'}</h2>
        <p className="badge badge-epic" style={{ margin: '0 auto', padding: '4px 12px', display: 'inline-block' }}>PRO Member</p>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid-2">
        <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
          <div className="text-faint text-sm">Weight</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{editProfile.weight}<span style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>kg</span></div>
        </div>
        <div className="card-glass" style={{ padding: '16px', textAlign: 'center' }}>
          <div className="text-faint text-sm">Height</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{editProfile.height}<span style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>cm</span></div>
        </div>
      </motion.div>

      {/* ── Settings Rows ─────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h3 className="text-faint" style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 12, fontWeight: 700 }}>Account</h3>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Account Preferences — editable form */}
          <SettingsRow
            icon={<Edit2 size={18} />}
            label="Edit Profile"
            iconClass="text-primary"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Full Name</label>
                  <input className="form-input" value={editProfile.name} onChange={e => setEditProfile(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Email</label>
                  <input className="form-input" type="email" value={editProfile.email} onChange={e => setEditProfile(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Weight (kg)</label>
                  <input className="form-input" type="number" value={editProfile.weight} onChange={e => setEditProfile(f => ({ ...f, weight: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Height (cm)</label>
                  <input className="form-input" type="number" value={editProfile.height} onChange={e => setEditProfile(f => ({ ...f, height: e.target.value }))} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-end' }}>
                {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : <Save size={13} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </SettingsRow>

          {/* Notifications */}
          <SettingsRow icon={<Bell size={18} />} label="Notifications" iconClass="text-info">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'email', label: 'Email Alerts', desc: 'Class confirmations & receipts' },
                { key: 'push', label: 'Push Notifications', desc: 'Real-time reminders' },
                { key: 'class', label: 'Class Full Alerts', desc: 'When a class reaches capacity' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>{item.desc}</div>
                  </div>
                  <Toggle value={notifications[item.key]} onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
                </div>
              ))}
            </div>
          </SettingsRow>

          {/* Billing */}
          <SettingsRow icon={<CreditCard size={18} />} label="Billing & Plan" iconClass="text-success">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface-3)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Premium Plan</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Renews June 1, 2025 • $120/mo</div>
                </div>
                <span className="badge badge-active">Active</span>
              </div>
              <div style={{ padding: '12px 14px', background: 'var(--surface-3)', borderRadius: 12 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 4 }}>Payment Method</div>
                <div style={{ fontWeight: 700 }}>•••• •••• •••• 4242</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="btn btn-ghost btn-sm"
                onClick={() => showToast('Billing portal coming soon!')}
                style={{ alignSelf: 'flex-start' }}
              >
                Manage Subscription →
              </motion.button>
            </div>
          </SettingsRow>

          {/* Privacy & Security */}
          <SettingsRow icon={<Shield size={18} />} label="Privacy & Security" iconClass="text-warning">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {['Change Password', 'Two-Factor Authentication', 'Download My Data', 'Delete Account'].map((item, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => showToast(`${item} — coming soon`)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--surface-3)', border: i === 3 ? '1px solid rgba(239,68,68,0.2)' : 'none',
                    borderRadius: 10, cursor: 'pointer', color: i === 3 ? 'var(--danger)' : 'var(--text-1)', fontWeight: 600, fontSize: '0.9rem'
                  }}
                >
                  {item}
                  <ChevronRight size={16} style={{ opacity: 0.5 }} />
                </motion.button>
              ))}
            </div>
          </SettingsRow>

          {/* Health Sync — toggle only */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Heart size={18} className="text-danger" />
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: '0.95rem' }}>Apple Health Sync</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{healthSync ? 'Syncing workouts & calories' : 'Sync disabled'}</div>
              </div>
            </div>
            <Toggle value={healthSync} onChange={setHealthSync} />
          </div>
        </div>
      </motion.div>

      {/* ── Sign Out ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ paddingBottom: 24 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={logout}
          className="btn btn-danger btn-block"
          style={{ padding: '16px', borderRadius: '16px', fontSize: '1.05rem' }}
        >
          <LogOut size={20} /> Sign Out
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

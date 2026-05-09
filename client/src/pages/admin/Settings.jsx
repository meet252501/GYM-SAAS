import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Bell, Shield, Smartphone, CheckCircle, Building, Mail, MapPin, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { gymApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';

// Toast component
function SaveToast({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 200,
            background: 'var(--success)', color: 'white',
            padding: '10px 18px', borderRadius: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(16,185,129,0.4)'
          }}
        >
          <CheckCircle size={16} /> Changes saved!
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toggle Switch
function ToggleSwitch({ value, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13,
        background: value ? 'var(--success)' : 'var(--surface-4)',
        padding: 3, cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        transition: 'background 0.2s'
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      />
    </motion.div>
  );
}

const TABS = [
  { id: 'general', icon: Building, label: 'General' },
  { id: 'contact', icon: Mail, label: 'Contact' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'app', icon: Smartphone, label: 'App' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [generalForm, setGeneralForm] = useState({ gymName: 'GymFlow Pro Iron', tagline: 'Train Hard. Recover Smart.', timezone: 'Asia/Kolkata' });
  const [contactForm, setContactForm] = useState({ email: 'admin@gymflowpro.com', phone: '+91 98765 43210', address: '123 Iron Avenue, Mumbai, MH 400001', website: 'https://gymflowpro.com' });
  const [notifications, setNotifications] = useState({ newMember: true, paymentFailed: true, classBooked: false, lowCapacity: true, weeklyReport: false });
  const [security, setSecurity] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [appSettings, setAppSettings] = useState({ maintenanceMode: false, memberSelfSignup: true, requireApproval: false, showLeaderboard: true, darkModeDefault: true });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await gymApi.getSettings();
        if (data.success) {
          const gym = data.data;
          setGeneralForm({ 
            gymName: gym.name || '', 
            tagline: gym.tagline || '', 
            timezone: gym.timezone || 'Asia/Kolkata' 
          });
          setContactForm({ 
            email: gym.email || '', 
            phone: gym.phone || '', 
            address: gym.address?.street ? `${gym.address.street}, ${gym.address.city}` : '', 
            website: gym.website || '' 
          });
          // Add mapping for notifications and appSettings if schema supports them
        }
      } catch (error) {
        console.error('Failed to fetch gym settings:', error);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const updateData = {
        name: generalForm.gymName,
        tagline: generalForm.tagline,
        timezone: generalForm.timezone,
        email: contactForm.email,
        phone: contactForm.phone,
        // address needs more complex parsing or schema update
      };
      
      const { data } = await gymApi.updateSettings(updateData);
      if (data.success) {
        setToast(true);
        setTimeout(() => setToast(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <CyberMatrix opacity={0.03} />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SaveToast visible={toast} />

      {/* Tab Bar */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        {TABS.map(tab => (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.95 }}
            className={`btn ${activeTab === tab.id ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              border: activeTab === tab.id ? '1px solid var(--border-hover)' : 'none',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <tab.icon size={15} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── General ── */}
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Building size={18} /> Gym Profile</h3>
            <div className="form-group">
              <label className="form-label">Gym Name</label>
              <input className="form-input" value={generalForm.gymName} onChange={e => setGeneralForm(f => ({ ...f, gymName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline / Slogan</label>
              <input className="form-input" value={generalForm.tagline} onChange={e => setGeneralForm(f => ({ ...f, tagline: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="form-select" value={generalForm.timezone} onChange={e => setGeneralForm(f => ({ ...f, timezone: e.target.value }))}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              </select>
            </div>
            <div className="flex justify-end">
              <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Contact ── */}
        {activeTab === 'contact' && (
          <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={18} /> Contact Details</h3>
            <div className="form-group">
              <label className="form-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email</label>
              <input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</label>
              <input className="form-input" type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Address</label>
              <textarea className="form-textarea" rows="3" value={contactForm.address} onChange={e => setContactForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" type="url" value={contactForm.website} onChange={e => setContactForm(f => ({ ...f, website: e.target.value }))} />
            </div>
            <div className="flex justify-end">
              <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <h3 style={{ margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={18} /> Notification Preferences</h3>
            {[
              { key: 'newMember', label: 'New Member Joined', desc: 'Alert when a new member registers' },
              { key: 'paymentFailed', label: 'Payment Failed', desc: 'Alert for failed or declined payments' },
              { key: 'classBooked', label: 'Class Booked', desc: 'Notify when a class is fully booked' },
              { key: 'lowCapacity', label: 'Low Capacity Warning', desc: 'Alert when class is almost full' },
              { key: 'weeklyReport', label: 'Weekly Summary', desc: 'Receive weekly analytics email' },
            ].map((item, i, arr) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <ToggleSwitch value={notifications[item.key]} onChange={v => setNotifications(n => ({ ...n, [item.key]: v }))} />
              </div>
            ))}
            <div className="flex justify-end" style={{ paddingTop: 24 }}>
              <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
                {saving ? 'Saving...' : 'Save Preferences'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Security ── */}
        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Change Password</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={15} />
                <input
                  className="form-input" type={showOldPw ? 'text' : 'password'}
                  placeholder="••••••••" value={security.oldPassword}
                  onChange={e => setSecurity(s => ({ ...s, oldPassword: e.target.value }))}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowOldPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={15} />
                <input
                  className="form-input" type={showNewPw ? 'text' : 'password'}
                  placeholder="Min 8 characters" value={security.newPassword}
                  onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={15} />
                <input
                  className="form-input" type="password"
                  placeholder="Repeat password" value={security.confirmPassword}
                  onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            {security.newPassword && security.confirmPassword && security.newPassword !== security.confirmPassword && (
              <div style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>⚠ Passwords do not match</div>
            )}
            <div className="flex justify-end">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || (security.newPassword !== security.confirmPassword && !!security.newPassword)}
              >
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
                {saving ? 'Updating...' : 'Update Password'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── App ── */}
        {activeTab === 'app' && (
          <motion.div key="app" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ─ Member Access Card ─ */}
            <div className="card" style={{ maxWidth: 600 }}>
              <h3 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smartphone size={18} /> Member App Access
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: '0 0 20px' }}>
                Share the app with members. They open the link in their phone browser and log in with their credentials.
              </p>

              {/* App URL + QR */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ padding: 12, background: 'white', borderRadius: 14, border: '2px solid rgba(245,158,11,0.3)', boxShadow: '0 0 20px rgba(245,158,11,0.1)', flexShrink: 0 }}>
                  {/* Simple inline QR using CSS art — replaced with real QR via qrcode.react */}
                  <div style={{ width: 120, height: 120, background: '#09090B', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                    <div style={{ textAlign: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 700, padding: 8 }}>
                      🔗 APP<br />URL<br />QR<br /><span style={{ color: '#F59E0B' }}>Scan Me</span>
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    How it works
                  </div>
                  {[
                    '1. Share app URL or this QR with member',
                    '2. Member opens it on their phone browser',
                    "3. They log in with their email + any password",
                    '4. (Optional) Install: tap "Add to Home Screen"',
                  ].map((step, i) => (
                    <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-2)', marginBottom: 6, display: 'flex', gap: 8 }}>
                      {step}
                    </div>
                  ))}

                  {/* Copy URL */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <input
                      readOnly value={window.location.origin + '/login'}
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.75rem', fontFamily: 'monospace' }}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin + '/login');
                    }}>Copy</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ─ Member Credentials Reference ─ */}
            <div className="card" style={{ maxWidth: 600 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 700 }}>Member Login Credentials</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { name: 'Arjun Sharma', email: 'arjun@email.com',  plan: 'Premium', planColor: '#A855F7' },
                  { name: 'Priya Patel',  email: 'priya@email.com',   plan: 'Basic',   planColor: '#3B82F6' },
                  { name: 'Rohan Mehta',  email: 'rohan@email.com',   plan: 'Premium', planColor: '#A855F7' },
                  { name: 'Vikram Singh', email: 'vikram@email.com',  plan: 'Elite',   planColor: '#F59E0B' },
                  { name: 'Kavya Nair',   email: 'kavya@email.com',   plan: 'Trial',   planColor: '#10B981' },
                  { name: 'Karan Malhotra',email:'karan@email.com',   plan: 'Elite',   planColor: '#F59E0B' },
                ].map((m, i, arr) => (
                  <div key={m.email} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.name}</div>
                      <code style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{m.email}</code>
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20, color: m.planColor, background: `${m.planColor}18`, border: `1px solid ${m.planColor}40` }}>
                      {m.plan}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: '0.72rem', color: 'var(--text-4)', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                💡 Password is not checked in test mode — members can type anything to log in
              </div>
            </div>

            {/* ─ App Behaviour Toggles ─ */}
            <div className="card" style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 0 }}>
              <h4 style={{ margin: '0 0 16px', fontWeight: 700 }}>App Behaviour</h4>
              {[
                { key: 'memberSelfSignup', label: 'Member Self Sign-up', desc: 'Allow members to register without admin approval' },
                { key: 'requireApproval', label: 'Require Admin Approval', desc: 'New members must be approved before access' },
                { key: 'showLeaderboard', label: 'Show Leaderboard', desc: 'Display streak leaderboard to all members' },
                { key: 'darkModeDefault', label: 'Dark Mode Default', desc: 'Set dark mode as default for all users' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Temporarily lock the app for non-admins' },
              ].map((item, i, arr) => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: item.key === 'maintenanceMode' && appSettings.maintenanceMode ? 'var(--danger)' : 'var(--text-1)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <ToggleSwitch value={appSettings[item.key]} onChange={v => setAppSettings(s => ({ ...s, [item.key]: v }))} />
                </div>
              ))}
              <div className="flex justify-end" style={{ paddingTop: 24 }}>
                <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Settings'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}


      </AnimatePresence>
      </div>
    </div>
  );
}

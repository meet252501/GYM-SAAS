import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Mail, Bell, Shield, Smartphone, Save,
  CheckCircle, Camera
} from 'lucide-react';
import { gymApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';

function ToggleSwitch({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 22, borderRadius: 22, border: 'none', cursor: 'pointer',
        background: value ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: '0.3s', display: 'flex', alignItems: 'center'
      }}
    >
      <motion.div
        animate={{ x: value ? 24 : 4 }}
        style={{ width: 14, height: 14, borderRadius: '50%', background: value ? 'black' : 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
      />
    </button>
  );
}

function SaveToast({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', bottom: 40, right: 40, background: 'var(--success)', color: 'black', padding: '12px 24px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, fontWeight: 900, zIndex: 100, boxShadow: '0 10px 40px rgba(16,185,129,0.3)' }}
        >
          <CheckCircle size={20} /> CHANGES SYNCHRONIZED
        </motion.div>
      )}
    </AnimatePresence>
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
  const [generalForm, setGeneralForm] = useState({ gymName: '', tagline: '', timezone: 'Asia/Kolkata', logo: '' });
  const [contactForm, setContactForm] = useState({ email: '', phone: '', address: '', website: '' });
  const [notifications, setNotifications] = useState({ newMember: true, paymentFailed: true, classBooked: false, lowCapacity: true, weeklyReport: false });
  const [securityForm, setSecurityForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: false });
  const [appForm, setAppForm] = useState({ theme: 'system', language: 'en', autoUpdate: true });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await gymApi.getSettings();
        if (data.success) {
          const gym = data.data;
          setGeneralForm({ 
            gymName: gym.name || '', 
            tagline: gym.tagline || '', 
            timezone: gym.timezone || 'Asia/Kolkata',
            logo: gym.logo || ''
          });
          setContactForm({ 
            email: gym.email || '', 
            phone: gym.phone || '', 
            address: gym.address?.street ? `${gym.address.street}, ${gym.address.city}` : '', 
            website: gym.website || '' 
          });
        }
      } catch (error) {
        console.error('Failed to fetch gym settings:', error);
      }
    }
    fetchSettings();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGeneralForm(prev => ({ ...prev, logoFile: file }));
      // For preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralForm(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', generalForm.gymName);
      formData.append('tagline', generalForm.tagline);
      formData.append('timezone', generalForm.timezone);
      formData.append('email', contactForm.email);
      formData.append('phone', contactForm.phone);
      
      if (generalForm.logoFile) {
        formData.append('logo', generalForm.logoFile);
      }
      
      const { data } = await gymApi.updateSettings(formData);
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 800 }}>
        
        {/* ── General ── */}
        {activeTab === 'general' && (
          <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {generalForm.logo ? <img src={generalForm.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Building size={32} color="var(--text-4)" />}
                </div>
                <label style={{ position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  <Camera size={14} />
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px', fontWeight: 800 }}>Gym Identity</h3>
                <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.85rem' }}>Update your brand logo and primary visual identity.</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gym Name</label>
              <input className="form-input" value={generalForm.gymName} onChange={e => setGeneralForm(f => ({ ...f, gymName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline / Mission</label>
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
          <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={18} /> Contact Details</h3>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
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
          <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
          <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Security Settings</h3>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" value={securityForm.currentPassword} onChange={e => setSecurityForm(f => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" value={securityForm.newPassword} onChange={e => setSecurityForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" value={securityForm.confirmPassword} onChange={e => setSecurityForm(f => ({ ...f, confirmPassword: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>Require a verification code when logging in</div>
              </div>
              <ToggleSwitch value={securityForm.twoFactor} onChange={v => setSecurityForm(f => ({ ...f, twoFactor: v }))} />
            </div>
            <div className="flex justify-end" style={{ paddingTop: 12 }}>
              <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={() => {
                setToast(true); setTimeout(() => setToast(false), 3000);
                setSecurityForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
              }}>
                <Shield size={15} /> Update Security
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── App ── */}
        {activeTab === 'app' && (
          <motion.div key="app" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Smartphone size={18} /> App Preferences</h3>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select className="form-select" value={appForm.theme} onChange={e => setAppForm(f => ({ ...f, theme: e.target.value }))}>
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="form-select" value={appForm.language} onChange={e => setAppForm(f => ({ ...f, language: e.target.value }))}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderTop: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Automatic Updates</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 2 }}>Automatically apply minor system updates</div>
              </div>
              <ToggleSwitch value={appForm.autoUpdate} onChange={v => setAppForm(f => ({ ...f, autoUpdate: v }))} />
            </div>
            <div className="flex justify-end" style={{ paddingTop: 12 }}>
              <motion.button whileTap={{ scale: 0.96 }} className="btn btn-primary" onClick={() => {
                setToast(true); setTimeout(() => setToast(false), 3000);
              }}>
                <Save size={15} /> Save App Settings
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
      </div>
    </div>
  );
}

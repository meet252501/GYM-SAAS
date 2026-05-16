import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Bell, Shield, Heart, ChevronRight, 
  Save, Camera, Zap, CheckCircle,
  Lock, Trash2, Mail, Ruler, Activity, Loader2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BackButton from '../../components/ui/BackButton';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function Profile() {
  const { user, logout, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState('Account');
  const fileInputRef = useRef(null);

  const [editProfile, setEditProfile] = useState(() => ({ 
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Member Alpha' : 'Member Alpha', 
    email: user?.email || '', 
    weight: user?.weight !== undefined ? String(user.weight) : '76', 
    height: user?.height !== undefined ? String(user.height) : '180' 
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const names = editProfile.name.trim().split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || ' ';
      
      const res = await authApi.updateMe({
        firstName, lastName,
        weight: parseFloat(editProfile.weight),
        height: parseFloat(editProfile.height)
      });
      
      updateUser(res.data.data.user);
      toast.success('Core Profile Synchronized');
    } catch {
      toast.error('Sync Failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be under 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        try {
          const res = await authApi.updateMe({ photo: base64Data });
          updateUser({ photo: res.data.data.user.photo });
          toast.success('Neural Signature Updated');
        } catch {
          toast.error('Upload Failed');
        } finally {
          setUploadingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingPhoto(false);
      toast.error('Read Failed');
    }
  };

  return (
    <div className="mobile-px-4" style={{ position: 'relative', minHeight: '100vh', padding: '24px 16px 120px' }}>
      <CyberMatrix intensity={0.03} />
      
      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <BackButton />
        
        {/* Profile Hero */}
        <motion.div variants={itemVariants} className="glass-card-premium mobile-p-5" style={{ padding: '40px 32px', textAlign: 'center', borderRadius: 40, marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--primary), #8b5cf6, var(--primary))', opacity: 0.5 }} />
           
           <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', padding: 4, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', boxShadow: '0 0 40px rgba(139,92,246,0.3)', position: 'relative' }}>
                 <img src={user?.photo || "https://i.pravatar.cc/150?img=11"} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '6px solid rgba(0,0,0,0.8)', opacity: uploadingPhoto ? 0.3 : 1 }} />
                 {uploadingPhoto && (
                   <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Loader2 className="animate-spin" color="var(--primary)" size={32} />
                   </div>
                 )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="glass-card-premium" 
                style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                 <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoUpload} />
           </div>

           <h2 className="mobile-text-2xl" style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 8px' }}>{editProfile.name}</h2>
           <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
              <span className="badge-epic" style={{ fontSize: '0.7rem', letterSpacing: 1.5, padding: '6px 16px' }}>{user?.membershipPlan?.toUpperCase() || 'PREMIUM'} PROTOCOL</span>
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 600 }}>Active since 2024</span>
           </div>
        </motion.div>

        {/* Biometric Bento */}
        <div className="grid-3" style={{ marginBottom: 32 }}>
           {[
             { label: 'Weight', value: editProfile.weight, unit: 'kg', icon: <Activity size={18} />, color: 'var(--primary)' },
             { label: 'Height', value: editProfile.height, unit: 'cm', icon: <Ruler size={18} />, color: '#8b5cf6' },
             { label: 'Streak', value: user?.streak || 0, unit: 'days', icon: <Zap size={18} />, color: '#f59e0b' }
           ].map((stat, i) => (
             <motion.div key={i} variants={itemVariants} className="glass-card-premium" style={{ padding: 24, textAlign: 'center', borderRadius: 24 }}>
                <div style={{ color: stat.color, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{stat.value}<span style={{ fontSize: '0.8rem', color: 'var(--text-4)', marginLeft: 2 }}>{stat.unit}</span></div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase', marginTop: 4 }}>{stat.label}</div>
             </motion.div>
           ))}
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: 20, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
           {['Account', 'Membership', 'Preferences', 'Security'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} 
               style={{ 
                 flex: 1, padding: '12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                 background: activeTab === tab ? 'rgba(255,255,255,0.08)' : 'transparent',
                 color: activeTab === tab ? 'white' : 'var(--text-3)',
                 fontWeight: 800, fontSize: '0.85rem', transition: '0.2s'
               }}>
               {tab}
             </button>
           ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
           <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              
              {activeTab === 'Account' && (
                <div className="glass-card-premium mobile-p-5" style={{ padding: 32, borderRadius: 32 }}>
                   <div className="grid-2" style={{ marginBottom: 32 }}>
                      <div className="form-group">
                         <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>IDENTITY</label>
                         <input className="form-input" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }} value={editProfile.name} onChange={e => setEditProfile(p => ({...p, name: e.target.value}))} />
                      </div>
                      <div className="form-group">
                         <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>EMAIL LINK</label>
                         <input className="form-input" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }} value={editProfile.email} readOnly />
                      </div>
                      <div className="form-group">
                         <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>BODY MASS (KG)</label>
                         <input className="form-input" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }} type="number" value={editProfile.weight} onChange={e => setEditProfile(p => ({...p, weight: e.target.value}))} />
                      </div>
                      <div className="form-group">
                         <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>VERTICAL (CM)</label>
                         <input className="form-input" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }} type="number" value={editProfile.height} onChange={e => setEditProfile(p => ({...p, height: e.target.value}))} />
                      </div>
                   </div>
                   <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ width: '100%', padding: 20, borderRadius: 20 }}>
                      {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> SYNCHRONIZE IDENTITY</>}
                   </button>
                </div>
              )}

              {activeTab === 'Membership' && (
                <div className="glass-card-premium mobile-p-5" style={{ padding: 32, borderRadius: 32 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                      <div>
                         <h4 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 4px' }}>Elite Membership</h4>
                         <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.9rem' }}>Renews on June 15, 2024</p>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>$120<span style={{ fontSize: '0.8rem', color: 'var(--text-4)' }}>/mo</span></div>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['Full Gym Access', 'AI Personal Coach', 'Premium Nutrition Planning', 'Guest Passes (2/mo)'].map(perk => (
                        <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                           <CheckCircle size={16} color="var(--success)" />
                           <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{perk}</span>
                        </div>
                      ))}
                   </div>
                   <button 
                     className="btn-primary" 
                     style={{ width: '100%', marginTop: 32, padding: 20, borderRadius: 20 }}
                   >
                     CONTACT ADMIN TO UPGRADE
                   </button>
                </div>
              )}

              {activeTab === 'Preferences' && (
                <div className="glass-card-premium mobile-p-5" style={{ padding: 32, borderRadius: 32 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {[
                        { icon: <Bell size={20} />, label: 'Push Notifications', desc: 'Alerts for upcoming classes & goals', active: true },
                        { icon: <Mail size={20} />, label: 'Email Reports', desc: 'Weekly progress and metabolic insights', active: false },
                        { icon: <Heart size={20} />, label: 'Apple Health Sync', desc: 'Synchronize biometric data automatically', active: true },
                      ].map((pref, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                              <div style={{ color: 'var(--primary)' }}>{pref.icon}</div>
                              <div>
                                 <div style={{ fontWeight: 800, fontSize: '1rem' }}>{pref.label}</div>
                                 <div style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>{pref.desc}</div>
                              </div>
                           </div>
                           <div style={{ width: 44, height: 24, borderRadius: 12, background: pref.active ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: 4, cursor: 'pointer' }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', marginLeft: pref.active ? 20 : 0, transition: '0.2s' }} />
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'Security' && (
                <div className="glass-card-premium mobile-p-5" style={{ padding: 32, borderRadius: 32 }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <button className="btn-secondary" style={{ width: '100%', padding: 20, borderRadius: 20, display: 'flex', justifyContent: 'space-between' }}>
                         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Lock size={18} /> Update Access Key</div>
                         <ChevronRight size={18} />
                      </button>
                      <button className="btn-secondary" style={{ width: '100%', padding: 20, borderRadius: 20, display: 'flex', justifyContent: 'space-between' }}>
                         <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><Shield size={18} /> 2FA Authentication</div>
                         <ChevronRight size={18} />
                      </button>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />
                      <button className="btn-secondary" style={{ width: '100%', padding: 20, borderRadius: 20, color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                         <Trash2 size={18} /> TERMINATE ACCOUNT
                      </button>
                   </div>
                </div>
              )}

           </motion.div>
        </AnimatePresence>

        {/* Sign Out */}
        <motion.button variants={itemVariants} whileTap={{ scale: 0.98 }} onClick={logout} 
          style={{ width: '100%', marginTop: 32, padding: 20, borderRadius: 24, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
           <LogOut size={20} /> SIGN OUT OF PROTOCOL
        </motion.button>

      </motion.div>
    </div>
  );
}

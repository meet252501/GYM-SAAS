import { motion } from 'framer-motion';
import { Smartphone, Download, Settings, Users, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import useAuthStore from '../../store/authStore';

export default function AppSettings() {
  const { user } = useAuthStore();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Mobile App Settings</h1>
          <p className="text-faint">Manage GymFlow Mobile App access for your members.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* QR Code Card */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--primary)', marginBottom: '-8px'
          }}>
            <Smartphone size={32} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px' }}>Member Registration Scan</h3>
            <p className="text-faint" style={{ fontSize: '0.9rem', maxWidth: '300px', margin: '0 auto' }}>
              Members scan this QR code with their phone to open the mobile registration form linked to this gym.
            </p>
          </div>

          <div style={{
            padding: '24px', background: 'white', borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.2)',
            border: '2px solid rgba(245,158,11,0.4)',
          }}>
            <QRCodeSVG 
              value={`https://gymflow.app/register?gymId=${user?.gymId || ''}&source=desk_qr`} 
              size={180} 
              bgColor="#ffffff" 
              fgColor="#09090B" 
              level="H" 
            />
          </div>

          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
            <Download size={18} /> Download Print Version (PDF)
          </button>
        </motion.div>

        {/* Configuration Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} color="var(--primary)" /> App Access Settings
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Allow App Registration</div>
                  <div className="text-faint" style={{ fontSize: '0.8rem' }}>Members can sign up via the app</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'var(--primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Coach Access</div>
                  <div className="text-faint" style={{ fontSize: '0.8rem' }}>Enable GymCoach AI for mobile users</div>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'var(--primary)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: '2px', right: '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ 
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
              border: '1px solid rgba(59,130,246,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ padding: '12px', background: 'rgba(59,130,246,0.2)', borderRadius: '12px', color: '#3b82f6' }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px' }}>Active App Users</h3>
                <p className="text-faint" style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
                  482 members are currently using the GymFlow mobile app.
                </p>
                <button className="btn btn-ghost btn-sm" style={{ color: '#3b82f6', padding: 0 }}>
                  View Usage Analytics <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}

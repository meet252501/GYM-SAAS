import { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, ScanLine, Clock, CheckCircle } from 'lucide-react';


export default function Attendance() {
  const [scanning, setScanning] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="grid-2">
        {/* QR Scanner Mock UI */}
        <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Quick Check-in</h3>
              <p className="text-faint text-sm">Scan member QR code</p>
            </div>
            <button 
              className={`btn ${scanning ? 'btn-danger' : 'btn-primary'}`} 
              onClick={() => setScanning(!scanning)}
            >
              <ScanLine size={18} />
              {scanning ? 'Stop Scanner' : 'Start Scanner'}
            </button>
          </div>

          <div style={{ 
            height: 300, 
            background: 'var(--surface-2)', 
            borderRadius: 'var(--radius-lg)', 
            border: `2px dashed ${scanning ? 'var(--primary)' : 'var(--border)'}`,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {scanning ? (
              <>
                <motion.div 
                  initial={{ top: 0 }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'var(--primary)', boxShadow: 'var(--shadow-amber)', zIndex: 10 }}
                />
                <div style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                  <QrCode size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
                  <p>Position QR code within frame</p>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <ScanLine className="empty-icon" />
                <div className="empty-title">Scanner Offline</div>
                <div className="empty-desc">Click start scanner to activate the camera.</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Live Attendance Log */}
        <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Live Log</h3>
            <span className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 2s infinite' }} />
              Live
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { name: 'Alex Johnson', time: 'Just now', status: 'success' },
              { name: 'Sarah Chen', time: '2 min ago', status: 'success' },
              { name: 'Mike Ross', time: '15 min ago', status: 'success' },
              { name: 'Emma Davis', time: '45 min ago', status: 'success' },
            ].map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center justify-between" 
                style={{ 
                  padding: '12px', 
                  background: 'var(--surface-2)', 
                  borderRadius: 'var(--radius-md)',
                  boxShadow: i === 0 ? '0 0 15px rgba(16, 185, 129, 0.15)' : 'none',
                  border: i === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent'
                }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, background: 'var(--surface-3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle className="text-success" size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{log.name}</div>
                    <div className="text-faint flex items-center gap-1" style={{ fontSize: '0.8rem' }}>
                      <Clock size={12} /> {log.time}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>Check-in OK</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

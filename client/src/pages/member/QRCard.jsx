/**
 * MemberPass — Digital Membership Card with Interactive Reception Check-in Flow
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Crown, Star, Zap, Clock,
  RefreshCw, Info, Copy, Check, Maximize2, Minimize2, Loader2, Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { attendanceApi } from '../../api';
import { toast } from 'react-hot-toast';

// ─── Plan config ──────────────────────────────────────────────
const PLAN_CONFIG = {
  Elite:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)',  Icon: Crown, gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  Premium: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)',  Icon: Star,  gradient: 'linear-gradient(135deg,#A855F7,#7C3AED)' },
  Basic:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)',  Icon: Zap,   gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)' },
  Trial:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  Icon: Zap,   gradient: 'linear-gradient(135deg,#10B981,#059669)' },
};
const getPlan = p => PLAN_CONFIG[p] || PLAN_CONFIG.Basic;

export default function MemberPass() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const plan = user?.membershipPlan || 'Basic';
  const cfg = getPlan(plan);
  const memberId = user?.memberId || user?._id || 'GF-MEMBER';

  // Member QR token states
  const [memberToken, setMemberToken] = useState('');
  const [loadingQR, setLoadingQR]     = useState(true);
  const [copied, setCopied]           = useState(false);
  const [zoomQR, setZoomQR]           = useState(false);

  // Check-in history
  const [checkIns] = useState([
    { date: 'Yesterday', time: '08:42 AM', note: 'Duration: 1h 20m' },
    { date: 'Mon, 5 May', time: '09:15 AM', note: 'Duration: 55m'  },
  ]);

  const fetchQR = async () => {
    setLoadingQR(true);
    try {
      const res = await attendanceApi.getMemberQR();
      setMemberToken(res.data.data?.token || res.data.token || '');
    } catch (err) {
      console.error('Failed to fetch member QR:', err);
    } finally {
      setLoadingQR(false);
    }
  };

  useEffect(() => {
    // Calling fetchQR() in a setTimeout to avoid cascading render warning
    const timer = setTimeout(fetchQR, 0);
    
    // Refresh token every 5 minutes
    const interval = setInterval(fetchQR, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    toast.success('Member ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryStr = user?.membershipExpiry
    ? new Date(user.membershipExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Active';

  const historyRows = [
    { date: 'Today', time: '—', note: 'Show QR at desk to check in' },
    ...checkIns
  ].slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480, margin: '0 auto', padding: '0 8px' }}>
      
      {/* ══ Header ══════════════════ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>Digital Pass</h2>
        <p className="text-faint text-sm">Present your membership pass to check in at the reception desk.</p>
      </div>

      {/* ══ Section 1: Digital Membership Card ══════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative' }}
      >
        {/* Card outer glow */}
        <div style={{
          position: 'absolute', inset: -2,
          borderRadius: 24,
          background: cfg.gradient,
          opacity: 0.15,
          filter: 'blur(18px)',
          zIndex: 0,
        }} />

        <div className="pulse-glow" style={{
          position: 'relative', zIndex: 1,
          background: `linear-gradient(140deg, var(--surface) 0%, rgba(9,9,11,0.95) 100%)`,
          border: `1.5px solid var(--border)`,
          borderRadius: 22, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {/* Card top: info + QR */}
          <div style={{ display: 'flex', gap: 16, padding: '24px 24px 20px', alignItems: 'center' }}>
            {/* Left: member info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Plan badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 12px', borderRadius: 30, width: 'fit-content',
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                color: cfg.color, fontWeight: 800, fontSize: '0.72rem',
              }}>
                <cfg.Icon size={12} />{plan} Member
              </div>

              <div>
                <div style={{ fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.2 }}>
                  {user?.firstName || 'Member'} {user?.lastName || ''}
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'monospace', fontSize: '0.75rem',
                  color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.06em',
                }}>
                  <span>{memberId}</span>
                  <button onClick={handleCopyId} style={{ background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', padding: 2, display: 'flex' }}>
                    {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Expires</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-2)' }}>{expiryStr}</div>
              </div>
            </div>

            {/* Right: Member's own QR */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div 
                onClick={() => setZoomQR(true)}
                style={{
                  padding: 10, background: 'white', borderRadius: 16,
                  boxShadow: `0 0 24px ${cfg.bg}, 0 4px 16px rgba(0,0,0,0.4)`,
                  border: `2.5px solid ${cfg.border}`,
                  width: 128, height: 128,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', cursor: 'pointer'
                }}
              >
                {loadingQR ? (
                  <Loader2 className="animate-spin" size={32} color="#000" />
                ) : (
                  <QRCodeSVG
                    value={memberToken || memberId}
                    size={108}
                    bgColor="#ffffff"
                    fgColor="#09090B"
                    level="H"
                    includeMargin={false}
                  />
                )}
                <div style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: 4, display: 'flex' }}>
                  <Maximize2 size={10} color="#fff" />
                </div>
              </div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-4)', fontWeight: 700, letterSpacing: '0.05em' }}>
                TAP TO ZOOM
              </div>
            </div>
          </div>

          {/* Card bottom stripe */}
          <div style={{
            background: cfg.gradient,
            height: 4, opacity: 0.8,
          }} />
          <div style={{
            padding: '12px 24px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.08em' }}>
              GYMFLOW PRO ACTIVE PASS
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700,
            }}>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}
              />
              LIVE PASS
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══ Member Scan Mode Button ══════════════════ */}
      <button 
        onClick={() => navigate('/member/scan')}
        style={{
          background: 'var(--primary)', color: '#fff', border: 'none',
          padding: '12px 24px', borderRadius: 30, fontWeight: 800, fontSize: '0.95rem',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
          cursor: 'pointer', margin: '-8px auto 0 auto', width: 'fit-content'
        }}
      >
        <Camera size={18} />
        Scan Desk QR
      </button>

      {/* ══ Refresh & Support Actions ══════════════════ */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button 
          onClick={fetchQR} 
          disabled={loadingQR}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 20, fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <RefreshCw size={13} className={loadingQR ? 'animate-spin' : ''} />
          Refresh Pass Code
        </button>
      </div>

      {/* ══ Check-in Guide Instructions ══════════════════ */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Info size={16} color="var(--primary)" />
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.02em' }}>How to check in</h4>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '01', text: 'Open this page on your phone screen when entering the gym.' },
            { step: '02', text: 'Present the QR code above directly to the reception desk scanner/webcam.' },
            { step: '03', text: 'Once verified, the reception panel logs your check-in instantly!' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ 
                fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 800, 
                color: 'var(--primary)', background: 'rgba(245,158,11,0.1)', 
                padding: '2px 6px', borderRadius: 6 
              }}>
                {item.step}
              </span>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.4 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══ Section 3: Recent Check-in History ══════════════════ */}
      <motion.div 
        className="card" 
        initial={{ opacity: 0, y: 12 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.14 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Clock size={16} color="var(--primary)" />
          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.9rem' }}>Recent Check-ins</h4>
        </div>
        {historyRows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0',
            borderBottom: i < historyRows.length - 1 ? '1px solid var(--border)' : 'none',
            opacity: r.date === 'Today' && r.time === '—' ? 0.55 : 1,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{r.date}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 2 }}>{r.note}</div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', fontWeight: 600 }}>{r.time}</div>
          </div>
        ))}
      </motion.div>

      {/* ══ Zoomed QR Modal ══════════════════ */}
      <AnimatePresence>
        {zoomQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomQR(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(9,9,11,0.92)',
              backdropFilter: 'blur(8px)', zIndex: 1000,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 20
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white', padding: 24, borderRadius: 28,
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onClick={e => e.stopPropagation()}
            >
              <QRCodeSVG
                value={memberToken || memberId}
                size={260}
                bgColor="#ffffff"
                fgColor="#09090B"
                level="H"
                includeMargin={false}
              />
            </motion.div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
              <Minimize2 size={16} /> Tap anywhere to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

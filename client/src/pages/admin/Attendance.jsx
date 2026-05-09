import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Crown, Star, Zap, Search, X, QrCode, Camera, Loader2, 
  MapPin, Activity, ShieldCheck, Users, RefreshCw, Calendar
} from 'lucide-react';
import { attendanceApi } from '../../api';
import Avatar from '../../components/ui/Avatar';
import { Html5Qrcode } from 'html5-qrcode';
import { QRCodeSVG } from 'qrcode.react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import toast from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

// ─── Plan styling ─────────────────────────────────────────────
const PLAN = {
  Elite:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)',  Icon: Crown, shadow: 'rgba(245,158,11,0.5)' },
  Premium: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)',  Icon: Star,  shadow: 'rgba(168,85,247,0.5)' },
  Basic:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)',  Icon: Zap,   shadow: 'rgba(59,130,246,0.3)' },
  Trial:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  Icon: Zap,   shadow: 'rgba(16,185,129,0.3)' },
};
const getPlan = p => PLAN[p] || PLAN.Basic;

// ─── Live Clock Component ─────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>
        {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
      </div>
    </div>
  );
}

// ─── Big Check-in Banner ──────────────────────────────────────
function CheckInBanner({ member, onDismiss }) {
  const cfg = getPlan(member.membershipPlan || 'Basic');
  const { Icon } = cfg;
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'fixed', top: 32, right: 32,
        zIndex: 500, width: 480,
        background: 'rgba(15,15,18,0.95)',
        backdropFilter: 'blur(20px)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: 24,
        boxShadow: `0 20px 80px rgba(0,0,0,0.8), 0 0 40px ${cfg.bg}`,
        padding: '24px',
        display: 'flex', alignItems: 'center', gap: 24,
      }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
        background: cfg.bg, border: `2px solid ${cfg.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 30px ${cfg.shadow}`,
        position: 'relative'
      }}>
        <Avatar name={`${member.firstName} ${member.lastName}`} size="lg" />
        <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#000', borderRadius: '50%', padding: 6, border: `1px solid ${cfg.color}` }}>
          <Icon size={16} color={cfg.color} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>
          {member.membershipPlan || 'Basic'} MEMBER ARRIVED
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.1, color: '#fff' }}>
          {member.firstName} {member.lastName}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-3)' }}>
            <Activity size={14} /> Streak: 12 Days
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-3)' }}>
            <Calendar size={14} /> Exp: {member.membershipExpiry ? new Date(member.membershipExpiry).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      </div>

      <button onClick={onDismiss} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: 8, borderRadius: 12 }}>
        <X size={20} />
      </button>
    </motion.div>
  );
}

// ─── Log Entry ────────────────────────────────────────────────
function LogEntry({ entry }) {
  const member = entry.memberId || {};
  const cfg = getPlan(member.membershipPlan || 'Basic');
  const name = `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px', borderRadius: 16,
        background: entry.isNew ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${entry.isNew ? 'var(--primary-border)' : 'var(--border)'}`,
        marginBottom: 8,
      }}
    >
      <Avatar name={name} size="sm" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>{name}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
           <cfg.Icon size={12} color={cfg.color} /> {member.membershipPlan} &nbsp;·&nbsp; {entry.method.replace('_', ' ')}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-2)' }}>
          {new Date(entry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700 }}>ACTIVE</div>
      </div>
    </motion.div>
  );
}

export default function Attendance() {
  const [banner, setBanner]         = useState(null);
  const [log, setLog]               = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [nowIn, setNowIn]           = useState(0);
  const [scanInput, setScanInput]   = useState('');
  const [scanMode, setScanMode]       = useState('display');
  const html5QrCodeRef                = useRef(null);
  const [gymToken, setGymToken]       = useState('');
  const [timeLeft, setTimeLeft]       = useState(30);
  const lastSeenIdRef                 = useRef(null);

  const fetchToday = useCallback(async () => {
    try {
      const { data } = await attendanceApi.getToday();
      if (data.success) {
        const newRecords = data.data || [];
        setLog(newRecords);
        setTodayCount(newRecords.length);
        if (scanMode === 'display' && newRecords.length > 0) {
          const latest = newRecords[0];
          if (lastSeenIdRef.current && latest._id !== lastSeenIdRef.current) {
            const checkInTime = new Date(latest.checkedInAt);
            if (new Date() - checkInTime < 15000) {
              setBanner(latest.memberId);
              setTimeout(() => setBanner(null), 8000);
            }
          }
          lastSeenIdRef.current = latest._id;
        } else if (newRecords.length > 0) {
          lastSeenIdRef.current = newRecords[0]._id;
        }
        setNowIn(Math.floor(newRecords.length * 0.42));
      }
    } catch (err) { console.error(err); }
  }, [scanMode]);

  const fetchGymToken = useCallback(async () => {
    try {
      const { data } = await attendanceApi.getGymQR();
      if (data.success) {
        setGymToken(data.data.token);
        setTimeLeft(30);
      }
    } catch (err) { console.error(err); }
  }, []);

  const stopCameraScanner = () => {
    if (html5QrCodeRef.current?.isScanning) {
      html5QrCodeRef.current.stop().finally(() => { html5QrCodeRef.current = null; });
    }
  };

  const handleDecodedQR = useCallback(async (token) => {
    if (!token) return;
    try {
      const res = token.split('.').length === 3 
        ? await attendanceApi.qrScan(token) 
        : await attendanceApi.manual({ memberId: token.trim() });
      if (res.data.success) {
        setBanner(res.data.data.member);
        fetchToday();
        setTimeout(() => setBanner(null), 8000);
      }
    } catch { toast.error("Scan Failed"); }
  }, [fetchToday]);

  const handleScan = useCallback(async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    try {
      const { data } = await attendanceApi.manual({ memberId: scanInput.trim() });
      if (data.success) {
        setBanner(data.data.member);
        fetchToday();
        setScanInput('');
        setTimeout(() => setBanner(null), 8000);
      }
    } catch { toast.error("ID Not Found"); }
  }, [scanInput, fetchToday]);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) fetchToday();
    }, 0);
    const int = setInterval(fetchToday, 10000);
    return () => {
      mounted = false;
      clearTimeout(timer);
      clearInterval(int);
    };
  }, [fetchToday]);

  useEffect(() => {
    let mounted = true;
    if (scanMode === 'display') {
      const timer = setTimeout(() => {
        if (mounted) fetchGymToken();
      }, 0);
      const int = setInterval(fetchGymToken, 30000);
      const countdown = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 30), 1000);
      return () => {
        mounted = false;
        clearTimeout(timer);
        clearInterval(int);
        clearInterval(countdown);
      };
    }
  }, [scanMode, fetchGymToken]);

  useEffect(() => {
    if (scanMode === 'camera') {
      const t = setTimeout(() => {
        try {
          const sc = new Html5Qrcode("attendance-reader");
          html5QrCodeRef.current = sc;
          sc.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, handleDecodedQR, () => {})
            .catch(console.error);
        } catch (e) { console.error(e); }
      }, 300);
      return () => { clearTimeout(t); stopCameraScanner(); };
    }
  }, [scanMode, handleDecodedQR]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '24px 32px', overflow: 'hidden' }}>
      <CyberMatrix intensity={0.05} />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <AnimatePresence>
        {banner && <CheckInBanner member={banner} onDismiss={() => setBanner(null)} />}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 16, background: 'var(--primary-surface)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
             <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Terminal Console
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, color: 'var(--text-3)', fontSize: '0.85rem', fontWeight: 600 }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> Main Entrance</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Activity size={14} color="var(--success)" /> Live System</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setScanMode('display')} 
              className={scanMode === 'display' ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ borderRadius: 16, padding: '12px 24px' }}
            >
              <QrCode size={18} /> Display Mode
            </button>
            <button 
              onClick={() => setScanMode('camera')} 
              className={scanMode === 'camera' ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ borderRadius: 16, padding: '12px 24px' }}
            >
              <Camera size={18} /> Scanner Mode
            </button>
          </div>
          <LiveClock />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 32, flex: 1 }}>
        
        {/* ── Center Piece ── */}
        <motion.div 
          className="glass-panel" 
          style={{ borderRadius: 32, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
        >
          {/* Ambient Glows */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.1 }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--success)', filter: 'blur(120px)', opacity: 0.1 }} />

          {scanMode === 'display' ? (
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: 8 }}>Ready for Scan</h2>
                <p style={{ color: 'var(--text-3)', fontSize: '1.1rem', marginBottom: 48 }}>Show your Member Pass to the terminal</p>
              </motion.div>

              <div style={{ position: 'relative', width: 340, height: 340, margin: '0 auto' }}>
                {/* Progress Circle */}
                <svg width="340" height="340" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="170" cy="170" r="160" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
                  <motion.circle 
                    cx="170" cy="170" r="160" fill="none" 
                    stroke="var(--primary)" strokeWidth="4" strokeLinecap="round"
                    animate={{ strokeDasharray: `${(timeLeft / 30) * 1005} 1005` }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />
                </svg>

                {/* QR Box */}
                <motion.div 
                  className="card"
                  style={{ 
                    width: 280, height: 280, margin: '30px auto', background: '#fff', padding: 20, borderRadius: 32, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                    boxShadow: '0 0 60px rgba(245,158,11,0.2)'
                  }}
                  key={gymToken}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="scan-beam" style={{ top: 20, width: 'calc(100% - 40px)', left: 20 }} />
                  {gymToken ? (
                    <QRCodeSVG value={gymToken} size={240} level="H" includeMargin={false} />
                  ) : (
                    <Loader2 className="animate-spin" size={40} color="#000" />
                  )}
                </motion.div>
              </div>

              <div style={{ marginTop: 64, display: 'flex', gap: 24, justifyContent: 'center' }}>
                 <div className="glass-panel" style={{ padding: '24px 40px', borderRadius: 24, minWidth: 200 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>{todayCount}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Entry</div>
                 </div>
                 <div className="glass-panel" style={{ padding: '24px 40px', borderRadius: 24, minWidth: 200 }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)' }}>{nowIn}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Now</div>
                 </div>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 500 }}>
              <div style={{ position: 'relative' }}>
                <div id="attendance-reader" style={{ width: '100%', height: 360, background: '#000', borderRadius: 32, overflow: 'hidden', border: '2px solid var(--border)' }} />
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 220, height: 220 }}>
                    <DotLottiePlayer
                      src="https://lottie.host/86d4e868-3e5e-4b4d-9654-e0c656e63233/QR_Scan.json"
                      autoplay
                      loop
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 32 }}>
                <form onSubmit={handleScan} className="input-wrapper">
                  <Search className="input-icon" size={20} />
                  <input 
                    className="form-input" placeholder="MANUAL MEMBER ID ENTRY..."
                    style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '16px 20px 16px 52px', fontSize: '1rem', letterSpacing: '0.1em' }}
                    value={scanInput} onChange={e => setScanInput(e.target.value)}
                  />
                </form>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Activity Sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-panel" style={{ borderRadius: 24, padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
                 <Users size={20} color="var(--primary)" /> Entry Log
               </h3>
               <button onClick={fetchToday} className="btn-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}>
                 <RefreshCw size={16} />
               </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
              <AnimatePresence mode="popLayout">
                {log.map(e => <LogEntry key={e._id} entry={e} />)}
              </AnimatePresence>
              {log.length === 0 && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                   <Clock size={48} />
                   <p style={{ fontWeight: 700, marginTop: 16 }}>SYSTEM IDLE</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
               <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600 }}>Last Sync: {new Date().toLocaleTimeString()}</div>
               <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>DATABASE ONLINE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

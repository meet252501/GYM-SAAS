import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Scan, Info, RefreshCw, Wifi } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

// Neon corner bracket SVG
function CornerBracket({ position }) {
  const transforms = {
    tl: 'rotate(0deg)',
    tr: 'rotate(90deg)',
    br: 'rotate(180deg)',
    bl: 'rotate(270deg)',
  };
  return (
    <div style={{
      position: 'absolute',
      ...(position === 'tl' && { top: 0, left: 0 }),
      ...(position === 'tr' && { top: 0, right: 0 }),
      ...(position === 'br' && { bottom: 0, right: 0 }),
      ...(position === 'bl' && { bottom: 0, left: 0 }),
      width: 28, height: 28,
      transform: transforms[position]
    }}>
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 26 L2 4 Q2 2 4 2 L26 2" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// Circular countdown ring
function CountdownRing({ progress }) {
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dash = circ * progress;
  return (
    <svg width="54" height="54" viewBox="0 0 54 54">
      <circle cx="27" cy="27" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
      <motion.circle
        cx="27" cy="27" r={radius}
        stroke="var(--primary)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={circ * 0.25}
        style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.8))' }}
      />
    </svg>
  );
}

export default function QRCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [18, -18]);
  const rotateY = useTransform(x, [-120, 120], [-18, 18]);
  const shimmerX = useTransform(x, [-120, 120], ['-80%', '180%']);

  function handlePan(_, info) { x.set(info.offset.x); y.set(info.offset.y); }
  function handlePanEnd() { x.set(0); y.set(0); }

  const REFRESH_SECS = 30;
  const [passCode, setPassCode] = useState(() => `GF-${Math.floor(100000 + Math.random() * 900000)}`);
  const [timeLeft, setTimeLeft] = useState(REFRESH_SECS);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const intervalRef = useRef(null);

  function refresh() {
    setPassCode(`GF-${Math.floor(100000 + Math.random() * 900000)}`);
    setTimeLeft(REFRESH_SECS);
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 600);
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { refresh(); return REFRESH_SECS; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const progress = timeLeft / REFRESH_SECS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, paddingTop: 12, paddingBottom: 16 }}
    >
      {/* Header: How it works banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 16,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          maxWidth: 340
        }}
      >
        <div style={{ background: 'rgba(245,158,11,0.15)', borderRadius: 10, padding: 8, flexShrink: 0 }}>
          <Scan size={20} color="var(--primary)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>
            Show this to staff at entry
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>
            Staff scan your code — you don't scan anything
          </div>
        </div>
      </motion.div>

      {/* 3D Tilt Holographic Card */}
      <motion.div
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        style={{ rotateX, rotateY, perspective: 1200, touchAction: 'none' }}
      >
        <motion.div
          style={{
            width: 310,
            background: 'linear-gradient(145deg, rgba(28,28,34,0.96) 0%, rgba(14,14,18,0.99) 100%)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: `
              0 40px 80px rgba(0,0,0,0.9),
              0 0 0 1px rgba(255,255,255,0.04) inset,
              0 0 60px rgba(245,158,11,0.05)
            `,
            overflow: 'hidden',
            position: 'relative',
            userSelect: 'none',
          }}
        >
          {/* Animated shimmer sweep layer */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0, bottom: 0,
              width: '60%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              left: shimmerX,
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />

          {/* Subtle mesh gradient background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse at 0% 0%, rgba(245,158,11,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 100% 100%, rgba(139,92,246,0.08) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }} />

          {/* Content */}
          <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, position: 'relative', zIndex: 10 }}>

            {/* Logo row */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28,
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                  borderRadius: 8, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem',
                  boxShadow: '0 0 12px rgba(245,158,11,0.4)'
                }}>G</div>
                <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px' }}>GymFlow <span style={{ color: 'var(--primary)' }}>Pro</span></span>
              </div>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 20, padding: '4px 10px' }}>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}
                />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)' }}>LIVE</span>
                <Wifi size={11} color="var(--success)" />
              </div>
            </div>

            {/* QR Code with scanner line + corner brackets */}
            <AnimatePresence mode="wait">
              <motion.div
                key={passCode}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{
                  position: 'relative',
                  background: 'white',
                  padding: 14,
                  borderRadius: 18,
                  boxShadow: justRefreshed
                    ? '0 0 40px rgba(245,158,11,0.6), 0 0 80px rgba(245,158,11,0.2)'
                    : '0 0 30px rgba(139,92,246,0.25)',
                  transition: 'box-shadow 0.4s ease'
                }}
              >
                <QRCodeSVG value={passCode} size={190} level="H" />
                {/* Animated scan line */}
                <motion.div
                  animate={{ top: ['4%', '92%', '4%'] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 10, right: 10, height: 2,
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.9), transparent)',
                    boxShadow: '0 0 12px rgba(139,92,246,0.8)',
                    borderRadius: 2
                  }}
                />
                {/* Corner brackets */}
                <CornerBracket position="tl" />
                <CornerBracket position="tr" />
                <CornerBracket position="br" />
                <CornerBracket position="bl" />
              </motion.div>
            </AnimatePresence>

            {/* User identity */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 2px', letterSpacing: '-0.5px' }}>Alex Johnson</h3>
              <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>{passCode}</p>
              <div style={{
                marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
                padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700,
                border: '1px solid rgba(16,185,129,0.25)',
                boxShadow: '0 0 16px rgba(16,185,129,0.15)'
              }}>
                <ShieldCheck size={14} /> Active Membership
              </div>
            </div>

            {/* Bottom: membership tier + countdown */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan</div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)' }}>PRO Annual</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CountdownRing progress={progress} />
                  <div style={{ position: 'absolute', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{timeLeft}s</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-3)' }}>refresh</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Instruction cards below */}
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 340 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>📱</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>You show</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Display your QR at the door</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🏋️</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>Staff scan</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Receptionist marks attendance</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✅</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 2 }}>You're in!</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>Entry logged automatically</div>
        </motion.div>
      </div>

      {/* Manual refresh */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={refresh}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '10px 24px',
          color: 'var(--text-2)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <motion.div animate={justRefreshed ? { rotate: 360 } : {}} transition={{ duration: 0.5 }}>
          <RefreshCw size={15} />
        </motion.div>
        Generate New Code
      </motion.button>

      {/* Security note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.73rem' }}>
        <Info size={13} /> Code rotates every 30s for security
      </div>
    </motion.div>
  );
}

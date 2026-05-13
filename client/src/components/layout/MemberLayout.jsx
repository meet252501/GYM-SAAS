import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Dumbbell, Bot, Camera, Fingerprint, Zap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../ui/NotificationBell';

const NAV_ITEMS = [
  { id: 'home',     path: '/member',          icon: Home,        label: 'Home',   end: true  },
  { id: 'training', path: '/member/training', icon: Dumbbell,    label: 'Train',  end: false },
  { id: 'scan',     path: '/member/fuel',     icon: Camera,      label: 'Scan',   end: false }, // CENTER orb
  { id: 'access',   path: '/member/pass',     icon: Fingerprint, label: 'Access', end: false },
  { id: 'coach',    path: '/member/coach',    icon: Bot,         label: 'AI',     end: false },
];

// ─── Particle Canvas ────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 45 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      r:     Math.random() * 1.2 + 0.2,
      dx:    (Math.random() - 0.5) * 0.22,
      dy:    (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += 0.012;
        p.alpha  = 0.05 + Math.abs(Math.sin(p.pulse)) * 0.2;
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,176,64,${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(251,176,64,${0.06 * (1 - dist / 90)})`;
            ctx.lineWidth   = 0.4;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.7 }}
    />
  );
}

// ─── Main Layout ─────────────────────────────────────────────
export default function MemberLayout({ children }) {
  const { pathname } = useLocation();
  const { user }     = useAuthStore();

  return (
    <div style={{
      position:      'relative',
      background:    'var(--bg)',
      color:         'var(--text-1)',
      height:        '100vh',
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
    }}>
      <ParticleCanvas />

      {/* Ambient background orbs */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: '55vw', height: '55vw',
        background: 'radial-gradient(circle, rgba(251,176,64,1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.055, pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-10%',
        width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(239,68,68,1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ─── Header ──────────────────────────────────────────── */}
      <header style={{
        position:       'relative',
        zIndex:         100,
        flexShrink:     0,
        height:         '64px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '0 20px',
        background:     'rgba(9,9,11,0.6)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom:   '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '38px', height: '38px',
              background: 'linear-gradient(135deg, #FBB040 0%, #EF4444 100%)',
              borderRadius: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(251,176,64,0.35)',
            }}
          >
            <Zap size={19} color="#fff" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div style={{
              fontSize: '1rem', fontWeight: 900,
              letterSpacing: '-0.5px', lineHeight: 1.1,
              background: 'linear-gradient(90deg, #FBB040, #fff)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              GymFlow
            </div>
            <div style={{
              fontSize: '9px', fontWeight: 700,
              letterSpacing: '2.5px', color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}>
              Member Portal
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Live pulse badge */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '4px 10px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '20px',
            }}
          >
            <div style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 6px #22C55E',
            }} />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#22C55E', letterSpacing: '1px' }}>LIVE</span>
          </motion.div>

          <NotificationBell />

          <Link to="/member/profile" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(251,176,64,0.2), rgba(239,68,68,0.1))',
                border: '1.5px solid rgba(251,176,64,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 900, color: '#FBB040',
                boxShadow: '0 0 16px rgba(251,176,64,0.15)',
              }}
            >
              {(user?.firstName?.[0] || user?.email?.[0] || 'M').toUpperCase()}
            </motion.div>
          </Link>
        </div>
      </header>

      {/* ─── Main Scrollable Content ─────────────────────────── */}
      <main style={{
        flex:       1,
        position:   'relative',
        zIndex:     10,
        overflowY:  'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ width: '100%', minHeight: '100%', paddingBottom: '110px' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Navigation Bar ──────────────────────────────────── */}
      {/*
        ✅ THE CORRECT FLOATING ORB PATTERN (industry standard):

        1. Outer motion.div  → fixed position, centered, NO height constraint
        2. Pill div          → position: RELATIVE (the coordinate system for the orb)
                               NO overflow: hidden
        3. Center orb NavLink → position: ABSOLUTE, top: -34px (NEGATIVE = lifts above pill)
        4. Flex row          → 4 nav items + 1 spacer div in the center for the orb gap

        The orb's `top: -34px` means: 34px ABOVE the pill's top edge.
        Since the pill is the position:relative parent, this always works perfectly.
      */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
        style={{
          position:    'fixed',
          bottom:      '22px',
          left:        0,
          right:       0,
          marginLeft:  'auto',
          marginRight: 'auto',
          width:       'min(92vw, 420px)',
          zIndex:      1000,
        }}
      >
        {/* ── The pill: position:relative is the KEY ── */}
        <div style={{
          position:             'relative',
          height:               '72px',
          background:           'rgba(8, 8, 10, 0.93)',
          backdropFilter:       'blur(50px) saturate(220%)',
          WebkitBackdropFilter: 'blur(50px) saturate(220%)',
          borderRadius:         '36px',
          border:               '1px solid rgba(255,255,255,0.1)',
          boxShadow:            '0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)',
          display:              'grid',
          gridTemplateColumns:  'repeat(5, 1fr)',
          alignItems:           'stretch',
          /* NO overflow:hidden — orb must not be clipped */
        }}>

          {/* Sweep sheen animation */}
          <motion.div
            animate={{ x: ['-140%', '240%'] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'linear', repeatDelay: 4 }}
            style={{
              position:      'absolute', top: 0, left: 0,
              width:         '32%', height: '100%',
              background:    'linear-gradient(90deg, transparent, rgba(255,255,255,0.055), transparent)',
              borderRadius:  '36px',
              pointerEvents: 'none',
            }}
          />
          {/* Top glass highlight line */}
          <div style={{
            position:      'absolute', top: 0, left: '10%', right: '10%',
            height:        '1px',
            background:    'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            pointerEvents: 'none',
          }} />

          {/* ── 4 regular items + 1 center spacer ── */}
          {NAV_ITEMS.map((item, idx) => {
            const isCenter = idx === 2;

            // Center slot: invisible spacer — orb is absolutely centered over this
            if (isCenter) {
              return <div key={item.path} />;
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={{ textDecoration: 'none', height: '100%' }}
              >
                {({ isActive }) => (
                  <motion.div
                    animate={isActive ? { y: -2 } : { y: 0 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    style={{
                      display:        'flex',
                      flexDirection:  'column',
                      alignItems:     'center',
                      justifyContent: 'center',
                      gap:            '5px',
                      position:       'relative',
                      height:         '100%',
                      padding:        '0',
                      cursor:         'pointer',
                    }}
                  >
                    {/* Active background pill (shared via layoutId) */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        style={{
                          position:     'absolute',
                          top:          '10px',
                          bottom:       '10px',
                          left:         '12px',
                          right:        '12px',
                          borderRadius: '30px',
                          background:   'rgba(251,176,64,0.13)',
                          border:       '1px solid rgba(251,176,64,0.28)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      animate={isActive
                        ? { scale: 1.18, color: '#FBB040' }
                        : { scale: 1,    color: 'rgba(255,255,255,0.35)' }
                      }
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      style={{ lineHeight: 0 }}
                    >
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.7} />
                    </motion.div>

                    {/* Label */}
                    <motion.span
                      animate={isActive
                        ? { opacity: 1,    color: '#FBB040' }
                        : { opacity: 0.38, color: 'rgba(255,255,255,0.38)' }
                      }
                      style={{
                        fontSize:      '9px',
                        fontWeight:    isActive ? 800 : 600,
                        letterSpacing: '0.7px',
                        textTransform: 'uppercase',
                        lineHeight:    1,
                      }}
                    >
                      {item.label}
                    </motion.span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}

          {/* ══ CENTER ORB — premium camera with effects ══ */}
          <NavLink
            to="/member/fuel"
            style={{
              textDecoration: 'none',
              position:       'absolute',
              top:            '-8px',
              left:           '50%',
              transform:      'translateX(-50%)',
              zIndex:         20,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            {({ isActive }) => (
              <>
                {/* ── Outer breathing ambient glow ── */}
                <motion.div
                  animate={isActive
                    ? { scale: [1, 1.32, 1], opacity: [0.2, 0.5, 0.2] }
                    : { scale: [1, 1.15, 1], opacity: [0.06, 0.14, 0.06] }
                  }
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position:      'absolute',
                    inset:         '-18px',
                    borderRadius:  '50%',
                    background:    isActive
                      ? 'radial-gradient(circle, rgba(251,176,64,0.55) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* ── Rotating dashed focus ring (camera viewfinder) ── */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position:     'absolute',
                    inset:        '-5px',
                    borderRadius: '50%',
                    border:       isActive
                      ? '1.5px dashed rgba(251,176,64,0.7)'
                      : '1.5px dashed rgba(139,92,246,0.45)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Counter-rotating inner ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position:     'absolute',
                    inset:        '-9px',
                    borderRadius: '50%',
                    border:       isActive
                      ? '1px dotted rgba(251,176,64,0.3)'
                      : '1px dotted rgba(139,92,246,0.2)',
                    pointerEvents: 'none',
                  }}
                />

                {/* ── The orb itself ── */}
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.88 }}
                  animate={isActive ? {
                    boxShadow: [
                      '0 0 0 2px rgba(251,176,64,0.55), 0 10px 30px rgba(251,176,64,0.45)',
                      '0 0 0 5px rgba(251,176,64,0.15), 0 16px 44px rgba(251,176,64,0.7)',
                      '0 0 0 2px rgba(251,176,64,0.55), 0 10px 30px rgba(251,176,64,0.45)',
                    ],
                  } : {
                    boxShadow: [
                      '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px rgba(0,0,0,0.75)',
                      '0 0 0 2px rgba(139,92,246,0.15), 0 10px 28px rgba(139,92,246,0.2)',
                      '0 0 0 1px rgba(139,92,246,0.3), 0 8px 24px rgba(0,0,0,0.75)',
                    ],
                  }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width:          '62px',
                    height:         '62px',
                    borderRadius:   '50%',
                    /* Inactive: deep indigo-purple matching dark gym theme */
                    background:     isActive
                      ? 'linear-gradient(145deg, #FDE68A 0%, #FBBF24 28%, #F97316 65%, #DC2626 100%)'
                      : 'linear-gradient(145deg, #2e1065 0%, #4c1d95 35%, #1e1b4b 70%, #0d0d12 100%)',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    color:          isActive ? '#fff' : 'rgba(196,181,253,0.9)',
                    border:         isActive
                      ? '2px solid rgba(255,255,255,0.85)'
                      : '1.5px solid rgba(139,92,246,0.4)',
                    cursor:         'pointer',
                    overflow:       'hidden',
                    position:       'relative',
                  }}
                >
                  {/* Top gloss */}
                  <div style={{
                    position:      'absolute',
                    top: '6px', left: '10px',
                    width: '35%', height: '24%',
                    background:    isActive
                      ? 'rgba(255,255,255,0.3)'
                      : 'rgba(196,181,253,0.25)',
                    borderRadius:  '50%',
                    filter:        'blur(5px)',
                    pointerEvents: 'none',
                  }} />

                  {/* Animated scan line */}
                  <motion.div
                    animate={{ y: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                    style={{
                      position:      'absolute',
                      left:          0, right: 0,
                      height:        '1.5px',
                      background:    isActive
                        ? 'linear-gradient(90deg, transparent, rgba(255,220,100,0.8), transparent)'
                        : 'linear-gradient(90deg, transparent, rgba(196,181,253,0.7), transparent)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Corner brackets (viewfinder) */}
                  {[
                    { top: '8px',  left:  '8px',  borderTop: '2px solid', borderLeft:  '2px solid', borderRight: 'none', borderBottom: 'none' },
                    { top: '8px',  right: '8px',  borderTop: '2px solid', borderRight: '2px solid', borderLeft:  'none', borderBottom: 'none' },
                    { bottom:'8px',left:  '8px',  borderBottom:'2px solid',borderLeft:  '2px solid', borderRight: 'none', borderTop:   'none' },
                    { bottom:'8px',right: '8px',  borderBottom:'2px solid',borderRight: '2px solid', borderLeft:  'none', borderTop:   'none' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      position:     'absolute',
                      width:        '9px', height: '9px',
                      borderColor:  isActive ? 'rgba(255,255,255,0.7)' : 'rgba(196,181,253,0.55)',
                      borderRadius: '1px',
                      pointerEvents:'none',
                      ...s,
                    }} />
                  ))}

                  {/* Camera icon — pulsing gently */}
                  <motion.div
                    animate={isActive
                      ? { scale: [1, 1.12, 1] }
                      : { scale: [1, 1.06, 1] }
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ marginTop: '4px', lineHeight: 0 }}
                  >
                    <Camera size={24} strokeWidth={2} />
                  </motion.div>
                </motion.div>
              </>
            )}
          </NavLink>

        </div>
      </motion.div>
    </div>
  );
}

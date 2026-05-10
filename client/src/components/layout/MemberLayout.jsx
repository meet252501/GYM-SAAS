import { NavLink, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Dumbbell, Bot, Camera, Activity, Fingerprint } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../ui/NotificationBell';

const NAV_ITEMS = [
  { id: 'home',      path: '/member',           icon: Home,        label: 'Home',     end: true },
  { id: 'training',  path: '/member/training',  icon: Dumbbell,    label: 'Training', end: false },
  { id: 'nutrition', path: '/member/fuel',      icon: Camera,      label: 'Scan',     end: false },
  { id: 'access',    path: '/member/pass',      icon: Fingerprint, label: 'Access',   end: false },
  { id: 'coach',     path: '/member/coach',     icon: Bot,         label: 'Coach AI', end: false },
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const count = 55;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.pulse += 0.015;
        p.alpha = 0.05 + Math.abs(Math.sin(p.pulse)) * 0.25;
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(245,158,11,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
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
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.8 }}
    />
  );
}

export default function MemberLayout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  return (
    <div style={{
      position: 'relative',
      background: 'var(--bg)',
      color: 'var(--text-1)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <ParticleCanvas />

      {/* Background orbs */}
      <div style={{
        position: 'fixed', top: '-15%', left: '-15%',
        width: '65vw', height: '65vw',
        background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(90px)',
        opacity: 0.07, pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Brand Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
        zIndex: 100, // Increased z-index
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #FBB040, #EF4444)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(245,158,11,0.3)',
            }}
          >
            <Activity size={22} color="white" />
          </motion.div>
          <span style={{
            fontSize: '1.2rem', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-0.5px',
          }}>
            <span className="text-gradient">GymFlow</span>{' '}
            <span style={{ color: 'white' }}>Portal</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: 'none' /* Hidden on small screens if needed */ }} className="desktop-only">
            <div style={{ fontSize: '10px', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>Neural Sync</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse-glow 2s infinite' }} />
              LIVE
            </div>
          </div>
          <NotificationBell />
          <Link to="/member/profile" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #27272A, #09090B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)',
              }}>
                {(user?.firstName?.[0] || user?.email?.[0] || 'M').toUpperCase()}
              </div>
            </motion.div>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        position: 'relative',
        zIndex: 10,
        overflowY: 'auto', // Most pages will scroll here
        WebkitOverflowScrolling: 'touch',
      }} className="main-scroll-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', minHeight: '100%', paddingBottom: '100px' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern 3D Navigation Bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        padding: '0 16px calc(12px + env(safe-area-inset-bottom, 0px))',
        zIndex: 200, pointerEvents: 'none'
      }}>
        <nav style={{
          pointerEvents: 'auto',
          margin: '0 auto',
          maxWidth: '440px',
          height: '72px',
          background: 'rgba(15, 15, 18, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '0 8px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
        }}>
          {NAV_ITEMS.map((item, idx) => {
            const isMiddle = idx === 2; // Nutrition/Scan
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={{ textDecoration: 'none', position: 'relative', flex: isMiddle ? 'none' : 1 }}
              >
                {({ isActive }) => (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {isMiddle ? (
                      /* Center FAB - 3D Modern */
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: isActive 
                            ? 'linear-gradient(135deg, #FBB040, #EF4444)' 
                            : 'linear-gradient(135deg, #27272A, #09090B)',
                          border: `2px solid ${isActive ? 'white' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: '-44px',
                          position: 'relative',
                          boxShadow: isActive 
                            ? '0 15px 40px rgba(239,68,68,0.4), inset 0 0 15px rgba(255,255,255,0.5)'
                            : '0 10px 30px rgba(0,0,0,0.8)',
                          color: isActive ? 'white' : 'var(--primary)',
                          zIndex: 50
                        }}
                      >
                        {/* Animated Inner Ring */}
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          style={{
                            position: 'absolute', inset: -4, borderRadius: '50%',
                            border: `1px dashed ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(245,158,11,0.2)'}`,
                            pointerEvents: 'none'
                          }}
                        />
                        <item.icon size={30} strokeWidth={isActive ? 2.5 : 2} />
                      </motion.div>
                    ) : (
                      <div style={{ 
                        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        color: isActive ? 'var(--primary)' : 'var(--text-4)',
                        transition: 'color 0.3s'
                      }}>
                        <motion.div
                          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                          style={{ position: 'relative', zIndex: 2 }}
                        >
                          <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </motion.div>
                        
                        <span style={{ 
                          fontSize: '10px', fontWeight: 800, marginTop: 2, 
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                          opacity: isActive ? 1 : 0.5 
                        }}>
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.div 
                            layoutId="nav-glow"
                            style={{ 
                              position: 'absolute', top: -10, width: 40, height: 40, 
                              background: 'var(--primary)', filter: 'blur(25px)', opacity: 0.3, zIndex: 1 
                            }} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

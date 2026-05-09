import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Dumbbell, QrCode, Bot, TrendingUp } from 'lucide-react';
import { useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';

const NAV_ITEMS = [
  { id: 'home',     path: '/member',           icon: Home,        label: 'Home',    exact: true  },
  { id: 'workouts', path: '/member/workouts',   icon: Dumbbell,    label: 'Train',   exact: false },
  { id: 'qr',       path: '/member/pass',       icon: QrCode,      label: 'Pass',    exact: false, special: true },
  { id: 'progress', path: '/member/progress',   icon: TrendingUp,  label: 'Growth',  exact: false },
  { id: 'ai',       path: '/member/ai',         icon: Bot,         label: 'Coach AI',exact: false },
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

    // Create particles
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

      // Draw subtle connecting lines
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
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9
      }}
    />
  );
}

export default function MemberLayout({ children }) {
  const { pathname } = useLocation();
  const { user } = useAuthStore();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-1)',
      paddingBottom: '80px',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* ── Background Layer ────────────────────────────── */}
      <ParticleCanvas />

      {/* Primary amber orb — top left */}
      <div style={{
        position: 'fixed', top: '-15%', left: '-15%',
        width: '65vw', height: '65vw',
        background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(90px)', opacity: 0.07,
        animation: 'float 14s ease-in-out infinite', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Purple orb — top right */}
      <div style={{
        position: 'fixed', top: '5%', right: '-20%',
        width: '55vw', height: '55vw',
        background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(100px)', opacity: 0.055,
        animation: 'float-reverse 18s ease-in-out infinite', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Green orb — bottom right */}
      <div style={{
        position: 'fixed', bottom: '-15%', right: '-10%',
        width: '70vw', height: '70vw',
        background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(110px)', opacity: 0.055,
        animation: 'float 20s ease-in-out infinite 3s', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Blue accent — bottom left */}
      <div style={{
        position: 'fixed', bottom: '10%', left: '-15%',
        width: '45vw', height: '45vw',
        background: 'radial-gradient(circle, var(--info) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(80px)', opacity: 0.04,
        animation: 'float-reverse 22s ease-in-out infinite 5s', zIndex: 0, pointerEvents: 'none'
      }} />

      {/* ── Header ──────────────────────────────────────── */}
      <header style={{
        padding: '16px 24px',
        position: 'sticky', top: 0,
        background: 'rgba(9,9,11,0.75)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        zIndex: 40,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: '1rem',
              boxShadow: '0 0 20px rgba(245,158,11,0.4), 0 0 40px rgba(139,92,246,0.2)'
            }}
          >G</motion.div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.5px' }}>GymFlow</span>
            <span style={{ marginLeft: 4, fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(245,158,11,0.12)', padding: '1px 6px', borderRadius: 6 }}>PRO</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live dot */}
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}
          />
          {/* Avatar → links to Profile */}
          <Link to="/member/profile" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                border: '2px solid rgba(245,158,11,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(245,158,11,0.3)',
                cursor: 'pointer',
                color: '#000', fontWeight: 900, fontSize: '0.9rem',
              }}
            >
              {(user?.firstName?.[0] || user?.email?.[0] || 'M').toUpperCase()}
            </motion.div>
          </Link>
        </div>
      </header>

      {/* ── Page Content ────────────────────────────────── */}
      <main style={{ padding: '20px 20px', maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children || <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Bottom Navigation ────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '78px',
        background: 'rgba(18,18,22,0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 8px 14px 8px',
        zIndex: 50,
      }}>
        {/* Top glow line for active tab */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)'
        }} />

        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
          const Icon = item.icon;

          if (item.special) {
            return (
              <Link key={item.id} to={item.path} style={{ position: 'relative', top: '-18px', flexShrink: 0 }}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: 62, height: 62, borderRadius: '50%',
                    background: isActive
                      ? 'linear-gradient(135deg, var(--primary), #ef4444)'
                      : 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    boxShadow: isActive
                      ? '0 0 24px rgba(245,158,11,0.7), 0 0 48px rgba(245,158,11,0.3), 0 8px 16px rgba(0,0,0,0.4)'
                      : '0 0 18px rgba(139,92,246,0.5), 0 8px 16px rgba(0,0,0,0.4)',
                    border: '3px solid var(--bg)',
                    animation: isActive ? 'pulse-glow-amber 2s infinite' : 'none'
                  }}
                >
                  <Icon size={24} />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.id} to={item.path} style={{ textDecoration: 'none', flex: 1 }}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  color: isActive ? 'var(--primary)' : 'var(--text-3)',
                  padding: '8px 4px',
                  transition: 'color 0.2s',
                  position: 'relative'
                }}
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    style={{
                      position: 'absolute', top: -8,
                      width: 20, height: 2,
                      background: 'var(--primary)',
                      borderRadius: 2,
                      boxShadow: '0 0 8px rgba(245,158,11,0.8)'
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={21}
                  style={{ filter: isActive ? 'drop-shadow(0 0 8px rgba(245,158,11,0.6))' : 'none' }}
                />
                <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 800 : 500, marginTop: 1 }}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

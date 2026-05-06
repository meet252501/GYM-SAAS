import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Flame, ChevronRight, Activity, Calendar as CalendarIcon, Play, Users, Target, Award, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } }
};

// Animated number counter
function AnimatedNumber({ target, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, v => Math.round(v) + suffix);
  useEffect(() => { motionVal.set(target); }, [motionVal, target]);
  return <motion.span>{display}</motion.span>;
}

// Live capacity colors
function capacityColor(pct) {
  if (pct < 50) return { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: 'var(--success)', label: 'Quiet · Walk in anytime' };
  if (pct < 80) return { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: 'var(--primary)', label: 'Getting Busy' };
  return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: 'var(--danger)', label: 'Packed right now' };
}

export default function MemberDashboard() {
  const [capacity, setCapacity] = useState(74);

  // Simulate real-time capacity fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setCapacity(c => Math.max(20, Math.min(98, c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4))));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const capColor = capacityColor(capacity);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
    >

      {/* ── Welcome Hero ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Good evening 🌙
            </p>
            <h2 style={{
              fontSize: '2rem', margin: 0, fontWeight: 900, lineHeight: 1.1,
              background: 'linear-gradient(135deg, #FAFAFA 30%, rgba(245,158,11,0.8) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>
              Alex Johnson
            </h2>
          </div>

          {/* Streak badge */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))',
              padding: '10px 14px',
              borderRadius: 18,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              border: '1px solid rgba(239,68,68,0.25)',
              boxShadow: '0 0 24px rgba(239,68,68,0.12)',
              flexShrink: 0
            }}
          >
            <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}>
              <Flame size={22} color="var(--danger)" style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.9))' }} />
            </motion.div>
            <span style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--danger)', lineHeight: 1 }}>12</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontWeight: 600 }}>DAY STREAK</span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Quick Stats Row ──────────────────────────────── */}
      <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { icon: Zap, color: 'var(--primary)', label: 'Workouts', value: 47, suffix: '' },
          { icon: TrendingUp, color: 'var(--success)', label: 'This Month', value: 8, suffix: '' },
          { icon: Target, color: 'var(--info)', label: 'Calories', value: 1850, suffix: '' },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, boxShadow: `0 12px 32px rgba(0,0,0,0.4)` }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 18, padding: '14px 12px', textAlign: 'center',
              transition: 'all 0.2s'
            }}
          >
            <s.icon size={18} color={s.color} style={{ margin: '0 auto 6px', filter: `drop-shadow(0 0 6px ${s.color}80)` }} />
            <div style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>
              <AnimatedNumber target={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Live Gym Capacity ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <motion.div
          animate={{ borderColor: [capColor.border, capColor.border.replace('0.3', '0.6'), capColor.border] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{
            background: capColor.bg,
            border: `1px solid ${capColor.border}`,
            borderRadius: 18, padding: '14px 18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <Users size={20} color={capColor.text} />
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 8, height: 8,
                    background: capColor.text, borderRadius: '50%'
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: capColor.text, textTransform: 'uppercase', letterSpacing: '1px' }}>LIVE Capacity</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{capColor.label}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <motion.div
                key={capacity}
                initial={{ scale: 1.3, color: capColor.text }}
                animate={{ scale: 1 }}
                style={{ fontSize: '1.8rem', fontWeight: 900, color: capColor.text, lineHeight: 1 }}
              >
                {capacity}%
              </motion.div>
            </div>
          </div>
          {/* Bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${capacity}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${capColor.text}, ${capColor.text}cc)`, borderRadius: 4, boxShadow: `0 0 8px ${capColor.text}` }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Up Next ──────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
          <CalendarIcon size={16} style={{ color: 'var(--primary)' }} /> Up Next
        </h3>
        <Link to="/member/classes" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(245,158,11,0.08)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(140deg, rgba(245,158,11,0.12) 0%, rgba(139,92,246,0.08) 60%, rgba(14,14,18,0.9) 100%)',
              borderRadius: 22, padding: '20px',
              border: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative', overflow: 'hidden'
            }}
          >
            {/* Corner shimmer */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 160, height: 160,
              background: 'var(--primary)', borderRadius: '50%',
              filter: 'blur(70px)', opacity: 0.12
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
              <div>
                <span style={{
                  display: 'inline-block', marginBottom: 10,
                  background: 'rgba(245,158,11,0.15)', color: 'var(--primary)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>Today • 6:30 PM</span>
                <h4 style={{ fontSize: '1.5rem', margin: '0 0 4px', fontWeight: 900 }}>HIIT Extreme</h4>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', margin: 0 }}>with Mike Tyson • Studio A</p>
              </div>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <ChevronRight size={22} color="white" />
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Daily Macros ─────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
          <Target size={16} style={{ color: 'var(--info)' }} /> Daily Macros
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: 20, display: 'flex', gap: 18, alignItems: 'center' }}>
          {/* Calorie ring */}
          <div style={{ position: 'relative', width: 86, height: 86, flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
              <motion.circle
                cx="18" cy="18" r="15.9155"
                fill="none"
                stroke="url(#calGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0,100' }}
                animate={{ strokeDasharray: '75,100' }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--info)" />
                  <stop offset="100%" stopColor="var(--primary)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900 }}>1850</span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-3)', fontWeight: 700 }}>KCAL</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { name: 'Protein', color: 'var(--success)', cur: 120, max: 180 },
              { name: 'Carbs', color: 'var(--primary)', cur: 150, max: 220 },
              { name: 'Fats', color: 'var(--danger)', cur: 45, max: 65 },
            ].map((m, i) => (
              <div key={m.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: 4 }}>
                  <span style={{ color: m.color, fontWeight: 700 }}>{m.name}</span>
                  <span style={{ color: 'var(--text-3)' }}>{m.cur}/{m.max}g</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((m.cur / m.max) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                    style={{ height: '100%', background: m.color, borderRadius: 4, boxShadow: `0 0 6px ${m.color}` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Active Program ───────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
          <Activity size={16} style={{ color: 'var(--success)' }} /> Active Program
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h4 style={{ fontSize: '1.2rem', margin: '0 0 2px', fontWeight: 800 }}>Hypertrophy Phase 2</h4>
              <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', margin: 0 }}>Week 3 of 8</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '1.6rem', fontWeight: 900,
                background: 'var(--gradient-green)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>65%</div>
              <div style={{ color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 600 }}>DONE</div>
            </div>
          </div>

          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', marginBottom: 18 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '65%' }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.4 }}
              style={{
                height: '100%', borderRadius: 6,
                background: 'linear-gradient(90deg, var(--success), var(--info))',
                boxShadow: '0 0 12px rgba(16,185,129,0.6)'
              }}
            />
          </div>

          <Link to="/member/workouts" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(255,255,255,0.08)' }}
              whileTap={{ scale: 0.96 }}
              style={{
                width: '100%', padding: '14px', borderRadius: 14,
                background: 'var(--text-1)', color: 'var(--bg)',
                border: 'none', fontWeight: 800, fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'pointer', letterSpacing: '-0.3px'
              }}
            >
              <Play size={18} fill="currentColor" /> Start Today's Workout
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* ── Trophy Room ──────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h3 style={{ fontSize: '1rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
          <Award size={16} style={{ color: 'var(--primary)' }} /> Trophy Room
        </h3>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6 }}>
          {[
            { title: 'Early Bird', desc: '5am Workout', icon: '🌅', color: 'var(--primary)', glow: 'rgba(245,158,11,0.3)' },
            { title: '100kg Club', desc: 'Bench Press', icon: '💪', color: 'var(--success)', glow: 'rgba(16,185,129,0.3)' },
            { title: 'Marathon', desc: '10k Run', icon: '🏃', color: 'var(--info)', glow: 'rgba(59,130,246,0.3)' },
            { title: 'On Fire', desc: '12 Day Streak', icon: '🔥', color: 'var(--danger)', glow: 'rgba(239,68,68,0.3)' },
            { title: 'Iron Will', desc: '50 Workouts', icon: '🏆', color: '#A855F7', glow: 'rgba(168,85,247,0.3)' },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
              whileHover={{ y: -6, boxShadow: `0 16px 40px ${t.glow}` }}
              style={{
                minWidth: 110, flexShrink: 0,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${t.color}40`,
                borderRadius: 20, padding: '18px 14px', textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: i * 0.6 }}
                style={{ fontSize: '2.2rem', marginBottom: 8 }}
              >{t.icon}</motion.div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: t.color }}>{t.title}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-3)', marginTop: 2 }}>{t.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}

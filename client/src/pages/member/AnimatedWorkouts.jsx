import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { ChevronLeft, Zap, Target, Flame, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CYBER_EXERCISES = [
  {
    id: 1,
    name: 'Neural Squat',
    lottie: 'https://lottie.host/8e2f8961-8f7a-4b9e-8a5b-6f8d8f8d8f8d/xxxxxxxx.json', // Placeholder, using a real looking one if possible
    desc: 'High-intensity metabolic conditioning',
    stats: { power: 85, focus: 90, burn: 120 }
  },
  {
    id: 2,
    name: 'Cyber Pushup',
    lottie: 'https://lottie.host/xxx/yyy.json',
    desc: 'Pushing the boundaries of upper body strength',
    stats: { power: 70, focus: 95, burn: 80 }
  }
];

export default function AnimatedWorkouts() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const current = CYBER_EXERCISES[index];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div style={{ padding: 24, position: 'relative', zIndex: 10, maxWidth: 500, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 32 }}>
          <ChevronLeft size={20} /> Back
        </button>

        <header style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginBottom: 8 }}>
            <Zap size={16} fill="currentColor" />
            <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase' }}>Cyber Protocol</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>Neural <span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>Flow</span></h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ position: 'relative' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 32, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DotLottiePlayer
                  src="https://lottie.host/83679808-01e4-4d89-9486-d2547a836894/l8j88P65G3.lottie" // Biomechanical Runner/Workout
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.power}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontWeight: 700 }}>PWR</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.focus}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontWeight: 700 }}>FOC</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.burn}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-3)', fontWeight: 700 }}>KCAL</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>{current.name}</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', lineHeight: 1.5 }}>{current.desc}</p>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setIsTraining(!isTraining)}
                style={{ flex: 1, height: 64, borderRadius: 20, background: isTraining ? 'rgba(16,185,129,0.1)' : 'var(--primary)', color: isTraining ? 'var(--success)' : 'white', border: isTraining ? '1px solid var(--success)' : 'none', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: isTraining ? 'none' : '0 10px 30px rgba(245,158,11,0.3)' }}>
                {isTraining ? <><CheckCircle size={24} /> Syncing...</> : <><Play fill="currentColor" size={24} /> Initiate</>}
              </motion.button>
              
              <button onClick={() => setIndex((index + 1) % CYBER_EXERCISES.length)}
                style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* HUD Elements */}
        <div style={{ marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
             <Target size={14} color="var(--primary)" />
             <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase' }}>Target Area</div>
             <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Muscle Core</div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
             <Flame size={14} color="#ef4444" />
             <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase' }}>Metabolic</div>
             <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Peak State</div>
           </div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
             <Zap size={14} color="#8b5cf6" />
             <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase' }}>Neural Load</div>
             <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>High Sync</div>
           </div>
        </div>
      </div>
    </div>
  );
}

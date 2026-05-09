import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { ChevronLeft, Zap, Target, Flame, ChevronRight, Play, CheckCircle, Timer, Plus, Minus, Trophy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { workoutsApi } from '../../api';
import { toast } from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

const CYBER_EXERCISES = [
  {
    id: 'neural_squat',
    name: 'Neural Squat',
    lottie: 'https://lottie.host/83679808-01e4-4d89-9486-d2547a836894/l8j88P65G3.lottie',
    desc: 'Metabolic enhancement protocol focusing on lower-body kinetic chains.',
    color: 'var(--neon-orange)',
    stats: { power: 85, focus: 90, burn: 120 }
  },
  {
    id: 'cyber_pushup',
    name: 'Cyber Pushup',
    lottie: 'https://lottie.host/64703a4b-9e48-4395-9467-f417f7b2e666/p8Z78X65Gz.json',
    desc: 'Calibrating pectoral output and triceps extension under high-load simulation.',
    color: 'var(--neon-blue)',
    stats: { power: 70, focus: 95, burn: 80 }
  },
  {
    id: 'plasma_lunge',
    name: 'Plasma Lunge',
    lottie: 'https://lottie.host/6ef44b93-8395-468a-b844-3d6f8f8d8f8d/v8Y88A65Gz.json',
    desc: 'Synchronizing unilateral stability with explosive neural drive.',
    color: 'var(--neon-green)',
    stats: { power: 75, focus: 85, burn: 95 }
  }
];

export default function AnimatedWorkouts() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [reps, setReps] = useState(12);
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const current = CYBER_EXERCISES[index];

  useEffect(() => {
    let timer;
    if (isTraining) {
      timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isTraining]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await workoutsApi.createLog({
        label: `Cyber Protocol: ${current.name}`,
        exercises: [{
          exerciseName: current.name,
          sets: [{ reps, weight: 0 }]
        }],
        duration: elapsed,
        caloriesBurned: Math.round(elapsed * (current.stats.burn / 600)) // Estimate based on burn stat
      });
      toast.success('Session Uploaded to Neural Network');
      setIsTraining(false);
      setElapsed(0);
    } catch (error) {
      toast.error('Sync Failed: Check Neural Link');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <CyberMatrix opacity={0.4} />

      <div style={{ padding: 24, position: 'relative', zIndex: 10, maxWidth: 500, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 32, fontSize: '0.9rem', fontWeight: 600 }}>
          <ChevronLeft size={20} /> Back
        </button>

        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginBottom: 8 }}>
              <Zap size={16} fill="currentColor" />
              <span style={{ fontWeight: 800, fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase' }}>Cyber Protocol</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, lineHeight: 1 }}>Neural <span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>Flow</span></h1>
          </div>
          {isTraining && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.2rem', fontFamily: 'monospace' }}>
              {formatTime(elapsed)}
            </motion.div>
          )}
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ position: 'relative' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 32, border: `1px solid ${current.color}22`, backdropFilter: 'blur(10px)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DotLottiePlayer
                  src={current.lottie}
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%', filter: `drop-shadow(0 0 15px ${current.color}44)` }}
                />
              </div>

              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: current.color, fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.power}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>PWR</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: '#8b5cf6', fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.focus}%</div>
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>FOC</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{current.stats.burn}</div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>KCAL</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>{current.name}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.5 }}>{current.desc}</p>
            </div>

            {isTraining ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Rep Counter UI */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px 24px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>REPS COMPLETED</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <button onClick={() => setReps(Math.max(0, reps - 1))} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Minus size={20} />
                    </button>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: current.color, minWidth: 40, textAlign: 'center' }}>{reps}</span>
                    <button onClick={() => setReps(reps + 1)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleFinish}
                  disabled={saving}
                  style={{ height: 64, borderRadius: 20, background: 'var(--success)', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 10px 30px rgba(16,185,129,0.4)' }}>
                  {saving ? <Loader2 className="animate-spin" size={24} /> : <><Trophy size={24} /> Finish Protocol</>}
                </motion.button>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', gap: 16 }}>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => setIsTraining(true)}
                  style={{ flex: 1, height: 64, borderRadius: 20, background: current.color, color: 'white', border: 'none', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: `0 10px 30px ${current.color}44` }}>
                  <Play fill="currentColor" size={24} /> Initiate Sync
                </motion.button>
                
                <button onClick={() => setIndex((index + 1) % CYBER_EXERCISES.length)}
                  style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* HUD Elements */}
        {!isTraining && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ marginTop: 48, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               <Target size={14} color={current.color} />
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Target Area</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Muscle Core</div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               <Flame size={14} color="#ef4444" />
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Metabolic</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Peak State</div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
               <Zap size={14} color="#8b5cf6" />
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase' }}>Neural Load</div>
               <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>High Sync</div>
             </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

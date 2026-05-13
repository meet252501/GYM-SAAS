import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Play, Zap, 
  Search, Filter, 
  Calendar, Loader2, Sparkles, TrendingUp,
  Flame, TrendingDown, X
} from 'lucide-react';
import { workoutsApi, progressApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BackButton from '../../components/ui/BackButton';
import { toast } from 'react-hot-toast';

// ── Shared Sub-components ────────────────────────────────────────

// Re-using TrainingBot icon for AI Metabolic Insight — defined here so it's hoisted
const TrainingBot = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

const TypewriterText = ({ text, className }) => {
  return (
    <div className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1, delay: i * 0.05 }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

function BioDataBar({ values, color = 'var(--primary)', maxH = 80 }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: maxH, padding: '0 4px' }}>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            flex: 1, minWidth: 6, borderRadius: '4px 4px 2px 2px',
            background: i === values.length - 1 
              ? `linear-gradient(to top, ${color}, #8b5cf6)` 
              : `rgba(255,255,255,0.05)`,
            boxShadow: i === values.length - 1 ? `0 0 15px ${color}55` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function BioMetricTile({ icon, label, value, sub, color, change, delay = 0 }) {
  const up = change > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      className="glass-card-premium"
      style={{ padding: '24px', borderRadius: 28, display: 'flex', flexDirection: 'column', gap: 16, border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        {change != null && (
          <div style={{ padding: '4px 10px', borderRadius: 20, background: up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: up ? 'var(--success)' : 'var(--danger)', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
             {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ── Main Training Hub ───────────────────────────────────────────

// ── Mock Initial Data (if API is empty) ──────────────────────
import localExercises from '../../data/exerciseLibrary';

const FALLBACK_EXERCISES = localExercises.slice(0, 12);

import { useLocation } from 'react-router-dom';

export default function TrainingHub() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'PLAN';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  
  // State for different modules
  const [activeProgram, setActiveProgram] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progressData, setProgressData] = useState({ overview: null, weight: [], records: [] });
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(30);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [repCadence, setRepCadence] = useState(0); // 0 to 100 for animation
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSessionContent, setActiveSessionContent] = useState(null);

  // Consolidated Performance Tracking Logic
  useEffect(() => {
    if (!isSessionActive) return;

    let interval;
    if (!isResting) {
      interval = setInterval(() => {
        setExerciseTime(prev => prev + 1);
        setRepCadence(prev => {
          if (prev >= 100) {
            setCurrentRep(r => r + 1);
            return 0;
          }
          return prev + 5; // Simulates a 2s cycle for high energy
        });
      }, 100);
    } else {
      interval = setInterval(() => {
        setRestTimer(t => {
          if (t <= 1) {
            setIsResting(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isSessionActive, isResting]);



  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [progRes, exRes, overviewRes, weightRes, recordsRes] = await Promise.all([
          workoutsApi.getPrograms(),
          workoutsApi.getExercises(),
          progressApi.getOverview(),
          progressApi.getWeight(),
          progressApi.getRecords()
        ]);
        
        setActiveProgram(progRes.data?.data?.[0]);
        setExercises(exRes.data?.data?.length > 0 ? exRes.data.data : FALLBACK_EXERCISES);
        setProgressData(prev => ({ 
          overview: overviewRes.data?.data || prev.overview, 
          weight: weightRes.data?.data || prev.weight, 
          records: recordsRes.data?.data || prev.records 
        }));
      } catch (err) {
        console.error('Hub data fetch error:', err);
        // Fallback demo data for progression
        setProgressData({
          overview: { streak: 12, totalWorkouts: 48, monthlySessions: 14, goal: 20, workoutsPerWeek: [3, 4, 5, 2, 4, 6, 4, 3] },
          weight: [{ weight: 82, date: new Date() }, { weight: 81.5, date: new Date() }, { weight: 80.8, date: new Date() }],
          records: [{ exercise: 'Deadlift', weight: '180kg', reps: '3 reps', date: 'May 10', icon: '🏋️' }]
        });
        setExercises([
          { _id: '1', name: 'Barbell Bench Press', muscle: 'chest', equipment: 'barbell', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4Mnd6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6rO6uI8w/giphy.gif' },
          { _id: '2', name: 'Dumbbell Squat', muscle: 'legs', equipment: 'dumbbell', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4Mnd6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6rO6uI8w/giphy.gif' },
          { _id: '3', name: 'Pull Ups', muscle: 'back', equipment: 'bodyweight', gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4Mnd6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6Z3Z6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6rO6uI8w/giphy.gif' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);




  const displayPlan = activeProgram || {
    name: 'Tactical Evolution Alpha',
    description: 'A neural-optimized strength protocol for total domination.',
    goal: 'Hypertrophy',
    durationWeeks: 4,
    daysPerWeek: 4,
    sessions: [
      { name: 'Upper Body Sync', exercises: FALLBACK_EXERCISES.slice(0, 3) },
      { name: 'Lower Body Matrix', exercises: FALLBACK_EXERCISES.slice(3) }
    ]
  };


  const tabs = [
    { id: 'PLAN', icon: Dumbbell, label: 'Workouts' },
    { id: 'TECHNIQUE', icon: Zap, label: 'Technique' },
    { id: 'EVOLUTION', icon: TrendingUp, label: 'Evolution' }
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Loader2 size={40} className="animate-spin" color="var(--primary)" />
    </div>
  );

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 152px)', color: 'var(--text-1)' }}>
      <CyberMatrix intensity={0.04} />
      
      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1, padding: '12px 16px 24px', paddingBottom: 24 }}>
        <BackButton />
        
        <header style={{ marginBottom: 32 }}>
           <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
             Training <span style={{ color: 'var(--primary)' }}>Hub</span>
           </h1>
           <p style={{ color: 'var(--text-3)', fontSize: '1rem', margin: '4px 0 0' }}>Unified control center for your physical evolution</p>
        </header>

        {/* --- Unified Tab Navigation --- */}
        <div style={{ 
          display: 'flex', gap: 6, marginBottom: 32, background: 'rgba(255,255,255,0.02)', 
          padding: 6, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)',
          overflowX: 'auto'
        }} className="no-scrollbar">
           {tabs.map(tab => (
             <button 
               key={tab.id} 
               onClick={() => setActiveTab(tab.id)} 
               style={{ 
                 flex: 1, padding: '14px 20px', borderRadius: 18, border: 'none', cursor: 'pointer',
                 background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                 color: activeTab === tab.id ? 'black' : 'var(--text-3)',
                 fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px', transition: '0.2s',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                 whiteSpace: 'nowrap'
               }}>
               <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>

        {/* --- Content Area --- */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
          >
            
            {/* 1. PLAN TAB: Active Workout Session */}
            {activeTab === 'PLAN' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {displayPlan ? (
                  <div className="glass-card-premium" style={{ padding: 28, borderRadius: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 900 }}>{displayPlan.name}</h3>
                        <div style={{ display: 'flex', gap: 12, color: 'var(--text-3)', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {displayPlan.sessions?.length} days/week</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={14} /> {displayPlan.goal}</span>
                        </div>
                      </div>
                      <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.1)', color: 'var(--primary)', fontWeight: 800, fontSize: '0.75rem' }}>
                        ACTIVE PROTOCOL
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {displayPlan.sessions?.map((session, i) => (
                        <div key={i} className="glass-card-premium" style={{ padding: '16px 20px', borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                             <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--primary)' }}>{i+1}</div>
                             <div>
                               <div style={{ fontWeight: 800 }}>{session.name}</div>
                               <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{session.exercises?.length} Exercises • 45 min</div>
                             </div>
                          </div>
                          <motion.button 
                            onClick={() => { 
                              setActiveSessionContent(session); 
                              setCurrentExIndex(0);
                              setExerciseTime(0);
                              setCurrentRep(0);
                              setRepCadence(0);
                              setIsSessionActive(true); 
                            }}
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            style={{ padding: '10px 18px', borderRadius: 12, background: 'white', color: 'black', border: 'none', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                             START SESSION
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="glass-card-premium" style={{ padding: 40, borderRadius: 32, textAlign: 'center' }}>
                    <Dumbbell size={48} color="var(--text-4)" style={{ marginBottom: 16, opacity: 0.3 }} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>No Active Protocol</h3>
                    <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Initialize your training from the matrix.</p>
                  </div>
                )}

                {isResting && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card-premium" style={{ padding: 24, borderRadius: 32, border: '2px solid var(--primary)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 2 }}>Neural Recovery In Progress</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'monospace' }}>00:{restTimer < 10 ? `0${restTimer}` : restTimer}</div>
                    <button onClick={() => setIsResting(false)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--text-4)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>SKIP REST</button>
                  </motion.div>
                )}
              </div>
            )}

            {/* 2. TECHNIQUE TAB: Animated Exercise Library */}
            {activeTab === 'TECHNIQUE' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div className="glass-card-premium" style={{ padding: 16, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={20} color="var(--text-4)" />
                    <input type="text" placeholder="Search exercise database..." style={{ background: 'none', border: 'none', color: 'white', width: '100%', outline: 'none', fontWeight: 600 }} />
                    <Filter size={20} color="var(--primary)" />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {exercises.length > 0 ? exercises.map((ex) => (
                      <motion.div 
                        key={ex._id} 
                        whileHover={{ y: -4 }} 
                        onClick={() => setSelectedExercise(ex)}
                        className="glass-card-premium" 
                        style={{ padding: 16, borderRadius: 24, cursor: 'pointer' }}
                      >
                        <div style={{ position: 'relative', height: 100, background: 'rgba(255,255,255,0.02)', borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}>
                           <img src={ex.gifUrl} alt={ex.name} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} />
                           <div style={{ position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.5)', fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)' }}>{ex.muscle?.toUpperCase()}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 2 }}>{ex.equipment}</div>
                      </motion.div>
                    )) : (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <motion.div 
                          key={idx} 
                          className="glass-card-premium" 
                          style={{ height: 160, borderRadius: 24, background: 'rgba(255,255,255,0.02)' }}
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ))
                   )}
                 </div>
              </div>
            )}

            {/* 4. EVOLUTION TAB: Growth Vault / Analytics */}
            {activeTab === 'EVOLUTION' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Top Metrics Bento */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <BioMetricTile icon={<Flame size={20} />} label="Active Streak" value={`${progressData.overview?.streak || 0} Days`} sub="Neural Link Maintained" color="#f59e0b" change={12} />
                  <BioMetricTile icon={<Dumbbell size={20} />} label="Total Syncs" value={progressData.overview?.totalWorkouts || 0} sub="Cumulative Intensity" color="var(--primary)" change={5} />
                </div>

                {/* Activity Visualization */}
                <div className="glass-card-premium" style={{ padding: 32, borderRadius: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>Weekly Intensity</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>Training frequency baseline</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)' }}>{progressData.overview?.workoutsPerWeek?.slice(-1)[0] || 0}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-4)' }}>SESSIONS / WK</div>
                    </div>
                  </div>
                  <BioDataBar values={progressData.overview?.workoutsPerWeek || [0,0,0,0,0,0,0,0]} />
                </div>

                {/* Milestones / PRs */}
                <div>
                   <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                     <Sparkles size={18} color="var(--primary)" /> Top Milestones
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {progressData.records?.length > 0 ? progressData.records.slice(0, 3).map((r, i) => (
                        <div key={i} className="glass-card-premium" style={{ padding: 16, borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                           <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                              {r.icon || '🏆'}
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.exercise}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>PR Synchronized: {r.date}</div>
                           </div>
                           <div style={{ fontWeight: 900, color: 'var(--primary)' }}>{r.weight}</div>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', padding: 20, opacity: 0.5, fontSize: '0.85rem' }}>No milestones recorded yet.</div>
                      )}
                   </div>
                </div>

                {/* AI Metabolic Insight */}
                <div className="glass-card-premium" style={{ padding: 28, borderRadius: 32, background: 'linear-gradient(135deg, rgba(139,92,246,0.1), transparent)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
                    <TrainingBot size={24} color="#a78bfa" />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>AI Metabolic Insight</h4>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#a78bfa' }}>PREDICTIVE MODELING</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: 1.6 }}>
                    Your training volume has increased by <span style={{ color: '#a78bfa', fontWeight: 800 }}>8.4%</span> this month. Predictive modeling suggests a plateau in 14 days unless intensity is modulated.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 20px 100px 20px' }}
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-card-premium"
              style={{ width: '100%', maxWidth: 500, borderRadius: 32, overflow: 'hidden', position: 'relative' }}
            >
              <button 
                onClick={() => setSelectedExercise(null)}
                style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: 8, borderRadius: 12, cursor: 'pointer', zIndex: 10 }}
              >
                <X size={20} />
              </button>

              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Play size={20} />
                   </div>
                   <div>
                      <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900 }}>{selectedExercise.name}</h2>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800 }}>Mastering the {selectedExercise.muscle} Matrix</div>
                   </div>
                </div>

                <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(0,0,0,0.3)', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24 }}>
                   <img src={selectedExercise.gifUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Form visualization" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                   <div className="glass-card-premium" style={{ padding: 16, borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase' }}>Target</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedExercise.muscle}</div>
                   </div>
                   <div className="glass-card-premium" style={{ padding: 16, borderRadius: 16, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase' }}>Equipment</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{selectedExercise.equipment}</div>
                   </div>
                </div>

                <button className="btn-primary" style={{ width: '100%', padding: 18, borderRadius: 20 }} onClick={() => setSelectedExercise(null)}>
                   MARK TECHNIQUE MASTERED
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Session Modal - Immersive Performance Stage */}
      <AnimatePresence>
        {isSessionActive && activeSessionContent && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 9999, 
              background: '#09090b', display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Immersive Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
               <CyberMatrix intensity={0.15} />
               <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(245,158,11,0.05) 0%, transparent 70%)' }} />
            </div>
            
            {/* Top Bar: Telemetry & Close */}
            <div style={{ position: 'relative', zIndex: 20, padding: '24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                 <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Dumbbell size={22} color="var(--primary)" />
                 </div>
                 <div>
                    <TypewriterText text={activeSessionContent.name} className="text-white font-black text-lg tracking-wider uppercase" />
                    <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                       <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                       NEURAL PROTOCOL SYNCHRONIZED
                    </div>
                 </div>
              </div>
              <button onClick={() => setIsSessionActive(false)} className="glass-card-premium" style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color="white" />
              </button>
            </div>

            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', zIndex: 10, overflow: 'hidden', padding: '20px 0' }}>
               {(() => {
                 const ex = activeSessionContent.exercises?.[currentExIndex];
                 const getExObj = (item) => {
                   if (!item) return { name: 'Protocol Error', gifUrl: '' };
                   if (typeof item === 'string') return exercises.find(e => e._id === item) || { name: 'Unit Identifier Error', gifUrl: '' };
                   if (item && typeof item === 'object') {
                      const base = item.exercise ? (typeof item.exercise === 'string' ? exercises.find(e => e._id === item.exercise) : item.exercise) : item;
                      return { 
                        name: base?.name || item.name || 'Unknown Unit', 
                        gifUrl: base?.gifUrl || item.gifUrl || '',
                        muscle: base?.muscle || item.muscle || 'CORE',
                        equipment: base?.equipment || item.equipment || 'N/A'
                      };
                   }
                   return { name: 'Data Corruption', gifUrl: '' };
                 };
                 const exerciseObj = getExObj(ex);
                 
                 return (
                   <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20, padding: '0 20px' }}>
                      {/* The "Big Screen" Hologram */}
                      <div style={{ flex: 1.5, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <AnimatePresence mode="wait">
                           <motion.div 
                             key={currentExIndex}
                             initial={{ opacity: 0, scale: 0.9 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 1.1 }}
                             style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                           >
                              <div className="glass-card-premium" style={{ 
                                width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', 
                                border: '1px solid rgba(245,158,11,0.3)', 
                                position: 'relative', background: 'rgba(0,0,0,0.8)', 
                                boxShadow: '0 0 60px rgba(245,158,11,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                 {/* Grid Overlay */}
                                 <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                                 
                                 {/* Animated Scan Line */}
                                 <motion.div 
                                   animate={{ top: ['-10%', '110%'] }} 
                                   transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                   style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--primary)', zIndex: 2, boxShadow: '0 0 20px var(--primary)' }} 
                                 />

                                 <motion.img 
                                   src={exerciseObj.gifUrl} 
                                   alt={exerciseObj.name} 
                                   animate={{ 
                                     scale: [1, 1.02, 1],
                                     filter: [
                                       'brightness(1.2) drop-shadow(0 0 20px rgba(245,158,11,0.3))',
                                       'brightness(1.5) drop-shadow(0 0 30px rgba(245,158,11,0.6))'
                                     ]
                                   }}
                                   transition={{ duration: 2.5, repeat: Infinity }}
                                   style={{ width: '85%', height: '85%', objectFit: 'contain', mixBlendMode: 'screen' }} 
                                 />

                                 {/* Internal Telemetry */}
                                 <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column', pointerEvents: 'none', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                       <div style={{ background: 'rgba(0,0,0,0.8)', padding: '8px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                          <div style={{ fontSize: '0.55rem', color: 'var(--text-4)', fontWeight: 800 }}>MUSCLE</div>
                                          <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white' }}>{exerciseObj.muscle?.toUpperCase()}</div>
                                       </div>
                                       <div style={{ display: 'flex', gap: 4 }}>
                                          {activeSessionContent.exercises?.map((_, i) => (
                                            <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < currentExIndex ? 'var(--success)' : i === currentExIndex ? 'var(--primary)' : 'rgba(255,255,255,0.1)' }} />
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                         </AnimatePresence>
                      </div>

                      {/* Performance Telemetry HUD */}
                      <div style={{ display: 'flex', gap: 12 }}>
                         <div className="glass-card-premium" style={{ flex: 1, padding: '20px', borderRadius: '32px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: 1 }}>UNIT_PROTOCOL</div>
                               <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{exerciseObj.name.toUpperCase()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                               <div style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 900 }}>LAP_TIME</div>
                               <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', fontFamily: 'monospace' }}>{formatTime(Math.floor(exerciseTime/10))}</div>
                            </div>
                         </div>
                         
                         <div className="glass-card-premium" style={{ padding: '12px 24px', borderRadius: '32px', border: currentRep >= (ex?.reps || 12) ? '1px solid var(--success)' : '1px solid var(--primary)', background: currentRep >= (ex?.reps || 12) ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 120 }}>
                            <div style={{ fontSize: '0.6rem', color: currentRep >= (ex?.reps || 12) ? 'var(--success)' : 'var(--primary)', fontWeight: 900 }}>{currentRep >= (ex?.reps || 12) ? 'TARGET_MET' : 'REPS'}</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{currentRep}</div>
                         </div>
                      </div>

                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                         <motion.div animate={{ width: `${repCadence}%` }} style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
                      </div>

                      {/* Recovery/Action Area */}
                      <div className="glass-card-premium" style={{ padding: 24, borderRadius: 32, border: '1px solid rgba(245,158,11,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                         {isResting ? (
                           <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: 2, marginBottom: 4 }}>RECOVERY_ACTIVE</div>
                              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>00:{restTimer < 10 ? `0${restTimer}` : restTimer}</div>
                              <button onClick={() => setIsResting(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 12, fontWeight: 900, marginTop: 12, cursor: 'pointer' }}>SKIP</button>
                           </div>
                         ) : (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800 }}>
                                 <span style={{ color: 'var(--text-4)' }}>OBJECTIVE</span>
                                 <span style={{ color: 'var(--primary)' }}>{ex?.reps || '12'} REPS @ 60KG</span>
                              </div>
                              <motion.button whileTap={{ scale: 0.98 }} onClick={() => { setCurrentRep(r => r + 1); setRepCadence(0); }} className="btn-primary" style={{ width: '100%', padding: '20px', borderRadius: 20, fontWeight: 900, fontSize: '1.2rem' }}>
                                 LOG REP
                              </motion.button>
                           </div>
                         )}
                      </div>
                   </div>
                 );
               })()}
            </div>

            {/* Stage Navigation */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))', background: 'linear-gradient(to top, #09090b 80%, transparent)', display: 'flex', gap: 12, zIndex: 100 }}>
              <button 
                disabled={currentExIndex === 0}
                onClick={() => {
                  setCurrentExIndex(prev => prev - 1);
                  setExerciseTime(0);
                  setCurrentRep(0);
                  setRepCadence(0);
                }}
                className="glass-card-premium"
                style={{ flex: 1, padding: '22px', borderRadius: 24, fontWeight: 900, opacity: currentExIndex === 0 ? 0.2 : 1, color: 'white', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
              >
                PREVIOUS
              </button>
              <button 
                onClick={() => {
                  if (currentExIndex < activeSessionContent.exercises.length - 1) {
                    setCurrentExIndex(prev => prev + 1);
                    setExerciseTime(0);
                    setCurrentRep(0);
                    setRepCadence(0);
                    setIsResting(true);
                    setRestTimer(45);
                  } else {
                    setExerciseTime(0);
                    setCurrentRep(0);
                    setRepCadence(0);
                    setIsSessionActive(false);
                    toast.success('Protocol Synchronized with Evolution Vault!');
                  }
                }}
                className="btn-primary"
                style={{ flex: 2, padding: '22px', borderRadius: 24, fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
              >
                {currentExIndex < activeSessionContent.exercises.length - 1 ? 'NEXT PROTOCOL' : 'FINALIZE SESSION'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}


import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Timer, ChevronDown, ChevronUp, Trophy, X, Dumbbell, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import BadgeCelebrationModal from '../../components/ui/BadgeCelebrationModal';
import { BADGE_DEFS } from '../../data/badges';
import { workoutsApi } from '../../api';
import { toast } from 'react-hot-toast';

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Rest Timer ─────────────────────────────────────────────────
function RestTimer({ seconds, onSkip }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRemaining(seconds);
    }, 0);
    return () => clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSkip]);

  const pct = (remaining / seconds) * 100;
  const color = remaining <= 10 ? '#ef4444' : remaining <= 30 ? '#f59e0b' : '#10b981';
  const r = 82;
  const circ = 2 * Math.PI * r;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
      <p style={{ color: 'var(--text-3)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 3, margin: 0 }}>Rest Time</p>
      <div style={{ position: 'relative', width: 180, height: 180 }}>
        <svg width="180" height="180" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
          <motion.circle cx="90" cy="90" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
            transition={{ duration: 1, ease: 'linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div key={remaining} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ fontSize: '3.5rem', fontWeight: 900, color, lineHeight: 1 }}>{remaining}</motion.div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>seconds</div>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.95 }} onClick={onSkip}
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '12px 32px', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
        Skip Rest →
      </motion.button>
    </motion.div>
  );
}

// ── PR Flash ───────────────────────────────────────────────────
function PRFlash({ exercise }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.5, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -20 }}
      style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 300, background: 'linear-gradient(135deg,#f59e0b,#8b5cf6)', borderRadius: 20, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(245,158,11,0.5)', whiteSpace: 'nowrap' }}>
      <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ repeat: 3, duration: 0.4 }} style={{ fontSize: '1.4rem' }}>🏆</motion.span>
      <div>
        <div style={{ fontWeight: 900, color: 'white', fontSize: '0.9rem' }}>Personal Record!</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>{exercise} — New PR!</div>
      </div>
    </motion.div>
  );
}

// ── Completion Modal ───────────────────────────────────────────
function CompletionModal({ duration, completedSets, exercises, streak, saving, onClose }) {
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const done = Object.values(completedSets).filter(Boolean).length;
  const pct = Math.round((done / totalSets) * 100);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        className="modal" style={{ maxWidth: 360, textAlign: 'center' }}>
        <motion.div animate={{ y: [0, -8, 0], rotate: [-5, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '4rem', marginBottom: 12 }}>🏆</motion.div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 4 }}>Workout Complete!</h3>
        <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: '0.9rem' }}>{exercises.length} exercises done</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[{ label: 'Duration', value: formatTime(duration), icon: '⏱️' }, { label: 'Sets Done', value: `${done}/${totalSets}`, icon: '💪' }, { label: 'Complete', value: `${pct}%`, icon: '🎯' }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
              style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '12px 8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
        {pct >= 80 && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.1),rgba(139,92,246,0.1))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '10px 14px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700, marginBottom: 20 }}>
            🔥 {streak > 0 ? `${streak}-day streak!` : 'Great session!'} Keep it up!
          </motion.div>
        )}
        <motion.button whileTap={{ scale: 0.96 }} onClick={onClose} disabled={saving} className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <><Trophy size={18} /> Save &amp; Exit</>}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Workouts() {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [completedSets, setCompletedSets] = useState({});
  const [setData, setSetData] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [restTimer, setRestTimer] = useState(null);
  const [prFlash, setPrFlash] = useState(null);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [exRes, progRes] = await Promise.all([
        workoutsApi.getExercises(),
        workoutsApi.getPrograms()
      ]);
      setExercises(exRes.data.data || []);
      setPrograms(progRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch workout data:", err);
      toast.error("Failed to load workout data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) fetchData();
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [fetchData]);

  useEffect(() => {
    if (activeWorkout) { 
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); 
    } else { 
      clearInterval(timerRef.current); 
    }
    return () => clearInterval(timerRef.current);
  }, [activeWorkout]);

  const currentExercises = selectedWorkout
    ? (programs.find(p => p.name === selectedWorkout)?.exercises || []).map(pe => ({
        ...exercises.find(e => e._id === pe.exercise),
        sets: pe.sets,
        reps: pe.reps,
        weight: pe.weight
      })).filter(e => e._id)
    : exercises.slice(0, 4).map(e => ({ ...e, sets: 3, reps: '12', weight: 0 }));

  const toggleSet = (ex, setIndex) => {
    const key = `${ex._id}-${setIndex}`;
    if (!completedSets[key]) {
      const w = parseFloat(setData[`${ex._id}-${setIndex}-w`] ?? ex.weight) || 0;
      if (ex.prevBest && w > ex.prevBest) { 
        setPrFlash(ex.name); 
        setTimeout(() => setPrFlash(null), 3000); 
      }
      setRestTimer({ duration: 60, id: Date.now() });
    }
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSet = (exId, idx, field, val) =>
    setSetData(prev => ({ ...prev, [`${exId}-${idx}-${field}`]: val }));

  const handleSkipRest = useCallback(() => setRestTimer(null), []);

  const handleEnd = () => { 
    clearInterval(timerRef.current); 
    setShowCompletion(true); 
  };

  const handleSaveAndClose = async () => {
    setSavingLog(true);
    try {
      const logs = currentExercises.map(ex => {
        const sets = [];
        for (let i = 0; i < ex.sets; i++) {
          if (completedSets[`${ex._id}-${i}`]) {
            sets.push({
              reps: parseInt(setData[`${ex._id}-${i}-r`] || ex.reps),
              weight: parseFloat(setData[`${ex._id}-${i}-w`] || ex.weight)
            });
          }
        }
        return { exercise: ex._id, sets };
      }).filter(l => l.sets.length > 0);

      if (logs.length > 0) {
        await workoutsApi.createLog({
          exercises: logs,
          duration: elapsed,
          date: new Date()
        });
        toast.success("Workout saved!");
      }

      setShowCompletion(false);
      
      // Check for perfect session badge
      const totalSets = currentExercises.reduce((a, e) => a + e.sets, 0);
      const doneSets = Object.values(completedSets).filter(Boolean).length;
      if (doneSets === totalSets && totalSets > 0) {
        setEarnedBadge(BADGE_DEFS.streak_7); 
      } else {
        resetSession();
      }
    } catch {
      toast.error("Failed to save workout log");
    } finally {
      setSavingLog(false);
    }
  };

  const resetSession = () => {
    setActiveWorkout(false);
    setElapsed(0); setCompletedSets({}); setSetData({}); setExpandedExercise(null);
  };

  const closeBadgeModal = () => {
    setEarnedBadge(null);
    resetSession();
  };

  const exerciseProgress = (ex) => {
    const done = Array.from({ length: ex.sets }, (_, i) => completedSets[`${ex._id}-${i}`]).filter(Boolean).length;
    return { done, total: ex.sets, pct: Math.round((done / ex.sets) * 100) };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  // ── Pre-Session Screen ─────────────────────────────────────
  if (!activeWorkout) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>Train <span style={{ color: 'var(--primary)' }}>💪</span></h2>
            <p className="text-faint" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>Ready for a session, {user?.firstName || 'Champ'}?</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/member/exercises" style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              padding: '8px 12px', borderRadius: 12, textDecoration: 'none',
              color: 'var(--success)', fontSize: '0.82rem', fontWeight: 700,
              boxShadow: '0 0 15px rgba(16,185,129,0.1)'
            }}>
              <BookOpen size={16} /> Library
            </Link>
            <Link to="/member/animated" style={{ 
              display: 'flex', alignItems: 'center', gap: 6, 
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              padding: '8px 12px', borderRadius: 12, textDecoration: 'none',
              color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 700,
              boxShadow: '0 0 15px rgba(245,158,11,0.1)'
            }}>
              <Sparkles size={16} /> Cyber
            </Link>
          </div>
        </div>

        {programs.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {programs.map(p => (
              <motion.button key={p._id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedWorkout(p.name)}
                style={{ padding: '16px 14px', borderRadius: 16, cursor: 'pointer', textAlign: 'left', border: 'none',
                  background: selectedWorkout === p.name ? 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(139,92,246,0.2))' : 'var(--surface-2)',
                  outline: selectedWorkout === p.name ? '1px solid rgba(245,158,11,0.5)' : '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>🏋️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-1)' }}>{p.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 2 }}>{p.exercises.length} exercises</div>
              </motion.button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentExercises.map((ex, i) => (
            <motion.div key={ex._id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'var(--surface-2)', padding: '14px 16px', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Dumbbell size={17} color="var(--primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ex.name}</div>
                <div className="text-faint text-sm">{ex.sets} × {ex.reps} · {ex.weight > 0 ? `${ex.weight}kg` : 'Bodyweight'}</div>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', background: 'rgba(59,130,246,0.1)', color: 'var(--info)', borderRadius: 20 }}>{ex.muscleGroup}</span>
            </motion.div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.01 }}
          onClick={() => { setExpandedExercise(currentExercises[0]?._id); setActiveWorkout(true); }}
          style={{ background: 'linear-gradient(135deg,var(--primary),#8b5cf6)', color: 'white', border: 'none', padding: 18, borderRadius: 18, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: '0 10px 30px rgba(139,92,246,0.4)' }}>
          <Play fill="currentColor" size={20} /> Start Session
        </motion.button>
      </div>
    );
  }

  // ── Active Session ────────────────────────────────────────
  const sessionTotalSets = currentExercises.reduce((a, e) => a + e.sets, 0);
  const sessionDoneSets = Object.values(completedSets).filter(Boolean).length;
  const sessionPct = Math.round((sessionDoneSets / sessionTotalSets) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>{selectedWorkout || 'Workout'}</h2>
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}
            style={{ fontWeight: 900, fontSize: '1.4rem', color: 'var(--primary)', textShadow: '0 0 14px rgba(245,158,11,0.5)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Timer size={18} /> {formatTime(elapsed)}
          </motion.div>
        </div>
        <motion.button whileTap={{ scale: 0.94 }} onClick={handleEnd} className="btn btn-danger">
          <X size={16} /> End
        </motion.button>
      </div>

      <div style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '12px 16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>Progress</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{sessionDoneSets}/{sessionTotalSets} sets</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${sessionPct}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,var(--primary),#8b5cf6)', boxShadow: '0 0 10px rgba(245,158,11,0.4)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {currentExercises.map(ex => {
          const isExpanded = expandedExercise === ex._id;
          const { done, total, pct } = exerciseProgress(ex);
          const allDone = done === total;
          return (
            <motion.div key={ex._id} layout
              style={{ background: 'var(--surface-2)', borderRadius: 18, overflow: 'hidden',
                border: allDone ? '1px solid rgba(16,185,129,0.4)' : isExpanded ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: allDone ? '0 0 20px rgba(16,185,129,0.08)' : 'none' }}>
              <div onClick={() => setExpandedExercise(isExpanded ? null : ex._id)}
                style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: allDone ? 'var(--success)' : isExpanded ? 'var(--primary)' : 'var(--text-1)' }}>{ex.name}</span>
                    {allDone && <CheckCircle size={14} color="var(--success)" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span className="text-faint text-sm">{ex.sets} sets × {ex.reps}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: allDone ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.08)', color: allDone ? 'var(--success)' : 'var(--primary)' }}>{done}/{total}</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 8, width: 110, overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${pct}%` }} style={{ height: '100%', background: allDone ? 'var(--success)' : 'var(--primary)', borderRadius: 2 }} />
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    style={{ padding: '0 18px 18px' }}>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 10, fontSize: '0.67rem', color: 'var(--text-4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 26 }}>
                        <span style={{ flex: 1, textAlign: 'center' }}>Weight (kg)</span>
                        <span style={{ flex: 1, textAlign: 'center' }}>Reps</span>
                        <span style={{ width: 44, textAlign: 'center' }}>✓</span>
                      </div>
                      {Array.from({ length: ex.sets }).map((_, idx) => {
                        const isDone = completedSets[`${ex._id}-${idx}`];
                        return (
                          <motion.div key={idx} animate={{ opacity: isDone ? 0.65 : 1 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 22, color: 'var(--text-3)', fontWeight: 700, fontSize: '0.82rem', textAlign: 'center' }}>{idx + 1}</div>
                            <input type="number" defaultValue={setData[`${ex._id}-${idx}-w`] || ex.weight || ''}
                              onChange={e => updateSet(ex._id, idx, 'w', e.target.value)}
                              placeholder={ex.weight > 0 ? String(ex.weight) : 'BW'}
                              style={{ flex: 1, padding: '8px', background: isDone ? 'rgba(16,185,129,0.07)' : 'var(--bg)', border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 10, color: 'var(--text-1)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }} />
                            <input type="number" defaultValue={setData[`${ex._id}-${idx}-r`] || ex.reps.split('-')[0]}
                              onChange={e => updateSet(ex._id, idx, 'r', e.target.value)}
                              style={{ flex: 1, padding: '8px', background: isDone ? 'rgba(16,185,129,0.07)' : 'var(--bg)', border: `1px solid ${isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, borderRadius: 10, color: 'var(--text-1)', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }} />
                            <motion.button whileTap={{ scale: 0.78 }} onClick={() => toggleSet(ex, idx)}
                              style={{ width: 44, height: 44, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isDone ? 'rgba(16,185,129,0.2)' : 'var(--surface-3)', border: isDone ? '1px solid rgba(16,185,129,0.5)' : '1px solid var(--border)', color: isDone ? 'var(--success)' : 'var(--text-3)', boxShadow: isDone ? '0 0 12px rgba(16,185,129,0.3)' : 'none' }}>
                              <CheckCircle size={20} />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {restTimer && (
          <RestTimer key={`rest-${restTimer.id}`} seconds={restTimer.duration} onSkip={handleSkipRest} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {prFlash && <PRFlash key="pr" exercise={prFlash} />}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletion && (
          <CompletionModal 
            duration={elapsed} 
            completedSets={completedSets} 
            exercises={currentExercises} 
            streak={user?.streak || 0} 
            saving={savingLog}
            onClose={handleSaveAndClose} 
          />
        )}
      </AnimatePresence>

      <BadgeCelebrationModal 
        isOpen={!!earnedBadge} 
        badge={earnedBadge ? { ...earnedBadge, name: earnedBadge.label, description: earnedBadge.desc } : null} 
        onClose={closeBadgeModal} 
      />
    </div>
  );
}

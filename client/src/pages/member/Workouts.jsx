import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle, Timer, ChevronDown, ChevronUp } from 'lucide-react';

const MOCK_WORKOUT = [
  { id: 1, name: 'Barbell Bench Press', sets: 4, reps: '8-10', weight: '80kg' },
  { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: '30kg' },
  { id: 3, name: 'Cable Crossovers', sets: 3, reps: '15', weight: '20kg' },
  { id: 4, name: 'Overhead Tricep Extension', sets: 3, reps: '12-15', weight: '25kg' },
];

export default function Workouts() {
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [completedSets, setCompletedSets] = useState({});

  const toggleSet = (exId, setIndex) => {
    setCompletedSets(prev => ({
      ...prev,
      [`${exId}-${setIndex}`]: !prev[`${exId}-${setIndex}`]
    }));
  };

  if (!activeWorkout) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Chest & Triceps</h2>
          <p className="text-faint">Hypertrophy Phase 2 • Week 3</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {MOCK_WORKOUT.map((ex, i) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ex.name}</div>
              <div className="text-faint text-sm mt-1">{ex.sets} Sets × {ex.reps} Reps • Goal: {ex.weight}</div>
            </motion.div>
          ))}
        </div>

        {/* Swipe to start simulation button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveWorkout(true)}
          style={{
            marginTop: 'auto',
            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '1.2rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
            cursor: 'pointer'
          }}
        >
          <Play fill="currentColor" /> Start Workout
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>In Progress</h2>
          <div className="flex items-center gap-2 text-primary" style={{ fontWeight: 800, fontSize: '1.2rem', textShadow: '0 0 10px rgba(245,158,11,0.5)' }}>
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
              <Timer size={18} /> 
            </motion.div>
            00:14:32
          </div>
        </div>
        <button 
          onClick={() => setActiveWorkout(false)}
          className="btn btn-danger btn-sm"
        >
          End
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {MOCK_WORKOUT.map((ex) => {
          const isExpanded = expandedExercise === ex.id;
          return (
            <motion.div 
              key={ex.id}
              layout
              style={{ 
                background: 'var(--surface-2)', 
                borderRadius: '16px', 
                border: isExpanded ? '1px solid var(--primary)' : '1px solid var(--border)',
                overflow: 'hidden'
              }}
            >
              <div 
                onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: isExpanded ? 'var(--primary)' : 'var(--text-1)' }}>{ex.name}</div>
                  <div className="text-faint text-sm mt-1">{ex.sets} Sets × {ex.reps}</div>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ padding: '0 16px 16px 16px' }}
                  >
                    {Array.from({ length: ex.sets }).map((_, idx) => {
                      const isDone = completedSets[`${ex.id}-${idx}`];
                      return (
                        <div key={idx} className="flex items-center gap-3" style={{ marginBottom: 12 }}>
                          <div style={{ width: 24, color: 'var(--text-3)', fontWeight: 600 }}>{idx + 1}</div>
                          <input type="text" defaultValue={ex.weight} style={{ flex: 1, padding: '8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-1)', textAlign: 'center' }} />
                          <input type="text" defaultValue={ex.reps.split('-')[0]} style={{ flex: 1, padding: '8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-1)', textAlign: 'center' }} />
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            animate={{
                              backgroundColor: isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--surface-3)',
                              color: isDone ? 'var(--success)' : 'var(--text-3)',
                              scale: isDone ? [1, 1.2, 1] : 1
                            }}
                            transition={{ duration: 0.3 }}
                            onClick={() => toggleSet(ex.id, idx)}
                            style={{ 
                              border: isDone ? '1px solid rgba(16, 185, 129, 0.5)' : 'none', 
                              borderRadius: '8px', 
                              width: 44, height: 44, 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: isDone ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
                            }}
                          >
                            <CheckCircle size={22} />
                          </motion.button>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
}

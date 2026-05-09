import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Dumbbell, X, ChevronLeft, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

// ── Animation Components (Synced with AnimatedWorkouts) ──────────

function LottieAnimator({ src, color }) {
  return (
    <div style={{ 
      width: '100%', height: '100%', minHeight: 220,
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, rgba(0,0,0,0.6) 100%)', 
      borderRadius: 0, position: 'relative', overflow: 'hidden' 
    }}>
      <DotLottiePlayer src={src} autoplay loop style={{ width: '90%', height: '90%' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: `inset 0 0 40px ${color}15` }} />
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 3px)', pointerEvents: 'none' }} />
    </div>
  );
}

function HumanGymAnimator({ ex }) {
  const color = ex.color || '#8b5cf6';
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    let frame;
    const animate = (time) => {
      setCycle((time % 2000) / 2000); // 2 second cycle
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const contraction = Math.sin(cycle * Math.PI);
  const reverseContraction = 1 - contraction;
  const glowStyle = { filter: `drop-shadow(0 0 10px ${color})` };

  const renderHumanCharacter = () => {
    switch (ex.id) {
      case 'b-1': // Bench Press
      case 'b-2': { // Incline Press
        const barY = 55 - 28 * contraction;
        return (
          <g transform="translate(0, 10)">
            <line x1="30" y1="80" x2="170" y2="80" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
            <rect x="60" y="68" width="80" height="12" rx="6" fill="rgba(255,255,255,0.8)" />
            <circle cx="50" cy="74" r="9" fill="#FFF" />
            <line x1="90" y1="74" x2="75" y2={74 + 12 * reverseContraction} stroke="rgba(255,255,255,0.85)" strokeWidth="8" strokeLinecap="round" />
            <line x1="110" y1="74" x2="125" y2={74 + 12 * reverseContraction} stroke="rgba(255,255,255,0.85)" strokeWidth="8" strokeLinecap="round" />
            <line x1="75" y1={74 + 12 * reverseContraction} x2="78" y2={barY} stroke="rgba(255,255,255,0.95)" strokeWidth="6" strokeLinecap="round" />
            <line x1="125" y1={74 + 12 * reverseContraction} x2="122" y2={barY} stroke="rgba(255,255,255,0.95)" strokeWidth="6" strokeLinecap="round" />
            <line x1="40" y1={barY} x2="160" y2={barY} stroke="#FFF" strokeWidth="4" />
            <rect x="30" y={barY - 14} width="10" height="28" rx="4" fill={color} style={glowStyle} />
            <rect x="160" y={barY - 14} width="10" height="28" rx="4" fill={color} style={glowStyle} />
          </g>
        );
      }
      case 'b-4': // Squat
      case 'b-12': { // Leg Press
        const hipY = 65 + 25 * contraction;
        const kneeX = 86 - 12 * contraction;
        const kneeY = 85 + 6 * contraction;
        return (
          <g transform="translate(0, 5)">
            <line x1="30" y1="110" x2="170" y2="110" stroke="var(--border)" strokeWidth="4" />
            <line x1="100" y1="110" x2={kneeX} y2={kneeY} stroke="rgba(255,255,255,0.8)" strokeWidth="7" />
            <line x1="100" y1={hipY} x2={kneeX} y2={kneeY} stroke="rgba(255,255,255,0.85)" strokeWidth="9" />
            <g transform={`translate(0, ${25 * contraction}) rotate(${15 * contraction}, 100, 65)`}>
              <rect x="91" y="28" width="18" height="38" rx="9" fill="rgba(255,255,255,0.9)" />
              <circle cx="100" cy="15" r="9" fill={color} style={glowStyle} />
              <line x1="45" y1="24" x2="155" y2="24" stroke="#FFF" strokeWidth="5" />
            </g>
          </g>
        );
      }
      default: { // Bicep Curls (Fallback)
        const curlAngle = contraction * Math.PI * 0.75;
        const handLeftX = 84 - 18 * Math.sin(curlAngle);
        const handLeftY = 62 + 18 * Math.cos(curlAngle);
        return (
          <g transform="translate(0, 5)">
            <rect x="91" y="38" width="18" height="42" rx="9" fill="rgba(255,255,255,0.85)" />
            <circle cx="100" cy="25" r="9" fill={color} style={glowStyle} />
            <line x1="91" y1="44" x2="84" y2="62" stroke="rgba(255,255,255,0.8)" strokeWidth="7" />
            <line x1="84" y1="62" x2={handLeftX} y2={handLeftY} stroke="rgba(255,255,255,0.92)" strokeWidth="5.5" />
            <circle cx={handLeftX} cy={handLeftY} r="6" fill={color} style={glowStyle} />
          </g>
        );
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 220, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.8)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '16px 16px', opacity: 0.2 }} />
      <svg width="100%" height="160" viewBox="0 0 200 120" style={{ overflow: 'visible', zIndex: 1 }}>
        {renderHumanCharacter()}
      </svg>
    </div>
  );
}

// ── Static fallback library (shown while API loads / as baseline) ──
const STATIC_LIBRARY = [
  { id: 'b-1', name: 'Barbell Bench Press',      muscle: 'Chest',      equipment: 'Barbell',    difficulty: 'Intermediate', color: '#FF3366', animationUrl: 'https://lottie.host/8040d19a-3242-4f3d-9f44-9f4f9f4f9f4f/8vNq3f0R1s.json', instructions: ['Lie on flat bench, grip bar slightly wider than shoulder-width.','Unrack and lower bar to mid-chest with control.','Press explosively back to start. Keep shoulder blades retracted.'] },
  { id: 'b-2', name: 'Incline Dumbbell Press',   muscle: 'Chest',      equipment: 'Dumbbell',   difficulty: 'Beginner',     color: '#FF9900', animationUrl: 'https://lottie.host/46481744-8025-4b3d-986c-497793d56784/eL6v1XpW5r.json', instructions: ['Set bench to 30-45°. Hold dumbbells at chest level.','Press up until arms are extended, squeeze chest at top.','Lower slowly over 2-3 seconds.'] },
  { id: 'b-3', name: 'Cable Crossovers',          muscle: 'Chest',      equipment: 'Cable',      difficulty: 'Beginner',     color: '#26A69A', animationUrl: 'https://lottie.host/a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d/latpull.json', instructions: ['Stand between cables set high. Grab handles.','Bring hands together in front of you in a hugging motion.','Squeeze chest for 1 second at contraction.'] },
  { id: 'b-4', name: 'Barbell Squat',             muscle: 'Legs',       equipment: 'Barbell',    difficulty: 'Advanced',     color: '#33CCFF', animationUrl: 'https://lottie.host/6474668b-59d4-4b5c-897d-697960105342/Wv9N8U0v1r.json', instructions: ['Bar on upper traps, feet shoulder-width.','Descend until thighs are parallel to floor.','Drive through heels to stand, keep core braced.'] },
  { id: 'b-5', name: 'Romanian Deadlift',         muscle: 'Hamstrings', equipment: 'Barbell',    difficulty: 'Intermediate', color: '#E040FB', animationUrl: 'https://lottie.host/e2b69512-8800-478a-a92c-567890abcdef/deadlift.json', instructions: ['Hold bar at hip level, slight knee bend.','Hinge at hips, lowering bar along legs until stretch in hamstrings.','Drive hips forward to return to standing.'] },
  { id: 'b-6', name: 'Pull-ups',                  muscle: 'Back',       equipment: 'Bodyweight', difficulty: 'Intermediate', color: '#26A69A', animationUrl: 'https://lottie.host/38f7e2d2-446a-4934-8c8c-1234567890ab/pullup.json', instructions: ['Hang from bar with overhand grip, arms fully extended.','Pull chest toward bar, drive elbows down.','Lower under control — avoid swinging.'] },
  { id: 'b-10', name: 'Bicep Curls',              muscle: 'Biceps',     equipment: 'Dumbbell',   difficulty: 'Beginner',     color: '#EC407A', animationUrl: 'https://lottie.host/f1e2d3c4-b5a6-9c8d-7e6f-5a4b3c2d1e0f/curls.json', instructions: ['Stand with dumbbells, palms forward.','Curl to shoulder height keeping elbows pinned.','Fully extend at bottom for full ROM.'] },
  { id: 'b-11', name: 'Tricep Pushdown',          muscle: 'Triceps',    equipment: 'Cable',      difficulty: 'Beginner',     color: '#AB47BC', animationUrl: null, instructions: ['Stand at cable, bar at chest height.','Push down until elbows fully extended.','Squeeze triceps, return slowly.'] },
  { id: 'b-12', name: 'Leg Press',                muscle: 'Legs',       equipment: 'Machine',    difficulty: 'Beginner',     color: '#33CCFF', animationUrl: null, instructions: ['Sit in machine, feet hip-width on platform.','Lower weight until 90° knee angle.','Press through heels to starting position.'] },
  { id: 'b-13', name: 'Lat Pulldown',             muscle: 'Back',       equipment: 'Machine',    difficulty: 'Beginner',     color: '#AB47BC', animationUrl: 'https://lottie.host/a1b2c3d4-e5f6-4a5b-6c7d-8e9f0a1b2c3d/latpull.json', instructions: ['Sit, thighs under pad. Grip bar wide.','Pull bar to upper chest, lean back slightly.','Squeeze lats at bottom, extend arms fully on way up.'] },
];

const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Hamstrings'];
const DIFFICULTIES  = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const DIFF_COLOR = { Beginner: '#10B981', Intermediate: '#F59E0B', Advanced: '#EF4444' };
const MUSCLE_EMOJI = { Chest: '💪', Back: '🔙', Legs: '🦵', Shoulders: '🏋️', Biceps: '💪', Triceps: '🦾', Hamstrings: '🦵', All: '🏃' };

function ExerciseModal({ ex, onClose }) {
  const diffColor = DIFF_COLOR[ex.difficulty] || '#aaa';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div className="modal-content" onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        style={{ maxWidth: 460, padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Demo area */}
        <div style={{ height: 220, background: '#000', position: 'relative', overflow: 'hidden' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}>
            <X size={16} />
          </button>

          {ex.animationUrl ? (
            <LottieAnimator src={ex.animationUrl} color={ex.color} />
          ) : (
            <HumanGymAnimator ex={ex} />
          )}

          {/* Difficulty badge */}
          <span style={{ position: 'absolute', bottom: 12, left: 12, background: diffColor + '22', color: diffColor, border: `1px solid ${diffColor}44`, borderRadius: 20, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, zIndex: 5 }}>
            {ex.difficulty}
          </span>
        </div>

        {/* Details */}
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.35rem', margin: '0 0 8px', fontWeight: 800 }}>{ex.name}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{ex.muscle}</span>
              <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>{ex.equipment}</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.88rem', color: 'var(--text-2)', marginBottom: 10, fontWeight: 700 }}>How To Perform</h4>
            <ol style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(ex.instructions || []).map((step, i) => (
                <li key={i} style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.6 }}>{step}</li>
              ))}
            </ol>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={onClose}>Got it!</button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ExerciseLibrary() {
  const [search, setSearch]         = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [diffFilter, setDiffFilter]   = useState('All');
  const [selected, setSelected]       = useState(null);

  const filtered = STATIC_LIBRARY.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchMuscle = muscleFilter === 'All' || ex.muscle === muscleFilter;
    const matchDiff   = diffFilter   === 'All' || ex.difficulty === diffFilter;
    return matchSearch && matchMuscle && matchDiff;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/member/workouts" style={{ color: 'var(--text-1)', background: 'var(--surface-2)', padding: 8, borderRadius: 12 }}>
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h2 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 800 }}>Exercise Library</h2>
          <p className="text-faint" style={{ margin: 0 }}>{STATIC_LIBRARY.length} exercises · Tap any to see demo</p>
        </div>
      </div>

      {/* Search */}
      <div className="input-wrapper">
        <Search className="input-icon" size={18} />
        <input type="text" className="form-input" placeholder="Search exercises..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
      </div>

      {/* Muscle filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {MUSCLE_GROUPS.map(m => (
          <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setMuscleFilter(m)}
            style={{ padding: '7px 14px', borderRadius: 20, border: '1px solid', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s',
              borderColor: muscleFilter === m ? 'var(--primary)' : 'var(--border)',
              background: muscleFilter === m ? 'rgba(139,92,246,0.15)' : 'var(--surface-2)',
              color: muscleFilter === m ? 'var(--primary)' : 'var(--text-2)' }}>
            {MUSCLE_EMOJI[m]} {m}
          </motion.button>
        ))}
      </div>

      {/* Difficulty filter */}
      <div style={{ display: 'flex', gap: 6 }}>
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => setDiffFilter(d)}
            style={{ padding: '5px 12px', borderRadius: 20, border: `1px solid ${diffFilter === d ? DIFF_COLOR[d] || 'var(--primary)' : 'var(--border)'}`,
              background: diffFilter === d ? (DIFF_COLOR[d] || 'var(--primary)') + '18' : 'transparent',
              color: diffFilter === d ? (DIFF_COLOR[d] || 'var(--primary)') : 'var(--text-3)',
              cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
            {d}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
        Showing <strong style={{ color: 'var(--text-1)' }}>{filtered.length}</strong> exercises
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map((ex, i) => (
          <motion.div key={ex.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
            onClick={() => setSelected(ex)}
            style={{ background: 'var(--surface-2)', borderRadius: 16, padding: 16, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)44'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Dumbbell size={22} color="#F59E0B" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</h4>
              <div style={{ display: 'flex', gap: 6, fontSize: '0.7rem', color: 'var(--text-3)', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 8 }}>{ex.muscle}</span>
                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 8 }}>{ex.equipment}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: DIFF_COLOR[ex.difficulty] || '#aaa', flexShrink: 0 }}>
              {ex.difficulty}
            </span>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            <Zap size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>No exercises found.</div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && <ExerciseModal ex={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

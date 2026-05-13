import { useState, useMemo } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';
import { motion } from 'framer-motion';

/**
 * High-Fidelity Anatomical GIFs (3D models with red muscle highlights)
 * Sourced and verified from fitnessprogramer.com
 */
const HIGH_FIDELITY_GIFS = {
  'bench press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
  'squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/BARBELL-SQUAT.gif',
  'deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
  'row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bent-Over-Row.gif',
  'overhead press': 'https://fitnessprogramer.com/wp-content/uploads/2021/07/Barbell-Standing-Military-Press.gif',
  'pull-up': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-up.gif',
  'lunge': 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Barbell-Lunge.gif',
  'bicep curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
  'pushdown': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif',
  'leg press': 'https://fitnessprogramer.com/wp-content/uploads/2015/11/Leg-Press.gif',
  'lateral raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
  'leg curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Seated-Leg-Curl.gif',
  'leg extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/LEG-EXTENSION.gif',
  'lat pulldown': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
  'fly': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Fly.gif',
  'incline bench': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Barbell-Bench-Press.gif',
  'hammer curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hammer-Curl.gif',
  'skull crusher': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Dumbbell-Skull-Crusher.gif',
  'plank': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/plank.gif',
  'bulgarian split squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/05/Dumbbell-Bulgarian-Split-Squat.gif',
  'dip': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/Chest-Dips.gif',
  'cable row': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
  'face pull': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',
  'arnold press': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif',
  'romanian deadlift': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Romanian-Deadlift.gif',
  'calf raise': 'https://fitnessprogramer.com/wp-content/uploads/2022/04/Standing-Barbell-Calf-Raise.gif',
  'preacher curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Z-Bar-Preacher-Curl.gif',
  'cable crossover': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif',
  'reverse fly': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Reverse-Fly.gif',
  'hip thrust': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif',
  't-bar row': 'https://fitnessprogramer.com/wp-content/uploads/2021/04/t-bar-rows.gif',
  'front squat': 'https://fitnessprogramer.com/wp-content/uploads/2021/06/front-squat.gif',
  'close grip bench': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Close-Grip-Bench-Press.gif',
  'pullover': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Pullover.gif',
  'concentration curl': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Concentration-Curl.gif',
  'triceps extension': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif',
  'leg raise': 'https://fitnessprogramer.com/wp-content/uploads/2021/08/Hanging-Leg-Raises.gif',
  'russian twist': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/Russian-Twist.gif',
  'burpee': 'https://fitnessprogramer.com/wp-content/uploads/2021/02/burpees.gif',
};

/**
 * Real Lottie animation URLs sourced directly from LottieFiles CDN.
 */
const LOTTIE_URLS = {
  chest:         'https://assets-v2.lottiefiles.com/a/333f4f4e-1171-11ee-aa03-23dee1fbdb3c/ReXNkakRwh.lottie',
  quadriceps:    'https://assets-v2.lottiefiles.com/a/245574e8-73f2-11ee-ae3c-ef13287bcf8e/P7S3i4DdBB.lottie',
  biceps:        'https://assets-v2.lottiefiles.com/a/b8ff1f68-1178-11ee-ac70-7fb0a2c785dd/CCcr26lMwZ.lottie',
  lats:          'https://assets-v2.lottiefiles.com/a/55290dd2-855e-11ee-9223-bf305e6a6858/KJB1rrjdPy.lottie',
  abdominals:    'https://assets-v2.lottiefiles.com/a/8c2ca306-116a-11ee-ae25-1fdd7969ba2e/jiKqqB91JX.lottie',
  default:       'https://assets-v2.lottiefiles.com/a/245574e8-73f2-11ee-ae3c-ef13287bcf8e/P7S3i4DdBB.lottie',
};

const MUSCLE_COLORS = {
  chest: '#ef4444', biceps: '#f97316', triceps: '#eab308',
  shoulders: '#22c55e', abdominals: '#06b6d4', quadriceps: '#8b5cf6',
  hamstrings: '#ec4899', glutes: '#f59e0b', calves: '#14b8a6',
  lats: '#3b82f6', 'middle back': '#6366f1', 'lower back': '#84cc16',
  traps: '#a855f7', forearms: '#fb923c', default: '#f59e0b',
};

// CSS-animated fallback (always works, zero network)
function FallbackCharacter({ muscle, accent }) {
  const scenes = {
    chest: (
      <svg viewBox="0 0 200 160" width="100%" height="100%">
        <style>{`@keyframes pressUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}.bar{animation:pressUp 1.6s ease-in-out infinite;transform-origin:100px 70px}`}</style>
        <rect x="40" y="110" width="120" height="14" rx="7" fill="rgba(255,255,255,0.1)"/>
        <ellipse cx="100" cy="104" rx="22" ry="10" fill="rgba(255,255,255,0.12)"/>
        <circle cx="150" cy="100" r="12" fill="rgba(255,255,255,0.2)"/>
        <rect x="70" y="88" width="10" height="28" rx="5" fill={accent} opacity="0.8"/>
        <rect x="120" y="88" width="10" height="28" rx="5" fill={accent} opacity="0.8"/>
        <g className="bar">
          <rect x="50" y="64" width="100" height="8" rx="4" fill="rgba(255,255,255,0.5)"/>
          <rect x="44" y="58" width="12" height="20" rx="3" fill={accent}/>
          <rect x="144" y="58" width="12" height="20" rx="3" fill={accent}/>
        </g>
        <ellipse cx="100" cy="98" rx="18" ry="7" fill={accent} opacity="0.3"/>
      </svg>
    ),
    biceps: (
      <svg viewBox="0 0 200 180" width="100%" height="100%">
        <style>{`@keyframes curlUp{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-72deg)}}.fa{animation:curlUp 1.4s ease-in-out infinite;transform-origin:65px 106px}`}</style>
        <rect x="80" y="50" width="40" height="60" rx="12" fill="rgba(255,255,255,0.12)"/>
        <circle cx="100" cy="40" r="16" fill="rgba(255,255,255,0.2)"/>
        <rect x="58" y="70" width="14" height="36" rx="7" fill="rgba(255,255,255,0.18)"/>
        <g className="fa">
          <rect x="58" y="106" width="14" height="34" rx="7" fill={accent}/>
          <rect x="46" y="136" width="38" height="10" rx="5" fill="rgba(255,255,255,0.5)"/>
        </g>
        <ellipse cx="65" cy="90" rx="10" ry="8" fill={accent} opacity="0.35"/>
      </svg>
    ),
  };
  const muscleKey = Object.keys(scenes).find(k => muscle.includes(k)) || null;
  return muscleKey ? scenes[muscleKey] : (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <style>{`@keyframes jmp{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}.jb{animation:jmp 1.2s ease-in-out infinite}`}</style>
      <g className="jb">
        <circle cx="100" cy="60" r="18" fill="rgba(255,255,255,0.2)"/>
        <rect x="82" y="78" width="36" height="44" rx="12" fill="rgba(255,255,255,0.12)"/>
        <rect x="56" y="98" width="28" height="12" rx="6" fill={accent} opacity="0.8"/>
        <rect x="116" y="98" width="28" height="12" rx="6" fill={accent} opacity="0.8"/>
      </g>
    </svg>
  );
}

/**
 * ExerciseCharacter — renders a premium anatomical GIF or Lottie animation.
 */
export default function ExerciseCharacter({ exercise, style = {} }) {
  const [mediaError, setMediaError] = useState(false);

  const name = (exercise?.name || '').toLowerCase();
  const muscle = (exercise?.primaryMuscles?.[0] || exercise?.muscle || '').toLowerCase();
  const accent = MUSCLE_COLORS[muscle] || MUSCLE_COLORS.default;

  // Prioritize the direct GIF URL from the exercise object
  const primaryGif = exercise?.gifUrl;

  // Fallback to high-fidelity mapping if no URL or error
  const hfGif = useMemo(() => {
    if (primaryGif) return null;
    const matchedKey = Object.keys(HIGH_FIDELITY_GIFS).find(key => name.includes(key));
    return matchedKey ? HIGH_FIDELITY_GIFS[matchedKey] : null;
  }, [name, primaryGif]);

  const lottieSrc = LOTTIE_URLS[muscle] || LOTTIE_URLS.default;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at center, ${accent}20 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Muscle badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 6,
        padding: '3px 9px', borderRadius: 8,
        background: `${accent}22`, border: `1px solid ${accent}55`,
        fontSize: '0.55rem', fontWeight: 900, color: accent,
        letterSpacing: '0.8px', textTransform: 'uppercase',
      }}>
        {muscle || 'workout'}
      </div>

      {/* Animated Scan Line (Premium UI Effect) */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute', left: 0, right: 0, height: '1.5px',
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          boxShadow: `0 0 10px ${accent}`,
          zIndex: 7, pointerEvents: 'none', opacity: 0.4
        }}
      />

      <div style={{ width: '90%', height: '90%', position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {(primaryGif || hfGif) && !mediaError ? (
          <img 
            src={primaryGif || hfGif} 
            alt={name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={() => setMediaError(true)}
          />
        ) : !mediaError ? (
          <DotLottiePlayer
            src={lottieSrc}
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
            onError={() => setMediaError(true)}
          />
        ) : (
          <FallbackCharacter muscle={muscle} accent={accent} />
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { 
  Flame,
  Play, Users, Target, Award, Zap, TrendingUp, 
  Dumbbell, Bot, Database,
  Clock, MapPin, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { badgeApi, nutritionApi, workoutsApi, classesApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BentoCard from '../../components/ui/BentoCard';
import { useAIUsage } from '../../hooks/useGymAI';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

// --- Sub-components ---

// BentoCard modularized to src/components/ui/BentoCard.jsx

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: 'Good night', icon: '🌙' };
  if (h < 12) return { text: 'Good morning', icon: '☀️' };
  if (h < 17) return { text: 'Good afternoon', icon: '🌤️' };
  if (h < 21) return { text: 'Good evening', icon: '🌆' };
  return { text: 'Good night', icon: '🌙' };
}

function capacityColor(pct) {
  if (pct < 50) return { color: 'var(--success)', label: 'Quiet' };
  if (pct < 80) return { color: 'var(--primary)', label: 'Steady' };
  return { color: 'var(--danger)', label: 'Busy' };
}

export default function MemberDashboard() {
  const { user } = useAuthStore();
  const [capacity] = useState(65);
  const [badges, setBadges] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [activeProgram, setActiveProgram] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  
  const { remaining, limit } = useAIUsage();
  const greeting = getGreeting();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [badgeRes, nutRes, progRes, sessRes] = await Promise.all([
          badgeApi.getMember(),
          nutritionApi.getDay(today),
          workoutsApi.getPrograms(),
          classesApi.getSessions({ startDate: new Date().toISOString() })
        ]);

        setBadges(badgeRes.data || []);
        setNutrition(nutRes.data?.data);
        setActiveProgram(progRes.data?.data?.[0]);
        if (sessRes.data?.data?.length > 0) {
          setNextSession(sessRes.data.data[0]);
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };
    fetchData();
  }, [today]);

  const cap = capacityColor(capacity);
  const totals = nutrition?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal = nutrition?.goal || { calories: 2000, protein: 150, carbs: 250, fat: 65 };

  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 152px)', color: 'var(--text-1)', overflowX: 'hidden' }}>
      <CyberMatrix intensity={0.06} />
      
      <div className="mobile-px-4" style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 16px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* --- Header --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          <motion.div variants={itemVariants}>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>
              {greeting.icon} {greeting.text}
            </p>
            <h1 className="mobile-text-2xl" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
              Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.firstName || 'Warrior'}</span>
            </h1>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            style={{ display: 'flex', gap: '12px' }}
          >
            <div className="glass-card-premium" style={{ padding: '12px 20px', borderRadius: '18px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Flame size={20} color="var(--danger)" style={{ marginBottom: '4px' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--danger)' }}>{user?.streak || 0}</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.6 }}>STREAK</div>
            </div>
          </motion.div>
        </motion.div>

        {/* --- Main Bento Grid --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bento-grid"
        >
          
          

          {/* Activity Status */}
          <BentoCard className="bento-item-2" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={18} color={cap.color} />
                <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: cap.color }}>Live Gym Capacity</span>
              </div>
              <div className="mobile-text-2xl" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4px' }}>{capacity}%</div>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', margin: 0 }}>The gym is <span style={{ color: cap.color, fontWeight: 700 }}>{cap.label}</span> right now.</p>
            </div>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${cap.color}20`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', inset: -4, borderRadius: '50%', borderTop: `4px solid ${cap.color}`, opacity: 0.6 }}
              />
              <TrendingUp size={32} color={cap.color} />
            </div>
          </BentoCard>

          {/* Quick Stats */}
          <BentoCard className="bento-item-3" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Zap size={28} color="var(--primary)" />
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{user?.totalWorkouts || 0}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Workouts</div>
          </BentoCard>

          <BentoCard className="bento-item-4" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Award size={28} color="var(--secondary)" />
            <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>{badges.length}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase' }}>Badges Earned</div>
          </BentoCard>

        </motion.div>

        {/* --- Quick Access Modules --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* TRAIN SECTION */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Dumbbell size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: 1.5 }}>Operational Hubs</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Training Hub', path: '/member/training', icon: Zap, color: 'var(--primary)', desc: 'Plans, Matrix & Flow' },
                { label: 'Live Studio', path: '/member/studio', icon: Activity, color: '#3b82f6', desc: 'Sync sessions' },
                { label: 'AI Neural Coach', path: '/member/coach', icon: Bot, color: '#ec4888', desc: 'Strategic guidance' },
                { label: 'Neural Basement', path: '/member/basement', icon: Database, color: '#10b981', desc: 'Local/Private AI' },
                { label: 'Fuel HQ', path: '/member/nutrition', icon: Target, color: '#ef4444', desc: 'Nutrition tracking' }
              ].map(item => (
                <Link key={item.label} to={item.path} style={{ textDecoration: 'none' }}>
                  <motion.div 
                    whileHover={{ y: -5, background: 'rgba(255,255,255,0.04)' }}
                    whileTap={{ scale: 0.98 }}
                    style={{ 
                      padding: '20px', borderRadius: '18px', background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' 
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>{item.label}</div>
                      <div style={{ color: 'var(--text-4)', fontSize: '0.7rem' }}>{item.desc}</div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

        </motion.div>

        {/* --- Secondary Row --- */}
        <div className="secondary-grid" style={{ marginTop: '20px' }}>
          
          {/* Training Program */}
          <div className="secondary-item-main">
            <BentoCard style={{ height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Dumbbell size={20} color="var(--success)" /> Current Program
                </h3>
                <Link to="/member/training" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>VIEW ALL</Link>
              </div>

              {activeProgram ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800 }}>{activeProgram.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.9rem' }}>{activeProgram.goal} • {activeProgram.sessions?.length || 0} Days/Week</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>65%</div>
                      <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>PROGRESS</div>
                    </div>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--success), var(--primary))', boxShadow: '0 0 15px var(--success)40' }}
                    />
                  </div>
                  <Link to="/member/training" style={{ textDecoration: 'none' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%', marginTop: '24px', padding: '14px', borderRadius: '14px', background: 'white', color: 'black',
                        fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Play size={18} fill="black" /> Resume Workout
                    </motion.button>
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                  <p style={{ color: 'var(--text-3)', marginBottom: '16px' }}>No active training program found.</p>
                  <Link to="/member/training">
                    <button className="btn-primary" style={{ padding: '10px 24px' }}>Browse Programs</button>
                  </Link>
                </div>
              )}
            </BentoCard>
          </div>

          {/* AI Tip & Next Class */}
          <div className="secondary-item-side">
            <BentoCard style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={18} color="#a78bfa" />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa', textTransform: 'uppercase' }}>AI Coach Tip</span>
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 900, background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '4px 8px', borderRadius: '6px' }}>
                   {limit === Infinity ? 'UNLIMITED' : `${remaining}/${limit} MESSAGES`}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-2)' }}>
                NEURAL_ADVISORY: Based on recovery metrics and biometric velocity, today is optimal for high-intensity loading. Enforce progressive overload protocols.
              </p>
            </BentoCard>

            <BentoCard>
              <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--primary)" /> Next Up
              </h3>
              {nextSession ? (
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '4px' }}>{nextSession.classId?.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '0.8rem', marginBottom: '12px' }}>
                    <MapPin size={12} /> {nextSession.classId?.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {new Date(nextSession.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <Link to="/member/studio">
                      <button style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>JOIN</button>
                    </Link>
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>No classes today.</p>
              )}
            </BentoCard>
          </div>

        </div>

        {/* --- Nutrition Row --- */}
        <div style={{ marginTop: '20px' }}>
          <BentoCard>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Target size={20} color="var(--info)" /> Nutrition Tracking
                </h3>
                <Link to="/member/fuel" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>LOG MEAL</Link>
              </div>

              <div className="mobile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--info)' }}>{Math.round(totals.calories)}</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>CALORIES</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (totals.calories/goal.calories)*100)}%`, height: '100%', background: 'var(--info)' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--success)' }}>{Math.round(totals.protein)}g</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>PROTEIN</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (totals.protein/goal.protein)*100)}%`, height: '100%', background: 'var(--success)' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{Math.round(totals.carbs)}g</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>CARBS</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (totals.carbs/goal.carbs)*100)}%`, height: '100%', background: 'var(--primary)' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--danger)' }}>{Math.round(totals.fat)}g</div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>FAT</div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (totals.fat/goal.fat)*100)}%`, height: '100%', background: 'var(--danger)' }} />
                  </div>
                </div>
              </div>
          </BentoCard>
        </div>

      </div>
    </div>
  );
}

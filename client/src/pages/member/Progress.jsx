/**
 * MemberProgress — Personal stats & progress tracking
 * Route: /member/progress
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Dumbbell, Target, Award,
  Calendar, ChevronUp, ChevronDown, Minus, Loader2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { progressApi } from '../../api';

// ─── Mini sparkline bar chart ─────────────────────────────────
function SparkBar({ values, color = 'var(--primary)', maxH = 40 }) {
  const max = Math.max(...values, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: maxH }}>
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
          style={{
            flex: 1, minWidth: 4, borderRadius: 3,
            background: i === values.length - 1 ? color : `${color}55`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, change, delay = 0 }) {
  const up = change > 0;
  const neutral = change === 0 || change == null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `${color}18`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        {change != null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.72rem', fontWeight: 700,
            color: neutral ? 'var(--text-3)' : up ? 'var(--success)' : 'var(--danger)',
          }}>
            {neutral ? <Minus size={12} /> : up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {neutral ? '—' : `${Math.abs(change)}%`}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: 1 }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Progress() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    overview: null,
    weight: [],
    records: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [overviewRes, weightRes, recordsRes] = await Promise.all([
          progressApi.getOverview(),
          progressApi.getWeight(),
          progressApi.getRecords()
        ]);
        setData({
          overview: overviewRes.data.data,
          weight: weightRes.data.data,
          records: recordsRes.data.data
        });
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tabs = ['overview', 'weight', 'records'];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
      </div>
    );
  }

  const { overview, weight, records } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 4px' }}>
          📈 My Progress
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0 }}>
          Track your fitness journey, {user?.firstName || 'Champ'}
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 6,
        background: 'var(--surface-2)', borderRadius: 12,
        padding: 4,
      }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 9,
              border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.78rem', textTransform: 'capitalize',
              background: activeTab === t ? 'var(--primary)' : 'transparent',
              color: activeTab === t ? '#000' : 'var(--text-3)',
              transition: 'all 0.2s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <StatCard
              icon={<Flame size={18} color="#F59E0B" />}
              label="Current Streak"
              value={`${overview?.streak ?? 0} days`}
              sub="Keep it going! 🔥"
              color="#F59E0B"
              change={0}
              delay={0}
            />
            <StatCard
              icon={<Dumbbell size={18} color="#8B5CF6" />}
              label="Total Workouts"
              value={overview?.totalWorkouts ?? 0}
              sub="All time"
              color="#8B5CF6"
              change={0}
              delay={0.06}
            />
            <StatCard
              icon={<Target size={18} color="#10B981" />}
              label="This Month"
              value={overview?.monthlySessions ?? '0 sessions'}
              sub={`Goal: ${overview?.goal ?? 20} sessions`}
              color="#10B981"
              change={0}
              delay={0.12}
            />
            <StatCard
              icon={<Calendar size={18} color="#3B82F6" />}
              label="Avg/Week"
              value={`${(overview?.workoutsPerWeek?.reduce((a, b) => a + b, 0) / 8).toFixed(1)} days`}
              sub="Last 8 weeks"
              color="#3B82F6"
              change={0}
              delay={0.18}
            />
          </div>

          {/* Workouts per week sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            style={{
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 18, padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Workouts per Week</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Last 8 weeks</div>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                {overview?.workoutsPerWeek?.[overview.workoutsPerWeek.length - 1] ?? 0}
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}> /wk</span>
              </div>
            </div>
            <SparkBar values={overview?.workoutsPerWeek ?? [0,0,0,0,0,0,0,0]} color="var(--primary)" maxH={52} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              {(overview?.workoutsPerWeek ?? [0,0,0,0,0,0,0,0]).map((_, i) => (
                <div key={i} style={{ fontSize: '0.6rem', color: 'var(--text-4)', flex: 1, textAlign: 'center' }}>
                  W{i + 1}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Goal progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(139,92,246,0.06))',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 18, padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Award size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800 }}>Monthly Goal</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{overview?.monthlySessions ?? '0 sessions'} / {overview?.goal ?? 20} sessions</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {Math.min(100, Math.round((parseInt(overview?.monthlySessions) / (overview?.goal ?? 20)) * 100)) || 0}%
              </span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.round((parseInt(overview?.monthlySessions) / (overview?.goal ?? 20)) * 100)) || 0}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #F59E0B, #8B5CF6)', borderRadius: 8 }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: 8 }}>
              {Math.max(0, (overview?.goal ?? 20) - parseInt(overview?.monthlySessions))} more sessions to hit your goal this month! 💪
            </div>
          </motion.div>
        </>
      )}

      {/* ── Weight Tab ── */}
      {activeTab === 'weight' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 18, padding: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Weight Progress</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>History</div>
              </div>
              {weight.length > 0 && (
                <div>
                  <div style={{ textAlign: 'right', fontWeight: 900, fontSize: '1.4rem' }}>
                    {weight[weight.length - 1].weight} kg
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--success)', textAlign: 'right', fontWeight: 700 }}>
                    {weight.length > 1 ? `↓ ${(weight[0].weight - weight[weight.length - 1].weight).toFixed(1)} kg diff` : 'Starting weight'}
                  </div>
                </div>
              )}
            </div>
            {weight.length > 0 ? (
              <>
                <SparkBar values={weight.map(w => w.weight)} color="#10B981" maxH={60} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {weight.slice(-8).map((w, i) => (
                    <div key={i} style={{ fontSize: '0.58rem', color: 'var(--text-4)', textAlign: 'center', flex: 1 }}>
                      {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 20 }}>No weight logs found</div>
            )}
          </div>

          {/* Weight entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...weight].reverse().map((w, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  background: i === 0 ? 'rgba(245,158,11,0.07)' : 'var(--surface-2)',
                  border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
                  borderRadius: 12,
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(w.date).toLocaleDateString()}</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{w.weight} kg</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Records Tab ── */}
      {activeTab === 'records' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginBottom: 4 }}>
            Your all-time personal bests 🏆
          </div>
          {records.length > 0 ? (
            records.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 16,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: 'rgba(245,158,11,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  {r.icon || '🏋️'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.exercise}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Set on {r.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>{r.weight}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{r.reps}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: 40 }}>No PRs found yet! Keep training.</div>
          )}
          <div style={{
            marginTop: 8, padding: '14px', borderRadius: 14,
            background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
            fontSize: '0.78rem', color: 'var(--success)', textAlign: 'center',
            fontWeight: 600,
          }}>
            🎯 Log your workouts in the Train tab to track new PRs!
          </div>
        </motion.div>
      )}

    </div>
  );
}

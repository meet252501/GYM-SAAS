import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Crown, Star, Zap, X, ChevronRight } from 'lucide-react';
import { analyticsApi, membersApi } from '../../api';
import { format } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────
const PLAN_CFG = {
  Elite:   { color: '#F59E0B', Icon: Crown },
  Premium: { color: '#A855F7', Icon: Star },
  Basic:   { color: '#3B82F6', Icon: Zap },
  Trial:   { color: '#10B981', Icon: Zap },
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a1f', border: '1px solid #333', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700, fontSize: '0.85rem' }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('rev') ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </div>
      ))}
    </div>
  );
};

// ─── Member Detail Drawer ─────────────────────────────────────
function MemberDrawer({ member, onClose }) {
  const planName = member.membershipPlan || member.currentMembershipId?.planName || 'Basic';
  const cfg = PLAN_CFG[planName] || PLAN_CFG.Basic;

  const [memberStats, setMemberStats] = useState({ weeklyWorkouts: [], totalAttendance: 0 });

  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        const res = await analyticsApi.getMember(member._id);
        if (res.data.success) {
          setMemberStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch member analytics:', err);
      }
    };
    fetchMemberStats();
  }, [member._id]);

  const workoutData = memberStats.weeklyWorkouts;



  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 400, zIndex: 200,
        background: '#0D0D10', borderLeft: '1px solid #222',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%', background: cfg.color + '22',
          border: `2px solid ${cfg.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1.1rem', color: cfg.color }}>
          {(member.firstName?.[0] || '?')}{(member.lastName?.[0] || '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.firstName} {member.lastName}</div>
          <div style={{ fontSize: '0.72rem', color: cfg.color, fontWeight: 700 }}>{planName} · {member.goal}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', flexShrink: 0, padding: 4 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Total Workouts', value: member.totalWorkouts || 0 },
            { label: 'Recent Attend', value: memberStats.totalAttendance || 0 },
            { label: 'Weight', value: `${member.currentMetrics?.weight || memberStats.recentMetrics?.weight || '--'}kg` },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#141418', borderRadius: 12,
              padding: '12px 16px', border: '1px solid #222' }}>
              <div style={{ fontSize: '0.7rem', color: '#666' }}>{s.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: cfg.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Workout frequency */}
        <div style={{ background: '#141418', borderRadius: 14, padding: 16, border: '1px solid #222' }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '0.85rem' }}>Recent Workout Frequency</div>
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={workoutData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="week" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="workouts" fill={cfg.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expiry */}
        <div style={{ background: '#141418', borderRadius: 14, padding: 16, border: '1px solid #222' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4 }}>Membership Expires</div>
          <div style={{ fontWeight: 700 }}>{member.membershipExpiry ? format(new Date(member.membershipExpiry), 'dd MMM yyyy') : 'N/A'}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
const RANGES = ['7D', '30D', '90D'];

export default function Analytics() {
  const [range, setRange]         = useState('30D');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading]     = useState(true);

  const [attData, setAttData]     = useState([]);
  const [revData, setRevData]     = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [expiringRisk, setExpiringRisk] = useState({ in7: 0, in14: 0, in30: 0 });

  const days = range === '7D' ? 7 : range === '30D' ? 30 : 90;

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [attRes, revRes, dashRes, memsRes, exp7, exp14, exp30] = await Promise.all([
          analyticsApi.getAttendanceChart(days),
          analyticsApi.getRevenue(days),
          analyticsApi.getDashboard(),
          membersApi.getAll({ limit: 100 }), // fetch a subset for profiling/distribution
          membersApi.getExpiringSoon(7),
          membersApi.getExpiringSoon(14),
          membersApi.getExpiringSoon(30),
        ]);

        if (attRes.data.success) {
          const formattedAtt = attRes.data.data.map(d => ({
            date: format(new Date(d._id), 'MMM dd'),
            count: d.count
          }));
          setAttData(formattedAtt);
        }

        if (revRes.data.success) {
          const formattedRev = revRes.data.data.map(d => ({
            date: format(new Date(d._id), 'MMM dd'),
            revenue: d.revenue
          }));
          setRevData(formattedRev);
        }

        if (dashRes.data.success) {
          setDashboardStats(dashRes.data.data);
        }

        if (memsRes.data.success) {
          setMembersData(memsRes.data.data);
        }

        setExpiringRisk({
          in7: exp7.data?.data?.length || 0,
          in14: exp14.data?.data?.length || 0,
          in30: exp30.data?.data?.length || 0,
        });

      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  // Plan distribution calculation
  const planDistMap = membersData.reduce((acc, m) => { 
    const planName = m.currentMembershipId?.planName || 'Basic';
    acc[planName] = (acc[planName] || 0) + 1; 
    return acc; 
  }, {});
  const planDist = Object.entries(planDistMap).map(([name, value]) => ({ 
    name, 
    value, 
    color: PLAN_CFG[name]?.color || '#888' 
  }));

  const totalRevenue = revData.reduce((s, d) => s + d.revenue, 0);
  const avgDaily     = attData.length > 0 ? Math.round(attData.reduce((s, d) => s + d.count, 0) / attData.length) : 0;
  const activeMembersCount = dashboardStats?.members?.active || 0;
  const totalMembersCount = dashboardStats?.members?.total || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Analytics</h2>
          <p className="text-faint text-sm" style={{ marginTop: 2 }}>Real-time gym performance</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 10, padding: 4 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: range === r ? 'var(--primary)' : 'transparent',
                color: range === r ? '#000' : 'var(--text-3)', fontWeight: 700, fontSize: '0.82rem' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid-3" style={{ gap: 16 }}>
        {[
          { label: 'Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, sub: `Last ${days} days`, Icon: DollarSign, color: 'var(--success)' },
          { label: 'Avg Daily Attendance', value: avgDaily, sub: 'Check-ins / day', Icon: Activity, color: 'var(--info)' },
          { label: 'Active Members', value: activeMembersCount, sub: `of ${totalMembersCount} total`, Icon: Users, color: 'var(--primary)' },
        ].map((k, i) => (
          <motion.div key={i} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.color + '15',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.Icon size={20} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{loading ? '...' : k.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{k.label}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-4)' }}>{k.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <TrendingUp size={16} color="var(--success)" />
          <h3 style={{ margin: 0, fontWeight: 800 }}>Revenue Trend</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')} total`}
          </span>
        </div>
        <div style={{ height: 220 }}>
          {loading ? (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading Chart...</div>
          ) : (
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={revData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false}
                  interval={days <= 7 ? 0 : Math.floor(days / 7)} />
                <YAxis stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<Tip />} />
                <Area dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Attendance + Plan dist */}
      <div className="grid-2">
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Activity size={16} color="var(--info)" />
            <h3 style={{ margin: 0, fontWeight: 800 }}>Daily Attendance</h3>
          </div>
          <div style={{ height: 200 }}>
            {loading ? (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading Chart...</div>
            ) : (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={attData} margin={{ top: 4, right: 0, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-4)" fontSize={10} tickLine={false} axisLine={false}
                    interval={days <= 7 ? 0 : Math.floor(days / 7)} />
                  <YAxis stroke="var(--text-4)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="count" name="Check-ins" fill="var(--info)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>Plan Distribution</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', gap: 16 }}>
            {loading ? (
               <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>Loading Data...</div>
            ) : planDist.length > 0 ? (
              <>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={planDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {planDist.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<Tip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {planDist.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{d.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{d.value} members</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
               <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>No plan data</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Planning stats */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>⚠️ Renewal Risk</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Expire in 7 days', count: expiringRisk.in7, color: 'var(--danger)' },
            { label: 'Expire in 14 days', count: expiringRisk.in14, color: 'var(--warning)' },
            { label: 'Expire in 30 days', count: expiringRisk.in30, color: 'var(--info)' },
          ].map(r => (
            <div key={r.label} style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 12,
              padding: '14px 16px', border: `1px solid ${r.color}33` }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: r.color }}>{loading ? '-' : r.count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{r.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Individual member list */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h3 style={{ margin: '0 0 16px', fontWeight: 800 }}>Recent Members Profiles</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
             <div style={{ color: 'var(--text-3)', padding: 12 }}>Loading profiles...</div>
          ) : membersData.length > 0 ? (
             membersData.slice(0, 10).map(m => {
              const planName = m.currentMembershipId?.planName || 'Basic';
              const cfg = PLAN_CFG[planName] || PLAN_CFG.Basic;
              return (
                <motion.div key={m._id} whileHover={{ x: 4 }}
                  onClick={() => setSelectedMember(m)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    background: 'var(--surface-2)', borderRadius: 12, cursor: 'pointer',
                    border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '44'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: cfg.color + '20',
                    border: `1.5px solid ${cfg.color}55`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: cfg.color }}>
                    {(m.firstName?.[0] || '?')}{(m.lastName?.[0] || '')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{m.firstName} {m.lastName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{m.goal || 'Fitness'} · {m.totalWorkouts || 0} workouts · {m.streak?.current || 0}d streak</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, background: cfg.color + '18',
                    color: cfg.color, fontSize: '0.72rem', fontWeight: 700 }}>{planName}</span>
                  <ChevronRight size={14} color="var(--text-4)" />
                </motion.div>
              );
            })
          ) : (
            <div style={{ color: 'var(--text-3)', padding: 12 }}>No active members found.</div>
          )}
        </div>
      </motion.div>

      {/* Member drawer */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />
            <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

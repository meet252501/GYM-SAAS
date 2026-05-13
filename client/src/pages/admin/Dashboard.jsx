import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, CreditCard, Activity, Flame, AlertTriangle, 
  ArrowUpRight, TrendingUp, Calendar, Crown, Loader2, Smartphone
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StreakBadge } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { analyticsApi, membersApi } from '../../api';
import CyberMatrix from '../../components/ui/CyberMatrix';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{
        padding: '12px 16px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 800, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('Month');
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [expiringMembers, setExpiringMembers] = useState([]);
  const [topStreaks, setTopStreaks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [dashRes, expiringRes, streaksRes] = await Promise.all([
          analyticsApi.getDashboard(),
          membersApi.getExpiringSoon(7),
          membersApi.getAll({ sortBy: 'streak.current', order: 'desc', limit: 3 })
        ]);
        
        if (dashRes.data.success) setDashboardData(dashRes.data.data);
        if (expiringRes.data.success) setExpiringMembers(expiringRes.data.data);
        if (streaksRes.data.success) setTopStreaks(streaksRes.data.data);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        let days = 30;
        if (timeRange === 'Week') days = 7;
        if (timeRange === 'Year') days = 365;

        const [revRes] = await Promise.all([
          analyticsApi.getRevenue(days),
          analyticsApi.getAttendanceChart(7)
        ]);

        if (revRes.data.success) {
          const formattedRev = revRes.data.data.map(d => {
            const date = new Date(d._id);
            return {
              ...d,
              month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
          });
          setRevenueData(formattedRev);
        }


      } catch (error) {
        console.error("Failed to fetch charts:", error);
      }
    };

    fetchCharts();
  }, [timeRange]);

  const stats = [
    { 
      label: 'Active Members', 
      value: dashboardData?.members?.active || 0, 
      icon: Users, color: 'var(--primary)', 
      trend: dashboardData?.members?.newThisMonth > 0 ? `+${dashboardData.members.newThisMonth}` : '0', 
      type: 'up' 
    },
    { 
      label: 'New Growth', 
      value: dashboardData?.members?.newThisMonth || 0, 
      icon: UserPlus, color: 'var(--success)', 
      trend: 'MTD', type: 'up' 
    },
    { 
      label: 'Revenue (MTD)', 
      value: `₹${((dashboardData?.revenue?.thisMonth || 0) / 1000).toFixed(1)}k`, 
      icon: CreditCard, color: 'var(--info)', 
      trend: `${dashboardData?.revenue?.growth > 0 ? '+' : ''}${dashboardData?.revenue?.growth || 0}%`, 
      type: dashboardData?.revenue?.growth >= 0 ? 'up' : 'down' 
    },
    { 
      label: 'Kiosk Entries', 
      value: `${dashboardData?.attendance?.today || 0}`, 
      icon: Smartphone, color: 'var(--danger)', 
      trend: 'Live', type: 'up' 
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '12px 0' }}>
      <CyberMatrix intensity={0.06} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 8px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.8rem', fontWeight: 900, background: 'linear-gradient(to right, #fff, #666)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
            Quantum <span style={{ color: 'var(--primary)' }}>Pulse</span>
          </h1>
          <p style={{ color: 'var(--text-3)', fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
            <Activity size={14} color="var(--primary)" className="animate-pulse" /> Global Gym Telemetry Active
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
           <div className="glass-panel" style={{ padding: '10px 20px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Calendar size={18} color="var(--primary)" />
              <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#fff', letterSpacing: '0.5px' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
           </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid-4" style={{ gap: 20 }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            className="glass-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              padding: 28, borderRadius: 32, position: 'relative', overflow: 'hidden',
              background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at top right, ${stat.color}15, transparent 70%)`, pointerEvents: 'none' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${stat.color}10`, border: `1px solid ${stat.color}25`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 900, color: stat.type === 'up' ? 'var(--success)' : 'var(--danger)', background: stat.type === 'up' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', padding: '6px 12px', borderRadius: 10, border: `1px solid ${stat.type === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
                {stat.trend} {stat.type === 'up' ? <ArrowUpRight size={14} /> : <TrendingUp size={14} style={{ transform: 'rotate(90deg)' }} />}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{stat.label}</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', marginTop: 8, letterSpacing: '-0.02em' }}>{loading ? '...' : stat.value}</div>
            </div>
            
            {/* Holographic scan line effect */}
            <motion.div 
              animate={{ left: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
              style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: `linear-gradient(90deg, transparent, ${stat.color}05, transparent)`, pointerEvents: 'none' }}
            />
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 32 }}>
        
        {/* Main Chart Area */}
        <motion.div 
          className="glass-card-premium" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3 }}
          style={{ padding: 40, borderRadius: 40, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Revenue Architecture</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Neural cashflow analysis & Predictive modeling</p>
            </div>
            <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              {['Week', 'Month', 'Year'].map(t => (
                <button 
                  key={t}
                  style={{ 
                    borderRadius: 12, padding: '8px 18px', fontSize: '0.75rem', fontWeight: 900, 
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: timeRange === t ? 'var(--primary)' : 'transparent',
                    color: timeRange === t ? '#000' : 'var(--text-3)',
                  }}
                  onClick={() => setTimeRange(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: 380, width: '100%' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} dy={15} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} fontWeight={800} tickLine={false} axisLine={false} dx={-10} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="REVENUE" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Right Sidebar - High Performance Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <motion.div className="glass-card-premium" style={{ padding: 32, borderRadius: 40, borderLeft: '4px solid var(--primary)', background: 'rgba(255,255,255,0.01)' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Flame size={22} color="var(--primary)" className="streak-flame" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Elite Tier</h3>
              </div>
              <Crown size={20} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {loading ? (
                 <div style={{ color: 'var(--text-4)', fontSize: '0.8rem', fontWeight: 700 }}>SYNCHRONIZING_ELITE_DATA...</div>
              ) : topStreaks.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={`${m.firstName} ${m.lastName}`} size="md" />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, background: 'var(--success)', border: '3px solid #000', borderRadius: '50%' }} 
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>{m.firstName}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{m.membershipPlan || 'ELITE'}</div>
                    </div>
                  </div>
                  <StreakBadge count={m.streak?.current || 0} />
                </div>
              ))}
            </div>
            <Link to="/admin/members" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: 32, borderRadius: 16, fontSize: '0.8rem', fontWeight: 900, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-2)', padding: '14px', letterSpacing: '0.1em' }}>
                ACCESS_DIRECTORY
              </button>
            </Link>
          </motion.div>

          {/* Expiring Soon Widget */}
          <motion.div className="glass-card-premium" style={{ padding: 32, borderRadius: 40, borderLeft: '4px solid var(--danger)', background: 'rgba(255,255,255,0.01)' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={22} color="var(--danger)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>Churn Vectors</h3>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 900, border: '1px solid rgba(239,68,68,0.2)' }}>
                {expiringMembers.length} CRITICAL
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {expiringMembers.slice(0, 3).map((member, i) => {
                const daysLeft = differenceInDays(new Date(member.membershipExpiry), new Date());
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <Avatar name={`${member.firstName} ${member.lastName}`} size="sm" />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff' }}>{member.firstName}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase', marginTop: 2 }}>PROTOCOL_EXPIRY</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 900, color: daysLeft <= 2 ? 'var(--danger)' : 'var(--warning)', letterSpacing: '0.5px' }}>
                        {daysLeft === 0 ? 'IMMEDIATE' : `${daysLeft}D_REMAINING`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
      </div>
    </div>
  );
}

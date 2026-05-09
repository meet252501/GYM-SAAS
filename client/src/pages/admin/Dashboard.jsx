import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, CreditCard, Activity, Flame, AlertTriangle, 
  ArrowUpRight, TrendingUp, Calendar, Crown, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StreakBadge } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';
import { differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { analyticsApi, membersApi } from '../../api';

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
      label: 'Today Entry', 
      value: `${dashboardData?.attendance?.today || 0}`, 
      icon: Activity, color: 'var(--danger)', 
      trend: 'Live', type: 'up' 
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            System Overview
          </h1>
          <p style={{ color: 'var(--text-3)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} color="var(--success)" /> Live analytical feed of GymFlow operations
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
           </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid-4" style={{ gap: 24 }}>
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            className="glass-panel premium-card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ padding: 24, borderRadius: 28, position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: stat.color, opacity: 0.03, filter: 'blur(40px)', borderRadius: '0 0 0 100%' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ padding: 12, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', fontWeight: 800, color: stat.type === 'up' ? 'var(--success)' : 'var(--danger)', background: stat.type === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 8 }}>
                {stat.trend} {stat.type === 'up' ? <ArrowUpRight size={12} /> : <TrendingUp size={12} style={{ transform: 'rotate(90deg)' }} />}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginTop: 4 }}>{loading ? '...' : stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 32 }}>
        
        {/* Main Chart Area */}
        <motion.div 
          className="glass-panel" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3 }}
          style={{ padding: 32, borderRadius: 32, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>Revenue Intelligence</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>Real-time cashflow analysis and forecasting</p>
            </div>
            <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              {['Week', 'Month', 'Year'].map(t => (
                <button 
                  key={t}
                  className={`btn btn-sm ${timeRange === t ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: 10, padding: '6px 14px', fontSize: '0.75rem', fontWeight: 800 }}
                  onClick={() => setTimeRange(t)}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: 360, width: '100%' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
                <Loader2 className="animate-spin" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--text-4)" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-4)" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-10} tickFormatter={v => `₹${v/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Right Sidebar - High Performance Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <motion.div className="glass-panel" style={{ padding: 28, borderRadius: 32, borderLeft: '4px solid var(--primary)' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flame size={20} className="text-primary streak-flame" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>Top Performers</h3>
              </div>
              <Crown size={18} color="var(--primary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {loading ? (
                 <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Loading elite data...</div>
              ) : topStreaks.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                      <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, background: 'var(--success)', border: '2px solid var(--surface)', borderRadius: '50%' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{m.firstName} {m.lastName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{m.membershipPlan} Member</div>
                    </div>
                  </div>
                  <StreakBadge count={m.streak?.current || 0} />
                </div>
              ))}
            </div>
            <Link to="/admin/members" className="btn btn-ghost btn-block" style={{ marginTop: 24, borderRadius: 14, fontSize: '0.85rem', fontWeight: 800 }}>
              VIEW ALL MEMBERS
            </Link>
          </motion.div>

          {/* Expiring Soon Widget */}
          <motion.div className="glass-panel" style={{ padding: 28, borderRadius: 32, borderLeft: '4px solid var(--danger)' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} color="var(--danger)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: 0 }}>Churn Risk</h3>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 900 }}>
                {expiringMembers.length} CRITICAL
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {expiringMembers.slice(0, 3).map((member, i) => {
                const daysLeft = differenceInDays(new Date(member.membershipExpiry), new Date());
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={`${member.firstName} ${member.lastName}`} size="sm" />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{member.firstName}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 700 }}>PLAN EXPIRES</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 900, color: daysLeft <= 2 ? 'var(--danger)' : 'var(--warning)' }}>
                        {daysLeft === 0 ? 'Today' : `${daysLeft}D LEFT`}
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
  );
}

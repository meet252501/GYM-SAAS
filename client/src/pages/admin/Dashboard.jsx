import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, CreditCard, Activity, Flame } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { MOCK_STATS, REVENUE_DATA, ATTENDANCE_DATA } from '../../data/mockData';
import { StreakBadge } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(9, 9, 11, 0.95)',
        border: '1px solid var(--border)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        backdropFilter: 'blur(10px)',
      }}>
        <p style={{ margin: '0 0 6px 0', fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('Week');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Stats Grid */}
      <div className="grid-4">
        {[
          { label: 'Active Members', value: MOCK_STATS.activeMembers, icon: Users, color: 'amber', trend: '+12%', type: 'up' },
          { label: 'New This Month', value: MOCK_STATS.newThisMonth, icon: UserPlus, color: 'green', trend: '+4%', type: 'up' },
          { label: 'Revenue (MTD)', value: `$${(MOCK_STATS.revenueThisMonth/1000).toFixed(1)}k`, icon: CreditCard, color: 'blue', trend: '+8%', type: 'up' },
          { label: 'Avg Attendance', value: `${MOCK_STATS.avgDailyAttendance}`, icon: Activity, color: 'red', trend: '-2%', type: 'down' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`stat-icon stat-icon-${stat.color}`}>
              <stat.icon size={22} className={stat.color === 'amber' ? 'text-primary' : `text-${stat.color}`} />
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className={`stat-change ${stat.type}`}>
                {stat.type === 'up' ? '↑' : '↓'} {stat.trend} vs last month
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Main Chart Area */}
        <motion.div 
          className="card" 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 2 }}>Revenue & Growth</h3>
              <p className="text-faint text-sm">Monthly performance metrics</p>
            </div>
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 4, borderRadius: 'var(--radius-md)' }}>
              {['Week', 'Month', 'Year'].map(t => (
                <button 
                  key={t}
                  className={`btn btn-sm ${timeRange === t ? 'btn-secondary' : 'btn-ghost'}`}
                  style={{ border: 'none', padding: '4px 12px' }}
                  onClick={() => setTimeRange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Sidebar - Mini Leaderboard & Attendance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <motion.div className="card-amber" style={{ padding: '24px' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '20px' }}>
              <Flame size={20} className="text-primary streak-flame" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Top Streaks</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { name: 'Alex Johnson', streak: 42 },
                { name: 'Sarah Chen', streak: 28 },
                { name: 'Mike Ross', streak: 15 }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size="sm" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.name}</span>
                  </div>
                  <StreakBadge count={m.streak} />
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-block btn-sm" style={{ marginTop: '20px' }}>View Leaderboard</button>
          </motion.div>

          <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
             <h3 style={{ fontSize: '1.05rem', marginBottom: '20px' }}>Peak Hours</h3>
             <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={ATTENDANCE_DATA.slice(0, 7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'var(--surface-2)'}} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

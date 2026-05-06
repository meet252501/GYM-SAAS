import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ATTENDANCE_DATA } from '../../data/mockData';
import { Activity, Dumbbell } from 'lucide-react';

const PIE_DATA = [
  { name: 'Strength', value: 45 },
  { name: 'Cardio', value: 30 },
  { name: 'Classes', value: 15 },
  { name: 'Recovery', value: 10 },
];
const COLORS = ['var(--primary)', 'var(--info)', 'var(--success)', 'var(--surface-4)'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
        <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--text-3)' }}>{label}</p>
        {payload.map((e, i) => (
          <div key={i} style={{ color: e.color, fontWeight: 700, fontSize: '0.9rem' }}>{e.name}: {e.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="flex justify-between items-center">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm">Daily</button>
          <button className="btn btn-primary btn-sm">Weekly</button>
          <button className="btn btn-secondary btn-sm">Monthly</button>
        </div>
      </div>

      <div className="grid-2">
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
            <Activity className="text-info" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Peak Attendance Hours</h3>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={ATTENDANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'var(--surface-2)'}} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--info)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
            <Dumbbell className="text-primary" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Equipment Usage vs Classes</h3>
          </div>
          <div style={{ height: 300, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {PIE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PIE_DATA.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[i] }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>{d.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { StreakBadge } from '../../components/ui/Badges';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Alex Johnson', streak: 42, points: 1250, rank: 1, tier: 'Legendary' },
  { id: 2, name: 'Sarah Chen', streak: 28, points: 980, rank: 2, tier: 'Epic' },
  { id: 3, name: 'Mike Ross', streak: 15, points: 750, rank: 3, tier: 'Rare' },
  { id: 4, name: 'Emma Davis', streak: 12, points: 620, rank: 4, tier: 'Common' },
  { id: 5, name: 'James Wilson', streak: 8, points: 450, rank: 5, tier: 'Common' },
];

export default function Leaderboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="grid-3" style={{ marginBottom: 16 }}>
        {MOCK_LEADERBOARD.slice(0, 3).map((user, i) => (
          <motion.div 
            key={user.id}
            className={`card ${i === 0 ? 'card-amber' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}
          >
            {i === 0 && <div style={{ position: 'absolute', top: -16, background: 'var(--gradient-brand)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 800, boxShadow: 'var(--shadow-amber)' }}>#1 CHAMPION</div>}
            
            <div style={{ position: 'relative', marginTop: i === 0 ? 16 : 0, marginBottom: 16 }}>
              <Avatar name={user.name} size="xl" />
              <div style={{ position: 'absolute', bottom: -10, right: -10, background: 'var(--surface)', borderRadius: '50%', padding: 4 }}>
                {i === 0 ? <Trophy className="text-primary" size={24} /> : i === 1 ? <Medal color="#94A3B8" size={24} /> : <Medal color="#B45309" size={24} />}
              </div>
            </div>
            
            <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem' }}>{user.name}</h3>
            <span className={`badge badge-${user.tier.toLowerCase()}`} style={{ marginBottom: 16 }}>{user.tier}</span>
            
            <div className="flex gap-4 items-center justify-center w-full" style={{ background: 'var(--surface-2)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Points</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user.points}</div>
              </div>
              <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Streak</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>{user.streak}🔥</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="card table-wrapper" style={{ padding: 0 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Rank</th>
              <th>Member</th>
              <th>Tier</th>
              <th>Points</th>
              <th>Current Streak</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map(user => (
              <tr key={user.id}>
                <td style={{ fontWeight: 800, color: user.rank <= 3 ? 'var(--primary)' : 'var(--text-3)' }}>#{user.rank}</td>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                  </div>
                </td>
                <td><span className={`badge badge-${user.tier.toLowerCase()}`}>{user.tier}</span></td>
                <td style={{ fontWeight: 700 }}>{user.points}</td>
                <td><StreakBadge count={user.streak} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

    </div>
  );
}

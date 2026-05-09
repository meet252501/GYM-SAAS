import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import { StreakBadge } from '../../components/ui/Badges';
import { useState } from 'react';

const MOCK_LEADERBOARD = [
  { id: 1, name: 'Vikram Singh',   streak: 42, points: 1250, rank: 1, tier: 'Legendary', change: +2 },
  { id: 2, name: 'Arjun Sharma',   streak: 28, points:  980, rank: 2, tier: 'Epic',      change:  0 },
  { id: 3, name: 'Priya Patel',    streak: 15, points:  750, rank: 3, tier: 'Rare',      change: -1 },
  { id: 4, name: 'Rohan Mehta',    streak: 12, points:  620, rank: 4, tier: 'Common',    change: +1 },
  { id: 5, name: 'Ananya Gupta',   streak:  8, points:  450, rank: 5, tier: 'Common',    change:  0 },
];

const PODIUM_HEIGHTS = [160, 120, 90]; // Gold, Silver, Bronze platform heights
const PODIUM_COLORS = {
  0: { bg: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(245,158,11,0.06))', border: 'rgba(245,158,11,0.4)', text: '#F59E0B', glow: '0 0 40px rgba(245,158,11,0.2)' },
  1: { bg: 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(148,163,184,0.04))', border: 'rgba(148,163,184,0.3)', text: '#94A3B8', glow: '0 0 30px rgba(148,163,184,0.1)' },
  2: { bg: 'linear-gradient(135deg, rgba(180,83,9,0.12), rgba(180,83,9,0.04))',  border: 'rgba(180,83,9,0.3)',  text: '#B45309', glow: '0 0 30px rgba(180,83,9,0.1)' },
};

const MEDAL_ICONS = [
  <Trophy size={22} />,
  <Medal size={22} />,
  <Medal size={22} />,
];

function RankChange({ change }) {
  if (change === 0) return <Minus size={13} color="var(--text-3)" />;
  if (change > 0) return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--success)', fontSize: '0.72rem', fontWeight: 700 }}>
      <TrendingUp size={13} /> +{change}
    </span>
  );
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 700 }}>
      <TrendingDown size={13} /> {change}
    </span>
  );
}

export default function Leaderboard() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_LEADERBOARD.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  // Podium order: 2nd left, 1st center, 3rd right
  const top3 = MOCK_LEADERBOARD.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // [2nd, 1st, 3rd]
  const podiumIndices = [1, 0, 2]; // visual positions map to rank-1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Animated Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, paddingTop: 24 }}>
        {podiumOrder.map((user, vi) => {
          const rankIndex = podiumIndices[vi]; // 0=gold,1=silver,2=bronze
          const col = PODIUM_COLORS[rankIndex];
          const isChampion = rankIndex === 0;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: rankIndex * 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
            >
              {/* Champion badge */}
              {isChampion && (
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  style={{
                    background: 'var(--gradient-brand)', color: 'white',
                    padding: '4px 14px', borderRadius: 20, fontSize: '0.72rem',
                    fontWeight: 900, boxShadow: 'var(--shadow-amber)', marginBottom: 10,
                    letterSpacing: '0.5px',
                  }}
                >
                  👑 CHAMPION
                </motion.div>
              )}

              {/* Avatar with medal overlay */}
              <motion.div
                whileHover={{ scale: 1.06, y: -4 }}
                style={{ position: 'relative', marginBottom: 10 }}
              >
                <div style={{
                  borderRadius: '50%',
                  padding: isChampion ? 3 : 2,
                  background: col.border,
                  boxShadow: col.glow,
                }}>
                  <Avatar name={user.name} size={isChampion ? 'xl' : 'lg'} />
                </div>
                <div style={{
                  position: 'absolute', bottom: -8, right: -8,
                  background: 'var(--surface)', borderRadius: '50%',
                  padding: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  color: col.text,
                }}>
                  {MEDAL_ICONS[rankIndex]}
                </div>
              </motion.div>

              {/* Name + tier */}
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: isChampion ? '1rem' : '0.88rem' }}>{user.name.split(' ')[0]}</div>
                <span className={`badge badge-${user.tier.toLowerCase()}`} style={{ fontSize: '0.62rem', padding: '2px 8px', marginTop: 4 }}>{user.tier}</span>
              </div>

              {/* Podium platform */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: PODIUM_HEIGHTS[rankIndex] }}
                transition={{ duration: 0.8, delay: 0.2 + rankIndex * 0.15, ease: 'easeOut' }}
                style={{
                  width: '100%', borderRadius: '12px 12px 0 0',
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                  borderBottom: 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'flex-start', paddingTop: 14, gap: 4,
                  overflow: 'hidden',
                }}
              >
                <div style={{ fontWeight: 900, fontSize: '1.4rem', color: col.text }}>
                  #{user.rank}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>{user.points}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600 }}>PTS</div>
                <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{user.streak}🔥</div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Search + Full table */}
      <motion.div
        className="card"
        style={{ padding: 0, overflow: 'hidden' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        {/* Search header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="input-wrapper">
            <Search className="input-icon" size={15} />
            <input
              className="form-input"
              placeholder="Filter members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Rank</th>
                <th>Member</th>
                <th>Tier</th>
                <th>Points</th>
                <th>Streak</th>
                <th style={{ width: 60 }}>Change</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map(user => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                  >
                    <td style={{ fontWeight: 900, fontSize: '1.1rem', color: user.rank <= 3 ? 'var(--primary)' : 'var(--text-3)' }}>
                      {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : `#${user.rank}`}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <span style={{ fontWeight: 600 }}>{user.name}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${user.tier.toLowerCase()}`}>{user.tier}</span></td>
                    <td style={{ fontWeight: 800 }}>{user.points.toLocaleString()}</td>
                    <td><StreakBadge count={user.streak} /></td>
                    <td><RankChange change={user.change} /></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px' }}>
                    No members match "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}

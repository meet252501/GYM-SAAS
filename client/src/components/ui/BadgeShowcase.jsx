import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

import { BADGE_DEFS } from '../../data/badges';

const RARITY_COLORS = { Common: '#10b981', Rare: '#3b82f6', Epic: '#8b5cf6', Legendary: '#f59e0b' };

function BadgeCard({ badgeKey, earned }) {
  const def = BADGE_DEFS[badgeKey] || { icon: '🏅', label: badgeKey, desc: '', color: '#6b7280', rarity: 'Common' };
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div whileHover={{ scale: earned ? 1.06 : 1 }} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 16,
        background: earned ? `${def.color}14` : 'var(--surface-2)',
        border: earned ? `1px solid ${def.color}40` : '1px solid var(--border)',
        opacity: earned ? 1 : 0.4, cursor: earned ? 'pointer' : 'default',
        filter: earned ? 'none' : 'grayscale(1)' }}>
      {earned && (
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, borderRadius: 16, background: `radial-gradient(circle, ${def.color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
      )}
      <div style={{ fontSize: '2rem', filter: earned ? 'drop-shadow(0 0 8px currentColor)' : 'none' }}>{def.icon}</div>
      <div style={{ fontWeight: 700, fontSize: '0.72rem', textAlign: 'center', color: earned ? def.color : 'var(--text-3)', lineHeight: 1.3 }}>{def.label}</div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${RARITY_COLORS[def.rarity]}20`, color: RARITY_COLORS[def.rarity] }}>{def.rarity}</span>

      <AnimatePresence>
        {hovered && earned && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.9 }}
            style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text-2)', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', pointerEvents: 'none' }}>
            {def.desc}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function BadgeShowcase({ earnedBadges = [] }) {
  const allBadgeKeys = Object.keys(BADGE_DEFS);
  const earnedCount = earnedBadges.filter(b => BADGE_DEFS[b]).length;

  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 20, padding: '18px 20px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trophy size={18} color="var(--primary)" /> Badges
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>{earnedCount}/{allBadgeKeys.length} earned</div>
        </div>
        <div style={{ height: 6, width: 80, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${(earnedCount / allBadgeKeys.length) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg,var(--primary),#8b5cf6)', borderRadius: 4 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {allBadgeKeys.map(key => (
          <BadgeCard key={key} badgeKey={key} earned={earnedBadges.includes(key)} />
        ))}
      </div>
    </div>
  );
}

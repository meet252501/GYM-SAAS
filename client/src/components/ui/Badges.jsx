import { differenceInDays } from 'date-fns';

const STATUS_MAP = {
  active: { label: 'Active', cls: 'badge-active' },
  expired: { label: 'Expired', cls: 'badge-expired' },
  trial: { label: 'Trial', cls: 'badge-trial' },
  suspended: { label: 'Suspended', cls: 'badge-suspended' },
};

export function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'badge-common' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function StreakBadge({ count }) {
  if (!count) return <span className="text-faint text-sm">—</span>;
  return (
    <span className="streak-badge">
      <span className="streak-flame">🔥</span>
      <span className="streak-count">{count}</span>
    </span>
  );
}

export function DaysLeftBar({ expiry }) {
  if (!expiry) return null;
  const days = differenceInDays(new Date(expiry), new Date());
  if (days < 0) return <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>Expired</span>;
  const maxDays = 30;
  const pct = Math.min((days / maxDays) * 100, 100);
  const color = days <= 7 ? 'var(--danger)' : days <= 14 ? 'var(--warning)' : 'var(--success)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{days}d left</div>
      <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 999, width: 72 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 999, transition: '0.3s' }} />
      </div>
    </div>
  );
}

export function PlanBadge({ plan }) {
  const colors = { Trial: '#F59E0B', Basic: '#6B7280', Premium: '#F59E0B', Elite: '#8B5CF6' };
  const c = colors[plan] || '#6B7280';
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: `${c}22`, color: c, border: `1px solid ${c}44` }}>
      {plan}
    </span>
  );
}

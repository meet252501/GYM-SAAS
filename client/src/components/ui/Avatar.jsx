export default function Avatar({ name = '', size = 'md', className = '' }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F97316'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {initials || '?'}
    </div>
  );
}

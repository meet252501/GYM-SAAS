import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Plus, MoreHorizontal, X, Edit, Trash2, Eye } from 'lucide-react';

const INITIAL_CLASSES = [
  { id: 1, name: 'HIIT Extreme', instructor: 'Mike Tyson', time: '08:00 AM', duration: '45m', capacity: 20, booked: 18, type: 'Cardio' },
  { id: 2, name: 'Powerlifting Basics', instructor: 'Arnold S.', time: '10:30 AM', duration: '60m', capacity: 15, booked: 15, type: 'Strength' },
  { id: 3, name: 'Yoga Flow', instructor: 'Elena R.', time: '05:00 PM', duration: '60m', capacity: 25, booked: 12, type: 'Flexibility' },
  { id: 4, name: 'CrossFit WOD', instructor: 'Rich Froning', time: '06:30 PM', duration: '60m', capacity: 20, booked: 19, type: 'Mixed' },
];

const CLASS_TYPES = ['Cardio', 'Strength', 'Flexibility', 'Mixed', 'Yoga', 'Boxing', 'Cycling'];

// ─── Add/Edit Class Modal ────────────────────────────────────
function ClassModal({ onClose, onSave, existing }) {
  const [form, setForm] = useState(existing || { name: '', instructor: '', time: '07:00 AM', duration: '60m', capacity: 20, type: 'Cardio' });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.instructor) return;
    setSaving(true);
    setTimeout(() => { onSave(form); setSaving(false); onClose(); }, 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="modal"
        style={{ maxWidth: 460 }}
      >
        <div className="modal-header">
          <h3 className="modal-title">{existing ? 'Edit Class' : 'Add New Class'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Class Name *</label>
            <input className="form-input" placeholder="e.g. HIIT Blaster" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label">Instructor *</label>
            <input className="form-input" placeholder="Instructor name" value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} required />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" placeholder="08:00 AM" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <select className="form-select" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}>
                <option>30m</option>
                <option>45m</option>
                <option>60m</option>
                <option>90m</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input className="form-input" type="number" min="1" max="100" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {CLASS_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <Plus size={16} />}
              {saving ? 'Saving...' : existing ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Manage Attendees Modal ──────────────────────────────────
function AttendeesModal({ cls, onClose }) {
  const mockAttendees = Array.from({ length: cls.booked }, (_, i) => `Member ${i + 1}`);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title">{cls.name} — Attendees</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
          {mockAttendees.map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>{i + 1}</div>
              <div style={{ fontWeight: 600 }}>Gym Member #{i + 1}</div>
              <div style={{ marginLeft: 'auto' }}><span className="badge badge-active">Booked</span></div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Class Action Menu ───────────────────────────────────────
function ClassMenu({ cls, onClose, onEdit, onDelete, onView }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'absolute', right: 0, top: '110%', zIndex: 100,
        background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14,
        padding: 6, minWidth: 160, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}
    >
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, marginBottom: 2 }} onClick={() => { onView(cls); onClose(); }}><Eye size={14} /> View Attendees</button>
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, marginBottom: 2 }} onClick={() => { onEdit(cls); onClose(); }}><Edit size={14} /> Edit Class</button>
      <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, background: 'var(--danger-surface)', color: 'var(--danger)', border: 'none' }} onClick={() => { onDelete(cls.id); onClose(); }}><Trash2 size={14} /> Delete Class</button>
    </motion.div>
  );
}

export default function Classes() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [viewingClass, setViewingClass] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  function handleAdd(form) {
    setClasses(prev => [...prev, { ...form, id: Date.now(), booked: 0 }]);
  }

  function handleEdit(form) {
    setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...form } : c));
    setEditingClass(null);
  }

  function handleDelete(id) {
    setClasses(prev => prev.filter(c => c.id !== id));
  }

  const typeColor = type => ({
    Cardio: { bg: 'var(--danger-surface)', color: 'var(--danger)' },
    Strength: { bg: 'var(--primary-surface)', color: 'var(--primary)' },
    Flexibility: { bg: 'var(--info-surface)', color: 'var(--info)' },
    Mixed: { bg: 'rgba(168,85,247,0.1)', color: '#A855F7' },
    Yoga: { bg: 'var(--success-surface)', color: 'var(--success)' },
    Boxing: { bg: 'var(--danger-surface)', color: 'var(--danger)' },
    Cycling: { bg: 'var(--warning-surface)', color: 'var(--warning)' },
  }[type] || { bg: 'var(--surface-3)', color: 'var(--text-2)' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Today's Schedule</h3>
          <p className="text-faint text-sm">Manage class bookings and capacity</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Class
        </motion.button>
      </div>

      <div className="grid-3">
        {classes.map((c, i) => {
          const isFull = c.booked >= c.capacity;
          const fillPct = Math.min((c.booked / c.capacity) * 100, 100);
          const tc = typeColor(c.type);
          return (
            <motion.div
              key={c.id}
              className="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{ position: 'relative' }}
            >
              <div className="flex justify-between items-start" style={{ marginBottom: 16 }}>
                <div>
                  <span className="badge" style={{ marginBottom: 8, background: tc.bg, color: tc.color }}>{c.type}</span>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.name}</h4>
                  <div className="text-muted text-sm" style={{ marginTop: 4 }}>with {c.instructor}</div>
                </div>
                <div style={{ position: 'relative' }}>
                  <button className="btn btn-ghost btn-icon btn-sm text-faint" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}>
                    <MoreHorizontal size={16} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === c.id && (
                      <ClassMenu
                        cls={c}
                        onClose={() => setOpenMenuId(null)}
                        onEdit={setEditingClass}
                        onDelete={handleDelete}
                        onView={setViewingClass}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-3" style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-primary" /> {c.time} ({c.duration})
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm" style={{ marginBottom: 6 }}>
                    <span className="flex items-center gap-2"><Users size={14} className="text-info" /> Capacity</span>
                    <span style={{ fontWeight: 600, color: isFull ? 'var(--danger)' : 'var(--text-1)' }}>{c.booked} / {c.capacity}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPct}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 + 0.3 }}
                      style={{ height: '100%', background: isFull ? 'var(--danger)' : 'var(--success)', borderRadius: 3, boxShadow: isFull ? '0 0 8px rgba(239,68,68,0.6)' : '0 0 8px rgba(16,185,129,0.6)' }}
                    />
                  </div>
                </div>
              </div>

              {isFull && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <span className="badge badge-expired">Class Full</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && <ClassModal onClose={() => setShowAddModal(false)} onSave={handleAdd} />}
        {editingClass && <ClassModal onClose={() => setEditingClass(null)} onSave={handleEdit} existing={editingClass} />}
        {viewingClass && <AttendeesModal cls={viewingClass} onClose={() => setViewingClass(null)} />}
      </AnimatePresence>
    </div>
  );
}

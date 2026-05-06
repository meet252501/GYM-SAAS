import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MoreHorizontal, X, User, Mail, Phone, CreditCard, Calendar, Edit, Trash2 } from 'lucide-react';
import { MOCK_MEMBERS } from '../../data/mockData';
import { StatusBadge, PlanBadge, DaysLeftBar } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';

// ─── Add Member Modal ───────────────────────────────────────
function AddMemberModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', plan: 'basic', status: 'trial' });
  const [saving, setSaving] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName || !form.email) return;
    setSaving(true);
    setTimeout(() => {
      onAdd(form);
      setSaving(false);
      onClose();
    }, 800);
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
        style={{ maxWidth: 480 }}
      >
        <div className="modal-header">
          <h3 className="modal-title">Add New Member</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><User size={12} style={{ display: 'inline', marginRight: 4 }} />First Name *</label>
              <input className="form-input" placeholder="Alex" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Johnson" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email *</label>
            <input className="form-input" type="email" placeholder="alex@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>

          <div className="form-group">
            <label className="form-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Phone</label>
            <input className="form-input" type="tel" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />Plan</label>
              <select className="form-select" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="elite">Elite</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <Plus size={16} />}
              {saving ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Member Action Menu ─────────────────────────────────────
function MemberMenu({ member, onClose, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      style={{
        position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 100,
        background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14,
        padding: 6, minWidth: 160, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}
    >
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, marginBottom: 2 }} onClick={onClose}>
        <Edit size={15} /> Edit Member
      </button>
      <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, marginBottom: 2 }} onClick={onClose}>
        <Calendar size={15} /> View History
      </button>
      <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 10, background: 'var(--danger-surface)', color: 'var(--danger)', border: 'none' }} onClick={() => { onDelete(member.id); onClose(); }}>
        <Trash2 size={15} /> Remove Member
      </button>
    </motion.div>
  );
}

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [extraMembers, setExtraMembers] = useState([]);

  const allMembers = [
    ...MOCK_MEMBERS.map(m => ({
      id: m._id,
      name: `${m.firstName} ${m.lastName}`,
      email: m.email,
      status: m.status,
      plan: m.membershipPlan,
      expiryDate: m.membershipExpiry,
      lastVisit: m.joinDate ? new Date(m.joinDate).toDateString() : 'N/A'
    })),
    ...extraMembers
  ];

  const filtered = allMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  function handleAdd(form) {
    setExtraMembers(prev => [...prev, {
      id: `new-${Date.now()}`,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      status: form.status,
      plan: form.plan,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastVisit: 'Just joined'
    }]);
  }

  function handleDelete(id) {
    setExtraMembers(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header Actions */}
      <div className="flex justify-between items-center flex-wrap" style={{ gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 280 }}>
          <div className="input-wrapper" style={{ flex: 1, maxWidth: 320 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="input-wrapper">
            <Filter className="input-icon" size={16} />
            <select
              className="form-select"
              style={{ paddingLeft: '2.5rem', width: 140 }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Add Member
        </motion.button>
      </div>

      {/* Count badge */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
        Showing <strong style={{ color: 'var(--text-1)' }}>{filtered.length}</strong> members
      </div>

      {/* Members Table */}
      <motion.div
        className="card table-wrapper"
        style={{ padding: 0, overflow: 'hidden' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Time Remaining</th>
              <th>Last Visit</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(member => (
              <tr key={member.id} style={{ position: 'relative' }}>
                <td>
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size="md" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{member.name}</div>
                      <div className="text-faint" style={{ fontSize: '0.8rem' }}>{member.email}</div>
                    </div>
                  </div>
                </td>
                <td><StatusBadge status={member.status} /></td>
                <td><PlanBadge plan={member.plan} /></td>
                <td>
                  <div style={{ width: 120 }}>
                    <DaysLeftBar expiry={member.expiryDate} />
                  </div>
                </td>
                <td className="text-muted" style={{ fontSize: '0.85rem' }}>{member.lastVisit}</td>
                <td style={{ position: 'relative' }}>
                  <button
                    className="btn btn-ghost btn-icon btn-sm text-faint"
                    onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  <AnimatePresence>
                    {openMenuId === member.id && (
                      <MemberMenu
                        member={member}
                        onClose={() => setOpenMenuId(null)}
                        onDelete={handleDelete}
                      />
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <Search className="empty-icon" />
                    <div className="empty-title">No members found</div>
                    <div className="empty-desc">Try adjusting your search or filters.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showAddModal && <AddMemberModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}

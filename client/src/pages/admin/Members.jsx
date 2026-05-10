import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Filter, MoreHorizontal, Users, Calendar, 
  Edit, Trash2, Download, RefreshCw, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { membersApi, membershipApi } from '../../api';
import { StatusBadge, PlanBadge, DaysLeftBar } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

// ─── Add Member Modal ───────────────────────────────────────
function AddMemberModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({ 
    firstName: '', lastName: '', email: '', phone: '', 
    planId: '', gender: 'male' 
  });
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isOpen) {
      const timer = setTimeout(() => {
        if (mounted) {
          setForm({ 
            firstName: '', lastName: '', email: '', phone: '', 
            planId: '', gender: 'male' 
          });
        }
      }, 0);
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    
    const timer2 = setTimeout(() => {
      if (mounted) {
        setLoadingPlans(true);
        membershipApi.getPlans()
          .then(res => {
            if (mounted) setPlans(res.data.data || []);
          })
          .catch(() => toast.error("Failed to load plans"))
          .finally(() => {
            if (mounted) setLoadingPlans(false);
          });
      }
    }, 0);
      
    return () => { 
      mounted = false; 
      clearTimeout(timer2);
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || !form.planId) {
      return toast.error("Please fill all required fields");
    }
    
    setSaving(true);
    try {
      await membersApi.create(form);
      toast.success('Member enrolled successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Enrollment">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>FIRST NAME</label>
            <input 
              className="form-input" 
              placeholder="e.g. John" 
              value={form.firstName} 
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
              required 
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>LAST NAME</label>
            <input 
              className="form-input" 
              placeholder="e.g. Doe" 
              value={form.lastName} 
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
              required 
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>EMAIL ADDRESS</label>
          <input 
            className="form-input" 
            type="email" 
            placeholder="john.doe@example.com" 
            value={form.email} 
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
            required 
            style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>PHONE</label>
            <input 
              className="form-input" 
              type="tel" 
              placeholder="+91 00000 00000" 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>GENDER</label>
            <select 
              className="form-select" 
              value={form.gender} 
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>MEMBERSHIP PLAN</label>
          <select 
            className="form-select" 
            value={form.planId} 
            onChange={e => setForm(f => ({ ...f, planId: e.target.value }))}
            required
            disabled={loadingPlans}
            style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
          >
            <option value="">{loadingPlans ? 'Fetching plans...' : 'Select a membership level'}</option>
            {plans.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} — ₹{p.price} ({p.duration.value} {p.duration.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} style={{ flex: 1, borderRadius: 14 }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2, borderRadius: 14, boxShadow: '0 8px 20px rgba(var(--primary-rgb), 0.3)' }}>
            {saving ? <RefreshCw className="animate-spin" size={16} /> : <UserCheck size={16} />}
            {saving ? 'PROCESSING...' : 'CONFIRM ENROLLMENT'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Member Action Menu ─────────────────────────────────────
function MemberMenu({ member, onClose, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="glass-panel"
      style={{
        position: 'absolute', right: 0, top: '100%', marginTop: 8, zIndex: 100,
        borderRadius: 16, padding: 8, minWidth: 200, border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <button className="dropdown-item" style={{ borderRadius: 10 }} onClick={() => { toast.success("Accessing profile..."); onClose(); }}>
        <Edit size={14} /> Profile Settings
      </button>
      <button className="dropdown-item" style={{ borderRadius: 10 }} onClick={() => { toast.success("Loading logs..."); onClose(); }}>
        <Calendar size={14} /> Attendance History
      </button>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '6px 0' }} />
      <button className="dropdown-item text-danger" style={{ borderRadius: 10 }} onClick={() => { onDelete(member.id); onClose(); }}>
        <Trash2 size={14} /> Terminate Access
      </button>
    </motion.div>
  );
}

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await membersApi.getAll({ 
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined 
      });
      const data = res.data.data || [];
      const mapped = data.map(m => ({
        id: m._id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        phone: m.phone,
        status: m.membershipStatus || 'trial',
        plan: m.currentMembershipId?.planName || 'No Plan',
        expiryDate: m.membershipExpiry,
        memberId: m.memberId || 'GF-0000',
        accessPin: m.accessPin || '----',
        avatar: m.photo
      }));
      setMembers(mapped);
    } catch {
      toast.error('Network error. Failed to sync members.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [fetchMembers]);

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to terminate this membership access?')) return;
    try {
      await membersApi.delete(id);
      toast.success('Access terminated');
      fetchMembers();
    } catch {
      toast.error('System error. Termination failed.');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <CyberMatrix opacity={0.03} />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}
      >
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.4rem', fontWeight: 900, background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.02em' }}>
            Member Directory
          </h1>
          <p style={{ color: 'var(--text-3)', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={14} color="var(--primary)" /> Total Active Workforce: {members.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" style={{ borderRadius: 16, padding: '10px 20px', border: '1px solid rgba(255,255,255,0.05)' }} onClick={() => toast.success("Data compiled for export")}>
            <Download size={18} /> EXPORT CSV
          </button>
          <button className="btn btn-primary" style={{ borderRadius: 16, padding: '10px 24px', boxShadow: '0 8px 25px rgba(var(--primary-rgb), 0.25)' }} onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> NEW ENROLLMENT
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: 24, borderRadius: 32 }}>
        {/* Filters and Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flex: 1, minWidth: 300 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="Search database by name, ID or electronic mail..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: 48, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Filter style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)' }} size={18} />
              <select
                className="form-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{ paddingLeft: 48, borderRadius: 18, width: 180, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <option value="all">ALL ENTITIES</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="trial">PROVISIONAL</option>
                <option value="expired">EXPIRED</option>
                <option value="suspended">FLAGGED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Table Implementation */}
        <div className="table-responsive" style={{ border: 'none' }}>
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 20px' }}>IDENTIFIER</th>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>STATUS</th>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ACCESS LEVEL</th>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>EXPIRATION</th>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CONTACT</th>
                <th style={{ background: 'transparent', color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PIN</th>
                <th style={{ background: 'transparent', width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: '4px 0' }}>
                      <div className="skeleton" style={{ height: 72, width: '100%', borderRadius: 20 }} />
                    </td>
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '80px 0', textAlign: 'center' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Users size={64} style={{ margin: '0 auto 20px', color: 'rgba(255,255,255,0.05)' }} />
                      <h3 style={{ color: 'var(--text-2)', fontSize: '1.2rem', fontWeight: 800 }}>DATABASE EMPTY</h3>
                      <p style={{ color: 'var(--text-4)', fontSize: '0.9rem' }}>No records match your current terminal filters.</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="premium-card-hover"
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
                  >
                    <td style={{ border: 'none', borderRadius: '20px 0 0 20px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ position: 'relative' }}>
                          <Avatar name={member.name} src={member.avatar} size="md" />
                          {member.status === 'active' && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: 'var(--success)', border: '2px solid var(--surface)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{member.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>{member.memberId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ border: 'none' }}><StatusBadge status={member.status} /></td>
                    <td style={{ border: 'none' }}><PlanBadge plan={member.plan} /></td>
                    <td style={{ border: 'none' }}>
                      <div style={{ width: 140 }}>
                        <DaysLeftBar expiry={member.expiryDate} />
                      </div>
                    </td>
                    <td style={{ border: 'none' }}>
                      <div style={{ fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{member.phone || 'NO SECURE LINE'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontWeight: 600 }}>{member.email}</div>
                      </div>
                    </td>
                    <td style={{ border: 'none' }}>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 900, 
                        color: 'var(--primary)', 
                        background: 'rgba(var(--primary-rgb), 0.1)', 
                        padding: '4px 10px', 
                        borderRadius: 8,
                        display: 'inline-block',
                        letterSpacing: '0.1em'
                      }}>
                        {member.accessPin}
                      </div>
                    </td>
                    <td style={{ border: 'none', borderRadius: '0 20px 20px 0', position: 'relative', textAlign: 'right', paddingRight: 20 }}>
                      <button
                        className="btn-icon"
                        style={{ color: 'var(--text-4)', background: 'rgba(255,255,255,0.03)', borderRadius: 12, width: 36, height: 36 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === member.id ? null : member.id);
                        }}
                      >
                        <MoreHorizontal size={18} />
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
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchMembers} 
      />
    </motion.div>
    </div>
  );
}

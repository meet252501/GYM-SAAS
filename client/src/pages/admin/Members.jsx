import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Filter, Users, 
  Edit, Trash2, Download, Dumbbell, Zap, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema } from '../../utils/validation';
import { membersApi, membershipApi, workoutsApi } from '../../api';
import { StatusBadge, PlanBadge, DaysLeftBar } from '../../components/ui/Badges';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

// ─── Add Member Modal ───────────────────────────────────────
function AddMemberModal({ isOpen, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', planId: '', gender: 'male' }
  });
  
  const [plans, setPlans] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      membershipApi.getPlans()
        .then(res => setPlans(res.data.data || []))
        .catch(() => toast.error("Failed to load plans"));
    } else {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await membersApi.create(data);
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
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>FIRST NAME</label>
            <input 
              className={`form-input ${errors.firstName ? 'border-danger' : ''}`} 
              placeholder="e.g. John" 
              {...register('firstName')}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
            {errors.firstName && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>{errors.firstName.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>LAST NAME</label>
            <input 
              className={`form-input ${errors.lastName ? 'border-danger' : ''}`}
              placeholder="e.g. Doe" 
              {...register('lastName')}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
            {errors.lastName && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>{errors.lastName.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>EMAIL ADDRESS</label>
          <input 
            className={`form-input ${errors.email ? 'border-danger' : ''}`}
            type="email" 
            placeholder="john.doe@example.com" 
            {...register('email')}
            style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
          />
          {errors.email && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>{errors.email.message}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>PHONE</label>
            <input 
              className={`form-input ${errors.phone ? 'border-danger' : ''}`}
              type="tel" 
              placeholder="+91 00000 00000" 
              {...register('phone')}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            />
            {errors.phone && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>{errors.phone.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>GENDER</label>
            <select 
              className="form-select" 
              {...register('gender')}
              style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
            >
              <option value="male" style={{ background: '#111', color: '#fff' }}>Male</option>
              <option value="female" style={{ background: '#111', color: '#fff' }}>Female</option>
              <option value="other" style={{ background: '#111', color: '#fff' }}>Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>MEMBERSHIP PLAN</label>
          <select 
            className={`form-select ${errors.planId ? 'border-danger' : ''}`}
            {...register('planId')}
            style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}
          >
            <option value="" style={{ background: '#111', color: '#fff' }}>Select Plan...</option>
            {plans.map(p => (
              <option key={p._id} value={p._id} style={{ background: '#111', color: '#fff' }}>{p.name} - ₹{p.price}</option>
            ))}
          </select>
          {errors.planId && <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 700 }}>{errors.planId.message}</span>}
        </div>

        <button className="btn-primary" style={{ marginTop: 10, padding: 16, borderRadius: 16, fontWeight: 900 }} disabled={saving}>
          {saving ? 'PROCESSING...' : 'INITIALIZE ENROLLMENT'}
        </button>
      </form>
    </Modal>
  );
}

// ─── Assign Program Modal ──────────────────────────────────
function AssignProgramModal({ isOpen, onClose, member }) {
  const [programs, setPrograms] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState({ source: 'coach', programId: '' });

  useEffect(() => {
    if (isOpen) {
      workoutsApi.getPrograms()
        .then(res => setPrograms(res.data.data || []));
    }
  }, [isOpen]);

  const handleAssign = async () => {
    if (selectedProtocol.source === 'coach' && !selectedProtocol.programId) {
      return toast.error("Please select a training program");
    }
    setSaving(true);
    try {
      await membersApi.assignProtocol(member.id, selectedProtocol);
      toast.success("Protocol synchronized successfully");
      onClose();
    } catch {
      toast.error("Deployment failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Protocol Assignment: ${member?.name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '10px 0' }}>
         <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>INTELLIGENCE SOURCE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
               {[
                 { id: 'ai', label: 'NEURAL AI', icon: Zap },
                 { id: 'coach', label: 'COMMANDER', icon: Dumbbell }
               ].map(s => (
                 <button key={s.id} onClick={() => setSelectedProtocol(p => ({ ...p, source: s.id }))}
                   style={{ 
                     padding: 16, borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer',
                     background: selectedProtocol.source === s.id ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                     color: selectedProtocol.source === s.id ? 'black' : 'white',
                     fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                     transition: '0.2s'
                   }}>
                    <s.icon size={16} /> {s.label}
                 </button>
               ))}
            </div>
         </div>

         {selectedProtocol.source === 'coach' && (
           <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)' }}>SELECT PROGRAM MATRIX</label>
              <select className="form-select" style={{ borderRadius: 16, background: 'rgba(255,255,255,0.02)' }}
                value={selectedProtocol.programId} onChange={e => setSelectedProtocol(p => ({ ...p, programId: e.target.value }))}>
                <option value="">-- Deployment Matrix --</option>
                {programs.map(p => <option key={p._id} value={p._id}>{p.name} ({p.difficulty.toUpperCase()})</option>)}
              </select>
           </div>
         )}

         <div className="glass-card-premium" style={{ padding: 20, borderRadius: 20, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#60a5fa' }}>
               <Info size={16} />
               <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>The selected protocol will be instantly visible in the member's biometric dashboard.</div>
            </div>
         </div>

         <button className="btn-primary" style={{ padding: 16, borderRadius: 16, fontWeight: 900 }} disabled={saving} onClick={handleAssign}>
            {saving ? 'SYNCHRONIZING...' : 'AUTHORIZE DEPLOYMENT'}
         </button>
      </div>
    </Modal>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await membersApi.getAll({ 
        search: searchTerm, 
        status: filterStatus === 'all' ? undefined : filterStatus 
      });
      const mapped = res.data.data.map(m => ({
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

  const handleAssignClick = (member) => {
    setSelectedMember(member);
    setIsAssignModalOpen(true);
  };

  const exportToCSV = () => {
    if (members.length === 0) return toast.error("No data to export");
    
    const headers = ["ID", "Name", "Email", "Phone", "Status", "Plan", "Expiry"];
    const rows = members.map(m => [
      `"${m.memberId}"`,
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.phone || 'N/A'}"`,
      `"${m.status.toUpperCase()}"`,
      `"${m.plan}"`,
      `"${m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gymflow_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Member workforce data exported");
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
          <button className="btn btn-ghost" style={{ borderRadius: 16, padding: '10px 20px', border: '1px solid rgba(255,255,255,0.05)' }} onClick={exportToCSV}>
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
                <option value="all" style={{ background: '#111', color: '#fff' }}>ALL ENTITIES</option>
                <option value="active" style={{ background: '#111', color: '#fff' }}>ACTIVE ONLY</option>
                <option value="trial" style={{ background: '#111', color: '#fff' }}>PROVISIONAL</option>
                <option value="expired" style={{ background: '#111', color: '#fff' }}>EXPIRED</option>
                <option value="suspended" style={{ background: '#111', color: '#fff' }}>FLAGGED</option>
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
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white' }}>{member.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontWeight: 700, letterSpacing: '0.05em' }}>{member.memberId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ border: 'none' }}>
                      <StatusBadge status={member.status} />
                    </td>
                    <td style={{ border: 'none' }}>
                      <PlanBadge plan={member.plan} />
                    </td>
                    <td style={{ border: 'none' }}>
                      <div style={{ minWidth: 140 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>
                          {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '---'}
                        </div>
                        <DaysLeftBar expiryDate={member.expiryDate} />
                      </div>
                    </td>
                    <td style={{ border: 'none' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-2)' }}>{member.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{member.phone}</div>
                       </div>
                    </td>
                    <td style={{ border: 'none' }}>
                       <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: 2 }}>
                          {member.accessPin}
                       </div>
                    </td>
                    <td style={{ border: 'none', borderRadius: '0 20px 20px 0', textAlign: 'right', paddingRight: 20 }}>
                       <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn-icon" title="Edit Biometrics" style={{ color: 'var(--text-3)' }}><Edit size={16} /></button>
                          <button className="btn-icon" title="Assign Protocol" style={{ color: 'var(--primary)' }} onClick={() => handleAssignClick(member)}><Zap size={16} /></button>
                          <button className="btn-icon" title="Terminate Access" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(member.id)}><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </motion.div>

      <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchMembers} />
      {selectedMember && <AssignProgramModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} member={selectedMember} />}
    </div>
  );
}

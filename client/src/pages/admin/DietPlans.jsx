import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Plus, Search, Edit3, Trash2, Droplet, Flame, CheckCircle, X, Users, Info } from 'lucide-react';
import { dietPlanApi, membersApi } from '../../api';

export default function DietPlans() {
  const [search, setSearch] = useState('');
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({ name: '', calories: 2000, protein: 150, carbs: 200, fat: 70 });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignForm, setAssignForm] = useState({ memberId: '' });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await dietPlanApi.getAll();
      if (data.success) {
        setPlans((data.data || []).map(p => ({
          ...p,
          protein: p.macros?.protein || 0,
          carbs: p.macros?.carbs || 0,
          fat: p.macros?.fat || 0,
          assignedTo: p.assignedMembers?.length || 0
        })));
      }
    } catch (error) {
      console.error('Failed to fetch diet plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await membersApi.getAll({ limit: 100 });
      setMembers(res.data.data || []);
    } catch {
      // Error handled by UI or logging
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchMembers, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPlans]);

  const filtered = plans.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function handleSave(e) {
    e.preventDefault();
    try {
      const planData = {
        name: form.name,
        calories: form.calories,
        macros: {
          protein: form.protein,
          carbs: form.carbs,
          fat: form.fat
        }
      };

      if (editingPlan) {
        const { data } = await dietPlanApi.update(editingPlan._id, planData);
        if (data.success) {
          setToast('Diet plan updated successfully');
          fetchPlans();
        }
      } else {
        const { data } = await dietPlanApi.create(planData);
        if (data.success) {
          setToast('Diet plan created successfully');
          fetchPlans();
        }
      }
      setIsModalOpen(false);
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to save diet plan:', error);
    }
  }

  function openModal(plan = null) {
    if (plan) {
      setEditingPlan(plan);
      setForm(plan);
    } else {
      setEditingPlan(null);
      setForm({ name: '', calories: 2000, protein: 150, carbs: 200, fat: 70 });
    }
    setIsModalOpen(true);
  }

  async function handleAssign(e) {
    e.preventDefault();
    try {
      const { data } = await dietPlanApi.assign(selectedPlan._id, { memberIds: [assignForm.memberId] });
      if (data.success) {
        setToast('Diet plan assigned successfully');
        setIsAssignModalOpen(false);
        fetchPlans();
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Assignment failed:', error);
    }
  }

  async function handleDelete(id) {
    try {
      const { data } = await dietPlanApi.delete(id);
      if (data.success) {
        setToast('Diet plan deleted');
        fetchPlans();
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Failed to delete diet plan:', error);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ position: 'fixed', top: 80, right: 24, zIndex: 100, background: 'var(--success)', color: 'white', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}
          >
            <CheckCircle size={18} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>Diet & Nutrition Plans</h1>
          <p className="text-faint">Create and assign meal plans to members based on their goals.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Create New Plan
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="input-wrapper" style={{ width: '300px' }}>
            <Search className="input-icon" size={16} />
            <input type="text" className="form-input" placeholder="Search diet plans..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="grid-3">
          <AnimatePresence>
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <span className="spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>
                No diet plans found.
              </div>
            ) : filtered.map((plan, i) => (
              <motion.div 
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex', flexDirection: 'column', gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Utensils size={20} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openModal(plan)}><Edit3 size={16} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(plan._id)}><Trash2 size={16} /></button>
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>{plan.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Assigned to {plan.assignedTo} members</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={12} color="#F59E0B" /> Calories</div>
                    <div style={{ fontWeight: 700 }}>{plan.calories} kcal</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Protein</div>
                    <div style={{ fontWeight: 700 }}>{plan.protein}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Carbs</div>
                    <div style={{ fontWeight: 700 }}>{plan.carbs}g</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '4px' }}><Droplet size={12} color="#3B82F6" /> Fats</div>
                    <div style={{ fontWeight: 700 }}>{plan.fat}g</div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsAssignModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  <Users size={14} /> Assign to Member
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="modal-header">
                <h2>{editingPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Plan Name</label>
                  <input type="text" className="form-input" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Keto Shred" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Calories (kcal)</label>
                    <input type="number" className="form-input" required value={form.calories} onChange={e => setForm({...form, calories: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input type="number" className="form-input" required value={form.protein} onChange={e => setForm({...form, protein: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Carbs (g)</label>
                    <input type="number" className="form-input" required value={form.carbs} onChange={e => setForm({...form, carbs: parseInt(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fat (g)</label>
                    <input type="number" className="form-input" required value={form.fat} onChange={e => setForm({...form, fat: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="modal-footer" style={{ marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingPlan ? 'Save Changes' : 'Create Plan'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
            <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>Assign {selectedPlan?.name}</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setIsAssignModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAssign} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Select Member</label>
                  <select 
                    className="form-select" 
                    required
                    value={assignForm.memberId}
                    onChange={e => setAssignForm({ memberId: e.target.value })}
                  >
                    <option value="">-- Select Member --</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.memberId})</option>
                    ))}
                  </select>
                </div>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
                  <Info className="text-primary flex-shrink-0" size={18} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>This will link the nutritional plan to the member's profile for tracking.</p>
                </div>
                <div className="modal-footer" style={{ marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Assignment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

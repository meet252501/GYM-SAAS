import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { programSchema } from '../../utils/validation';
import { 
  Plus, Search, Edit2, Dumbbell, Calendar, Users, 
  Filter 
} from 'lucide-react';
import { workoutsApi, membersApi } from '../../api';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

export default function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [search, setSearch] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(programSchema),
    defaultValues: { name: '', description: '', difficulty: 'intermediate', durationWeeks: 4, daysPerWeek: 3 }
  });

  const [assignForm, setAssignForm] = useState({ memberId: '', startDate: new Date().toISOString().split('T')[0] });
  const [members, setMembers] = useState([]);

  const fetchPrograms = async () => {
    try {
      const res = await workoutsApi.getPrograms();
      setPrograms(res.data.data || []);
    } catch { /* Error handled */ } finally { setLoading(false); }
  };

  const fetchMembers = async () => {
    try {
      const res = await membersApi.getAll({ limit: 100 });
      setMembers(res.data.data || []);
    } catch { /* Error handled */ }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrograms();
    fetchMembers();
  }, []);

  const onCreate = async (data) => {
    try {
      await workoutsApi.createProgram({ ...data, tags: [], exercises: [] });
      toast.success('Program created successfully');
      setIsModalOpen(false);
      reset();
      fetchPrograms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create program');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await workoutsApi.assignProgram(selectedProgram._id, assignForm);
      toast.success(`Assigned to member`);
      setIsAssignModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const filteredPrograms = programs.filter(p => 
    (p.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.difficulty?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="page-container relative">
      <CyberMatrix opacity={0.03} />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-glow">Workout Programs</h1>
          <p className="text-faint">Create and manage training protocols</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Create Program
        </button>
      </div>

      <div className="card mb-6 relative z-10">
        <div className="flex gap-4 items-center">
          <div className="input-wrapper flex-1">
            <Search className="input-icon" size={18} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search programs by title or level..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost flex items-center gap-2">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="card skeleton-card" style={{ height: 200 }} />
          ))
        ) : filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <motion.div 
              key={program._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card group hover:border-primary/40 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  <Dumbbell size={24} />
                </div>
                <div className={`badge badge-${program.difficulty}`}>
                  {program.difficulty}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2">{program.name}</h3>
              <p className="text-faint text-sm line-clamp-2 mb-4">{program.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-faint">
                  <Calendar size={14} /> {program.durationWeeks} Weeks
                </div>
                <div className="flex items-center gap-2 text-xs text-faint">
                  <Users size={14} /> {program.daysPerWeek} Days/Week
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedProgram(program);
                    setIsAssignModalOpen(true);
                  }}
                  className="btn btn-primary flex-1 py-2 text-sm"
                >
                  Assign Member
                </button>
                <button className="btn btn-ghost p-2">
                  <Edit2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="mb-4 opacity-20"><Dumbbell size={64} style={{ margin: '0 auto' }} /></div>
            <h3 className="text-xl font-bold text-faint">No programs found</h3>
            <p className="text-faint">Start by creating your first workout protocol</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Program"
      >
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Program Title</label>
            <input 
              className={`form-input ${errors.name ? 'border-danger' : ''}`} 
              placeholder="e.g. 5x5 Strength Protocol"
              {...register('name')}
            />
            {errors.name && <span className="text-danger text-xs font-bold">{errors.name.message}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows={3}
              placeholder="Overview of the program goals..."
              {...register('description')}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" {...register('difficulty')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Weeks</label>
              <input 
                type="number" 
                className={`form-input ${errors.durationWeeks ? 'border-danger' : ''}`} 
                {...register('durationWeeks', { valueAsNumber: true })}
              />
              {errors.durationWeeks && <span className="text-danger text-xs font-bold">{errors.durationWeeks.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Days/Wk</label>
              <input 
                type="number" 
                className={`form-input ${errors.daysPerWeek ? 'border-danger' : ''}`} 
                {...register('daysPerWeek', { valueAsNumber: true })}
              />
              {errors.daysPerWeek && <span className="text-danger text-xs font-bold">{errors.daysPerWeek.message}</span>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1">Authorize Protocol</button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Protocol"
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Target Member</label>
            <select 
              className="form-select" 
              required
              value={assignForm.memberId}
              onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}
            >
              <option value="">Select Member...</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Deployment Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={assignForm.startDate}
              onChange={e => setAssignForm({...assignForm, startDate: e.target.value})}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn btn-ghost flex-1">Abort</button>
            <button type="submit" className="btn btn-primary flex-1">Sync Neural Link</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

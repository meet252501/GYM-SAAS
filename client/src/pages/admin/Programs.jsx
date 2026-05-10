import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Edit2, Dumbbell, Calendar, Users, 
  Filter, Info 
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
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'intermediate',
    durationWeeks: 4,
    daysPerWeek: 3,
    tags: [],
    exercises: [] // Array of { exerciseId, exerciseName, sets, reps, restSeconds }
  });

  const [allExercises, setAllExercises] = useState([]);

  const [assignForm, setAssignForm] = useState({
    memberId: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [members, setMembers] = useState([]);

  const fetchPrograms = async () => {
    try {
      const res = await workoutsApi.getPrograms();
      setPrograms(res.data.data || []);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await membersApi.getAll({ limit: 100 });
      setMembers(res.data.data || []);
    } catch {
      // Error handled
    }
  };

  const fetchExercises = async () => {
    try {
      const res = await workoutsApi.getExercises();
      setAllExercises(res.data.data || []);
    } catch {
      // Error handled
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrograms();
      fetchMembers();
      fetchExercises();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await workoutsApi.createProgram(formData);
      toast.success('Program created successfully');
      setIsModalOpen(false);
      fetchPrograms();
      setFormData({ name: '', description: '', difficulty: 'intermediate', durationWeeks: 4, daysPerWeek: 3, tags: [] });
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
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.difficulty.toLowerCase().includes(search.toLowerCase())
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
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Program Title</label>
            <input 
              className="form-input" 
              required 
              placeholder="e.g. 5x5 Strength Protocol"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-input" 
              rows={3}
              placeholder="Overview of the program goals..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Level</label>
              <select 
                className="form-select"
                value={formData.difficulty}
                onChange={e => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Weeks</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.durationWeeks}
                onChange={e => setFormData({...formData, durationWeeks: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Days/Wk</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.daysPerWeek}
                onChange={e => setFormData({...formData, daysPerWeek: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Add Exercises to Protocol</label>
            <div className="flex gap-2 mb-3">
              <select 
                className="form-select flex-1"
                onChange={(e) => {
                  const ex = allExercises.find(x => x._id === e.target.value);
                  if (ex && !formData.exercises.find(item => item.exerciseId === ex._id)) {
                    setFormData({
                      ...formData,
                      exercises: [...formData.exercises, { 
                        exerciseId: ex._id, 
                        exerciseName: ex.name, 
                        sets: 3, 
                        reps: '12', 
                        restSeconds: 90 
                      }]
                    });
                  }
                  e.target.value = "";
                }}
              >
                <option value="">-- Select Exercise to Add --</option>
                {allExercises.map(ex => (
                  <option key={ex._id} value={ex._id}>{ex.name} ({ex.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.exercises.map((ex, idx) => (
                <div key={ex.exerciseId} className="flex flex-col gap-2 p-3 bg-surface-3 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{ex.exerciseName}</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData({
                        ...formData, 
                        exercises: formData.exercises.filter((_, i) => i !== idx)
                      })}
                      className="text-error hover:opacity-80 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-faint uppercase">Sets</span>
                      <input 
                        type="number" 
                        className="form-input py-1 px-2 text-xs" 
                        value={ex.sets}
                        onChange={e => {
                          const newEx = [...formData.exercises];
                          newEx[idx].sets = parseInt(e.target.value);
                          setFormData({...formData, exercises: newEx});
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-faint uppercase">Reps</span>
                      <input 
                        type="text" 
                        className="form-input py-1 px-2 text-xs" 
                        value={ex.reps}
                        onChange={e => {
                          const newEx = [...formData.exercises];
                          newEx[idx].reps = e.target.value;
                          setFormData({...formData, exercises: newEx});
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-faint uppercase">Rest (s)</span>
                      <input 
                        type="number" 
                        className="form-input py-1 px-2 text-xs" 
                        value={ex.restSeconds}
                        onChange={e => {
                          const newEx = [...formData.exercises];
                          newEx[idx].restSeconds = parseInt(e.target.value);
                          setFormData({...formData, exercises: newEx});
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.exercises.length === 0 && (
                <div className="text-center py-4 text-xs text-faint bg-surface-2 rounded-lg border border-dashed border-border">
                  No exercises added yet
                </div>
              )}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Protocol</button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign ${selectedProgram?.name}`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Select Member</label>
            <select 
              className="form-select" 
              required
              value={assignForm.memberId}
              onChange={e => setAssignForm({...assignForm, memberId: e.target.value})}
            >
              <option value="">-- Select Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.firstName} {m.lastName} ({m.memberId})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              required
              value={assignForm.startDate}
              onChange={e => setAssignForm({...assignForm, startDate: e.target.value})}
            />
          </div>
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3">
            <Info className="text-primary flex-shrink-0" size={20} />
            <p className="text-xs text-faint">Assigning this program will update the member's current training protocol and notify them via the mobile app.</p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Assignment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

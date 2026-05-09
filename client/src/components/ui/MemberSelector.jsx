import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { membersApi } from '../../api';
import Avatar from './Avatar';

export default function MemberSelector({ onSelect, selectedId, placeholder = "Search member..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Selected member display info
  const selectedMember = members.find(m => m._id === selectedId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await membersApi.getAll({ search, limit: 10 });
        setMembers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  return (
    <div className="form-group" style={{ position: 'relative' }} ref={containerRef}>
      <label className="form-label">Member</label>
      
      <div 
        className="form-input" 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', minHeight: 46, padding: '0 16px'
        }}
      >
        {selectedMember ? (
          <div className="flex items-center gap-2">
            <Avatar name={`${selectedMember.firstName} ${selectedMember.lastName}`} size="sm" />
            <span style={{ fontWeight: 600 }}>{selectedMember.firstName} {selectedMember.lastName}</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-3)' }}>{placeholder}</span>
        )}
        <Search size={16} className="text-faint" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 110,
              marginTop: 8, background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
              padding: 8, overflow: 'hidden'
            }}
          >
            <div className="input-wrapper" style={{ marginBottom: 8 }}>
              <Search className="input-icon" size={14} />
              <input 
                autoFocus
                type="text" 
                className="form-input" 
                placeholder="Type name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 34, background: 'var(--surface-1)' }}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loading && members.length === 0 ? (
                <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-3)', fontSize: '0.8rem' }}>Searching...</div>
              ) : members.length > 0 ? (
                members.map(m => (
                  <button
                    key={m._id}
                    onClick={() => {
                      onSelect(m._id);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                      background: selectedId === m._id ? 'var(--primary-surface)' : 'transparent',
                      color: selectedId === m._id ? 'var(--primary)' : 'var(--text-2)',
                      width: '100%', textAlign: 'left', transition: 'var(--transition)'
                    }}
                    onMouseEnter={e => {
                      if (selectedId !== m._id) e.currentTarget.style.background = 'var(--surface-3)';
                    }}
                    onMouseLeave={e => {
                      if (selectedId !== m._id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Avatar name={`${m.firstName} ${m.lastName}`} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.firstName} {m.lastName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.memberId}</div>
                    </div>
                    {selectedId === m._id && <Check size={14} />}
                  </button>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center' }}>
                  <User size={24} className="text-faint" style={{ margin: '0 auto 8px', opacity: 0.2 }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>No members found</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

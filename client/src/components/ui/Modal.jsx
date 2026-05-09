import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20, zIndex: 1000
          }}
        >
          <motion.div
            className="modal"
            style={{ 
              maxWidth, 
              background: 'var(--surface)', 
              borderRadius: 24, 
              width: '100%',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{title}</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ borderRadius: 10 }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-content" style={{ padding: 24 }}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

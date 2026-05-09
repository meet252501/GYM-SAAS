import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';

export default function BadgeCelebrationModal({ isOpen, badge, onClose }) {

  if (!badge) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          
          <motion.div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{ maxWidth: 400, textAlign: 'center', background: 'var(--surface-1)', border: `2px solid ${badge.color || 'var(--primary)'}` }}
          >
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: 16, right: 16, background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
              style={{
                width: 120, height: 120, margin: '0 auto 24px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${badge.color}40, transparent)`,
                border: `4px solid ${badge.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 40px ${badge.color}60`,
                fontSize: '4rem'
              }}
            >
              {badge.icon}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.75rem', fontWeight: 800, color: badge.color, marginBottom: 8 }}>
                New Badge Unlocked!
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 12px' }}>{badge.name}</h2>
              <p style={{ color: 'var(--text-3)', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                {badge.description}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1, background: badge.color, borderColor: badge.color }} onClick={onClose}>
                Awesome!
              </button>
              <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Share2 size={18} /> Share
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

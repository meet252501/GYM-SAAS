import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, ChevronRight, CheckCircle, X } from 'lucide-react';
import { format, addDays } from 'date-fns';

const INITIAL_CLASSES = [
  { id: 1, name: 'HIIT Extreme', instructor: 'Mike Tyson', time: '08:00 AM', duration: '45m', capacity: 20, booked: 18, type: 'Cardio', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', isBookedByUser: true },
  { id: 2, name: 'Powerlifting Basics', instructor: 'Arnold S.', time: '10:30 AM', duration: '60m', capacity: 15, booked: 15, type: 'Strength', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', isBookedByUser: false },
  { id: 3, name: 'Yoga Flow', instructor: 'Elena R.', time: '05:00 PM', duration: '60m', capacity: 25, booked: 12, type: 'Flexibility', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', isBookedByUser: false },
  { id: 4, name: 'Boxing Fundamentals', instructor: 'Floyd M.', time: '07:00 PM', duration: '50m', capacity: 18, booked: 10, type: 'Cardio', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400&q=80', isBookedByUser: false },
];

// ─── Booking Confirmation Modal ──────────────────────────────
function BookingModal({ cls, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  function confirm() {
    setLoading(true);
    setTimeout(() => { onConfirm(); setLoading(false); }, 800);
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
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24,
          padding: 28, width: '90%', maxWidth: 360,
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏋️</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>Confirm Booking</h3>
          <p style={{ color: 'var(--text-3)', margin: 0, fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-1)' }}>{cls.name}</strong><br />
            {cls.time} • {cls.duration} with {cls.instructor}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={confirm}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : <CheckCircle size={16} />}
            {loading ? 'Booking...' : 'Confirm'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Cancel Confirmation ─────────────────────────────────────
function CancelModal({ cls, onConfirm, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 24,
          padding: 28, width: '90%', maxWidth: 340,
          boxShadow: '0 40px 80px rgba(0,0,0,0.7)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem' }}>Cancel Booking?</h3>
          <p style={{ color: 'var(--text-3)', margin: 0, fontSize: '0.85rem' }}>
            Remove your booking for <strong style={{ color: 'var(--text-1)' }}>{cls.name}</strong>?
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Keep it</button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => { onConfirm(); onClose(); }}
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MemberClasses() {
  const [selectedDate, setSelectedDate] = useState(0);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [bookingModal, setBookingModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [toast, setToast] = useState(null);

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleBook(id) {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, isBookedByUser: true, booked: c.booked + 1 } : c));
    showToast('Class booked! See you there 💪');
  }

  function handleCancel(id) {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, isBookedByUser: false, booked: Math.max(0, c.booked - 1) } : c));
    showToast('Booking cancelled.', 'info');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
              background: toast.type === 'success' ? 'var(--success)' : 'var(--surface-3)',
              color: 'white', padding: '10px 20px', borderRadius: 20, zIndex: 200,
              fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
            }}
          >
            {toast.type === 'success' ? '✓ ' : 'ℹ '} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', fontWeight: 800 }}>Book a Class</h2>
        <p className="text-faint">Reserve your spot in advance.</p>
      </div>

      {/* Date Picker */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: 8 }}>
        {dates.map((date, i) => {
          const isSelected = selectedDate === i;
          return (
            <motion.div
              key={i}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSelectedDate(i)}
              style={{
                minWidth: '64px', padding: '12px 8px', borderRadius: '16px',
                background: isSelected ? 'linear-gradient(135deg, var(--primary), #8b5cf6)' : 'var(--surface-2)',
                border: isSelected ? 'none' : '1px solid var(--border)',
                color: isSelected ? 'white' : 'var(--text-2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: 'pointer',
                boxShadow: isSelected ? '0 8px 20px rgba(139,92,246,0.35)' : 'none'
              }}
            >
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8 }}>
                {format(date, 'EEE')}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>
                {format(date, 'd')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Classes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {classes.map((c, i) => {
          const isFull = c.booked >= c.capacity && !c.isBookedByUser;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'var(--surface-2)',
                borderRadius: '22px', overflow: 'hidden',
                border: c.isBookedByUser ? '2px solid var(--success)' : '1px solid var(--border)',
                boxShadow: c.isBookedByUser ? '0 0 24px rgba(16,185,129,0.2)' : '0 8px 24px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              {/* Booked badge */}
              {c.isBookedByUser && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                >
                  <span className="badge" style={{ background: 'var(--success)', color: 'white', boxShadow: '0 0 12px rgba(16,185,129,0.7)' }}>
                    ✓ Booked
                  </span>
                </motion.div>
              )}

              {/* Image */}
              <div style={{ height: '110px', position: 'relative' }}>
                <img src={c.img} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(9,9,11,1), rgba(9,9,11,0))' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 16 }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', color: 'white', marginBottom: 4 }}>{c.type}</span>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white', fontWeight: 800 }}>{c.name}</h3>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="flex items-center gap-2 text-faint text-sm">
                    <Clock size={15} /> {c.time} ({c.duration})
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={15} color={c.booked >= c.capacity ? 'var(--danger)' : 'var(--text-3)'} />
                    <span style={{ color: c.booked >= c.capacity ? 'var(--danger)' : 'var(--text-1)', fontWeight: 600 }}>
                      {c.booked}/{c.capacity}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileTap={!isFull ? { scale: 0.96 } : {}}
                  onClick={() => {
                    if (c.isBookedByUser) setCancelModal(c);
                    else if (!isFull) setBookingModal(c);
                  }}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '14px',
                    background: c.isBookedByUser
                      ? 'rgba(239,68,68,0.1)'
                      : isFull ? 'var(--surface-3)' : 'var(--text-1)',
                    color: c.isBookedByUser ? 'var(--danger)' : isFull ? 'var(--text-3)' : 'var(--bg)',
                    border: c.isBookedByUser ? '1px solid rgba(239,68,68,0.3)' : 'none',
                    fontWeight: 700, cursor: isFull && !c.isBookedByUser ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: '0.95rem'
                  }}
                >
                  {isFull && !c.isBookedByUser
                    ? '🚫 Class Full'
                    : c.isBookedByUser
                    ? <><X size={16} /> Cancel Booking</>
                    : <><ChevronRight size={18} /> Book Now</>}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Booking Confirm Modal */}
      <AnimatePresence>
        {bookingModal && (
          <BookingModal
            cls={bookingModal}
            onClose={() => setBookingModal(null)}
            onConfirm={() => { handleBook(bookingModal.id); setBookingModal(null); }}
          />
        )}
        {cancelModal && (
          <CancelModal
            cls={cancelModal}
            onClose={() => setCancelModal(null)}
            onConfirm={() => handleCancel(cancelModal.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

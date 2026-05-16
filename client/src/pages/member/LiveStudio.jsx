import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle, 
  User, Filter, Loader2, Sparkles
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import CyberMatrix from '../../components/ui/CyberMatrix';
import { classesApi } from '../../api';
import { toast } from 'react-hot-toast';

function BookingModal({ cls, onConfirm, onClose, loading }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(20px)' }}>
        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
        className="glass-card-premium" style={{ width: '100%', maxWidth: 440, padding: 0, textAlign: 'center', borderRadius: 40, overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)' }}>
        
        {/* Modal Header Image */}
        <div style={{ height: 160, position: 'relative' }}>
           <img src={cls.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={cls.name} />
           <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
           <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'var(--primary)', color: 'black', padding: '6px 16px', borderRadius: 12, fontWeight: 900, fontSize: '0.75rem', letterSpacing: 1 }}>{cls.type.toUpperCase()} PROTOCOL</div>
           </div>
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12, color: 'white' }}>Confirm Reservation</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.6 }}>
             Sync with <span style={{ color: 'white', fontWeight: 800 }}>{cls.instructor}</span> for <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{cls.name}</span>.<br />
             Operational window starts at <span style={{ color: 'white', fontWeight: 800 }}>{cls.time}</span>.
          </p>
          
          <div style={{ display: 'flex', gap: 16 }}>
             <button onClick={onClose} className="glass-card-premium" style={{ flex: 1, padding: '20px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>ABORT</button>
             <button onClick={onConfirm} disabled={loading} className="btn-primary" style={{ flex: 2, padding: '20px', borderRadius: 20, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> SECURE SPOT</>}
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MemberClasses() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingCls, setBookingCls] = useState(null);
  const [procLoading, setProcLoading] = useState(false);
  const [filter] = useState('All');

  const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

  const loadClasses = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch sessions for the selected date
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      
      const res = await classesApi.getSessions({ 
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      // Map sessions to UI format
      const sessionData = res.data.data.map(s => ({
        ...s,
        _id: s._id, // This is the sessionId
        name: s.classId?.name || 'Class',
        instructor: s.trainerId?.name || 'Staff',
        time: format(new Date(s.startsAt), 'hh:mm a'),
        duration: `${Math.round((new Date(s.endsAt) - new Date(s.startsAt)) / 60000)}m`,
        capacity: s.capacity,
        booked: s.bookedCount,
        type: s.classId?.category || 'Training',
        img: s.classId?.img || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80',
        isBookedByUser: false // We'll update this if we have a list of user bookings
      }));
      setClasses(sessionData);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClasses();
  }, [loadClasses]);

  const handleBook = async () => {
    if (!bookingCls) return;
    setProcLoading(true);
    try {
      const res = await classesApi.book(bookingCls._id);
      
      if (res.status === 200 || res.status === 201) {
        toast.success("Spot Secured!");
        loadClasses();
        setBookingCls(null);
      } else {
        throw new Error(res.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error("Booking Error:", err);
      const msg = err.response?.data?.message || err.message || "Protocol Interrupted";
      if (err.response) {
        const readableMsg = msg.includes("already booked") ? "You've already secured a spot." : 
                            msg.includes("full") ? "Session capacity reached." : `ERROR: ${msg}`;
        toast.error(readableMsg);
      }
      
      setBookingCls(null);
    } finally {
      setProcLoading(false);
    }
  };

  const filtered = classes.filter(c => filter === 'All' || c.type === filter);

  return (
    <div className="mobile-px-4" style={{ position: 'relative', minHeight: '100vh', padding: '24px 16px 100px' }}>
      <CyberMatrix intensity={0.05} />
      
      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <h1 className="mobile-text-2xl" style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0 }}>Class <span style={{ color: 'var(--primary)' }}>Sync</span></h1>
            <p style={{ color: 'var(--text-3)', fontSize: '1rem', margin: 0 }}>Live group training protocols</p>
          </div>
          <div className="glass-card-premium" style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
             <Filter size={20} />
          </div>
        </header>

        {/* Horizontal Date Picker */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 32 }}>
           {dates.map((d, i) => {
             const active = isSameDay(selectedDate, d);
             return (
               <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => setSelectedDate(d)}
                 style={{ minWidth: 70, padding: '16px 12px', borderRadius: 24, cursor: 'pointer',
                    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                    color: active ? 'black' : 'var(--text-3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.05)',
                   boxShadow: active ? '0 10px 20px var(--primary)33' : 'none',
                   transition: 'all 0.2s'
                 }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>{format(d, 'EEE')}</span>
                 <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>{format(d, 'd')}</span>
               </motion.button>
             );
           })}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             {filtered.map((c, i) => (
               <motion.div key={c._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                 className="glass-card-premium" style={{ padding: 0, borderRadius: 32, overflow: 'hidden', border: c.isBookedByUser ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: '140px 1fr', height: '100%' }}>
                     <div style={{ position: 'relative' }}>
                        <img src={c.img || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 60%, rgba(9,9,11,1) 100%)' }} />
                        {c.isBookedByUser && (
                          <div style={{ position: 'absolute', top: 12, left: 12, background: 'var(--success)', color: 'black', padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
                             <CheckCircle size={10} /> SECURED
                          </div>
                        )}
                     </div>
                     <div className="mobile-p-4" style={{ padding: '24px 32px 24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                           <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{c.type} PROTOCOL</div>
                              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{c.name}</h3>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>{c.time}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-4)', fontWeight: 700 }}>{c.duration}</div>
                           </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', gap: 16 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                                 <User size={14} color="var(--primary)" /> {c.instructor}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                                 <Users size={14} color="var(--primary)" /> {c.booked}/{c.capacity}
                              </div>
                           </div>
                           <button onClick={() => setBookingCls(c)} disabled={c.booked >= c.capacity && !c.isBookedByUser} className={c.isBookedByUser ? "btn-secondary" : "btn-primary"} 
                             style={{ padding: '10px 24px', borderRadius: 16, fontSize: '0.85rem' }}>
                             {c.isBookedByUser ? 'MANAGE' : c.booked >= c.capacity ? 'FULL' : 'BOOK SPOT'}
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
             ))}
          </div>
        )}

        {/* AI Suggestion Box */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-premium mobile-p-4" style={{ marginTop: 40, padding: 32, borderRadius: 32, border: '1px solid rgba(139,92,246,0.3)', background: 'linear-gradient(135deg, rgba(139,92,246,0.05), transparent)' }}>
           <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Sparkles size={24} color="#a78bfa" />
              </div>
              <div>
                 <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 900 }}>AI Smart Recommendation</h4>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                    Based on your low activity yesterday, the <span style={{ color: '#a78bfa', fontWeight: 800 }}>Neural HIIT</span> session at 08:00 AM is optimal for metabolic recovery.
                 </p>
              </div>
           </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {bookingCls && <BookingModal cls={bookingCls} loading={procLoading} onClose={() => setBookingCls(null)} onConfirm={handleBook} />}
      </AnimatePresence>
    </div>
  );
}

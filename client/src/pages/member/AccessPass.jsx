import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import {
  Crown, Star, Zap, Clock,
  Copy, Check, Dumbbell,
  ShieldCheck, Loader2,
  Fingerprint, CheckCircle, X, CalendarCheck, Camera
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { attendanceApi } from '../../api';
import { toast } from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BackButton from '../../components/ui/BackButton';
import BentoCard from '../../components/ui/BentoCard';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const PLAN_CONFIG = {
  Elite:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)',  Icon: Crown, gradient: 'linear-gradient(135deg,#F59E0B,#D97706)' },
  Premium: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.4)',  Icon: Star,  gradient: 'linear-gradient(135deg,#A855F7,#7C3AED)' },
  Basic:   { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)',  Icon: Zap,   gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)' },
  Trial:   { color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  Icon: Zap,   gradient: 'linear-gradient(135deg,#10B981,#059669)' },
};

const getPlan = p => PLAN_CONFIG[p] || PLAN_CONFIG.Basic;

export default function AccessPass() {
  const { user } = useAuthStore();
  const plan = user?.membershipPlan || 'Basic';
  const cfg = getPlan(plan);
  const memberId = user?.memberId || user?._id || 'GF-MEMBER';

  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkinModal, setCheckinModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState('idle');

  // PIN Input State
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await attendanceApi.getMy({ limit: 5 });
        setHistory(data.data || []);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const copyId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    toast.success('Member ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    // If pasting a full 6 digit string
    if (value.length === 6) {
      const split = value.split('');
      setPin(split);
      inputRefs.current[5].focus();
      return;
    }
    newPin[index] = value.slice(-1); // Only take last char if they type multiple
    setPin(newPin);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === 'Enter') {
      submitPin();
    }
  };

  const submitPin = async () => {
    const pinStr = pin.join('');
    if (pinStr.length !== 6) {
      toast.error('Please enter the full 6-digit PIN displayed on the terminal.');
      return;
    }
    try {
      toast.loading('Verifying Identity...');
      await attendanceApi.dynamicCheckin({ pin: pinStr });
      toast.dismiss();
      toast.success('Check-in successful!');
      setPin(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
      const { data } = await attendanceApi.getMy({ limit: 5 });
      setHistory(data.data || []);
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || 'Invalid or expired PIN. Please try again.');
    }
  };

  useEffect(() => {
    if (scanModal) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScanModal(false);
          toast.loading('Verifying QR Code...');
          try {
            await attendanceApi.mark(); // Marking attendance directly for this gym
            toast.dismiss();
            toast.success('Check-in successful via QR!');
            const { data } = await attendanceApi.getMy({ limit: 5 });
            setHistory(data.data || []);
          } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || 'Failed to check-in with this QR code.');
          }
        },
        (error) => {
          // Ignore scanning errors (happens when no code is visible)
        }
      );

      return () => {
        scanner.clear().catch(e => console.log('Failed to clear scanner', e));
      };
    }
  }, [scanModal]);

  return (
    <div className="mobile-px-4" style={{ position: 'relative', minHeight: 'calc(100vh - 152px)', padding: '12px 0 24px 0' }}>
      <CyberMatrix intensity={0.06} />
      
      <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <BackButton />
          <span style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-4)', textTransform: 'uppercase' }}>Identity Protocol</span>
        </div>
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '20px', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Identity Protocol</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '4px' }}>Access and synchronize your neural link</p>
        </motion.div>

        {/* Check-in & Sync Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: '24px' }}>
          <BentoCard style={{ 
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(139,92,246,0.15) 100%)', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            border: '1px solid rgba(245,158,11,0.3)',
            boxShadow: 'inset 0 0 40px rgba(245,158,11,0.05)',
            padding: '24px',
            borderRadius: '24px'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 20px var(--primary)60' }}>
                  <Fingerprint size={24} color="black" />
                </div>
                <div style={{ padding: '6px 12px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', fontSize: '0.65rem', fontWeight: 900, border: '1px solid rgba(16,185,129,0.2)' }}>
                  BIOMETRIC READY
                </div>
              </div>
              <h2 className="mobile-text-xl" style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>Check-in & Sync</h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', maxWidth: '300px', lineHeight: 1.5 }}>Synchronize your neural link and record today's session in the matrix.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCheckinModal(true); setCheckinStatus('idle'); }}
                style={{
                  width: '100%', padding: '18px', borderRadius: '16px', background: 'var(--primary)', color: 'black',
                  fontWeight: 900, fontSize: '1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  boxShadow: '0 8px 32px var(--primary)40', textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                <CheckCircle size={20} /> Mark Attendance
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setScanModal(true)}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-2)',
                  fontWeight: 800, fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                <Camera size={18} /> Scan Terminal QR
              </motion.button>
            </div>
          </BentoCard>
        </motion.div>

        {/* Digital Pass Card (Merged Style) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-premium"
          style={{ 
            borderRadius: '32px', padding: 0, overflow: 'hidden', 
            border: `1px solid ${cfg.border}`,
            boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${cfg.color}15`,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
          }}
        >
          {/* Card Top Branding */}
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '10px', background: cfg.color, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 15px ${cfg.color}60`
              }}>
                <Dumbbell size={20} color="black" />
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '1px' }}>GYMFLOW</span>
            </div>
            <div style={{ 
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
              padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 900,
              textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <cfg.Icon size={12} /> {plan}
            </div>
          </div>

          {/* QR Code Identification */}
          <div style={{ 
            display: 'flex', justifyContent: 'center', paddingTop: '32px', paddingBottom: '8px'
          }}>
            <div style={{
              background: 'white', padding: '16px', borderRadius: '24px', 
              boxShadow: `0 0 30px ${cfg.color}30`,
              border: `2px solid ${cfg.color}40`
            }}>
              <QRCodeSVG 
                value={memberId}
                size={140}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Dynamic PIN Input Section */}
          <div style={{ padding: '40px 24px', textAlign: 'center', position: 'relative' }}>
             <p style={{ marginBottom: '16px', color: 'var(--text-2)', fontWeight: 800, fontSize: '0.85rem' }}>
               LOOK AT TERMINAL SCREEN
             </p>
             <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '0 auto' }}>
               {pin.map((digit, i) => (
                 <input
                   key={i}
                   ref={el => inputRefs.current[i] = el}
                   type="text"
                   inputMode="numeric"
                   pattern="[0-9]*"
                   value={digit}
                   onChange={(e) => handlePinChange(i, e.target.value)}
                   onKeyDown={(e) => handlePinKeyDown(i, e)}
                   style={{
                     width: '45px', height: '56px',
                     background: 'rgba(0,0,0,0.5)',
                     border: `2px solid ${digit ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                     borderRadius: '12px',
                     color: '#fff', fontSize: '1.5rem', fontWeight: 900,
                     textAlign: 'center', outline: 'none',
                     boxShadow: digit ? `0 0 15px ${cfg.color}40` : 'none',
                     transition: 'all 0.2s'
                   }}
                 />
               ))}
             </div>
          </div>

          {/* Member ID (Info Section) */}
          <div style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Member Name</label>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-1)' }}>
                  {user?.firstName} {user?.lastName}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Identity Hash</label>
                <div 
                  onClick={copyId}
                  style={{ fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', color: 'var(--text-3)' }}
                >
                  {memberId.slice(0, 8)}... {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div style={{ 
            padding: '12px 24px', background: cfg.gradient, display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ color: 'black', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>Membership Active</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'black', opacity: 0.5 }} />
              <span style={{ color: 'black', fontSize: '0.7rem', fontWeight: 800 }}>SECURE V3.0</span>
            </div>
          </div>
        </motion.div>

        {/* Verify Action Button */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitPin}
            disabled={pin.join('').length !== 6}
            style={{ 
              width: '100%', padding: '18px', borderRadius: '20px', 
              background: pin.join('').length === 6 ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
              color: pin.join('').length === 6 ? 'black' : 'var(--text-4)',
              border: pin.join('').length === 6 ? 'none' : '1px solid rgba(255,255,255,0.1)', 
              fontWeight: 900, cursor: pin.join('').length === 6 ? 'pointer' : 'not-allowed', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: pin.join('').length === 6 ? '0 8px 24px rgba(245,158,11,0.3)' : 'none', 
              fontSize: '1rem', transition: 'all 0.3s'
            }}
          >
            <ShieldCheck size={20} /> Sync & Check-In
          </motion.button>
        </div>

        {/* History */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Entry Protocol History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>
            ) : history.length === 0 ? (
              <div className="glass-card-premium" style={{ padding: '32px', textAlign: 'center', borderRadius: '24px' }}>
                <p style={{ color: 'var(--text-4)', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>No recent access logs found.</p>
              </div>
            ) : (
              history.map(log => (
                <div key={log._id} className="glass-card-premium" style={{ padding: '16px 20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={20} color="var(--success)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{new Date(log.checkedInAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-4)', marginTop: '2px', textTransform: 'uppercase', fontWeight: 700 }}>{log.method || 'PIN'} Protocol</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--text-1)' }}>
                      {new Date(log.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase' }}>Verified</div>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>

      {/* ── Attendance Check-in Modal ── */}
      <AnimatePresence>
        {checkinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget && checkinStatus !== 'loading') setCheckinModal(false); }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', // Changed to center!
              padding: '16px',
            }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{
                background: 'var(--surface)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '28px',
                padding: '28px 24px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
              }}
            >
              {checkinStatus === 'success' ? (
                /* ─ Success State ─ */
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: 'center', padding: '12px 0' }}
                >
                  <motion.div
                    animate={{ boxShadow: ['0 0 0px rgba(16,185,129,0)', '0 0 40px rgba(16,185,129,0.5)', '0 0 0px rgba(16,185,129,0)'] }}
                    transition={{ duration: 1.5, repeat: 2 }}
                    style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)', border: '2px solid var(--success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <CheckCircle size={36} color="var(--success)" />
                  </motion.div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>Access Granted!</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>
                    Welcome to GymCore, <strong style={{ color: 'var(--text-1)' }}>{user?.firstName}</strong>.<br/>Today's session has been recorded.
                  </div>
                </motion.div>
              ) : (
                /* ─ Confirm State ─ */
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CalendarCheck size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '1rem' }}>Mark Attendance</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Confirm today's check-in</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCheckinModal(false)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-3)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Info row */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Member</span>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{user?.firstName} {user?.lastName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Date</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>Time</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Confirm button */}
                  <motion.button
                    whileHover={{ scale: checkinStatus === 'loading' ? 1 : 1.02 }}
                    whileTap={{ scale: checkinStatus === 'loading' ? 1 : 0.98 }}
                    disabled={checkinStatus === 'loading'}
                    onClick={async () => {
                      setCheckinStatus('loading');
                      try {
                        await attendanceApi.mark();
                        setCheckinStatus('success');
                        setTimeout(() => {
                          setCheckinModal(false);
                          // refresh history
                          attendanceApi.getMy({ limit: 5 }).then(res => setHistory(res.data.data || []));
                        }, 2200);
                      } catch (err) {
                        setCheckinStatus('idle');
                        toast.error(err.response?.data?.message || 'Already checked in today or server offline');
                      }
                    }}
                    style={{
                      width: '100%', padding: '16px', borderRadius: '14px',
                      background: checkinStatus === 'loading' ? 'rgba(245,158,11,0.4)' : 'var(--primary)',
                      color: 'black', fontWeight: 900, fontSize: '1rem',
                      border: 'none', cursor: checkinStatus === 'loading' ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      letterSpacing: '0.5px',
                      transition: 'background 0.2s',
                    }}
                  >
                    {checkinStatus === 'loading' ? (
                      <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Marking...</>
                    ) : (
                      <><CheckCircle size={18} /> Confirm Check-in</>
                    )}
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ── QR Scan Modal ── */}
        {scanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: '#000',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
              <button onClick={() => setScanModal(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', width: '40px', height: '40px', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>
            
            <div style={{ textAlign: 'center', color: 'white', width: '100%', padding: '0 24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px' }}>SCAN TERMINAL QR</h2>
              <p style={{ color: 'var(--text-4)', fontSize: '0.9rem', maxWidth: '240px', margin: '0 auto 24px' }}>Point your camera at the gym's front desk terminal.</p>
              
              <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto', background: 'white', borderRadius: '16px', overflow: 'hidden' }}>
                <div id="reader" style={{ width: '100%' }}></div>
              </div>
              
              <div style={{ marginTop: '24px', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '2px' }}>
                CAMERA_LINK_ACTIVE
              </div>
            </div>
            
            {/* Inject minimal CSS to fix html5-qrcode ugly defaults */}
            <style>{`
              #reader button { padding: 10px 16px; background: var(--primary); border: none; border-radius: 8px; color: black; font-weight: 800; cursor: pointer; margin-top: 10px; }
              #reader select { padding: 8px; border-radius: 6px; margin-bottom: 10px; width: 100%; }
              #reader a { display: none; }
              #reader__scan_region { min-height: 200px; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

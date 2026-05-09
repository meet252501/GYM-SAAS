import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { DotLottiePlayer } from '@dotlottie/react-player';
import { CameraOff, CheckCircle, Loader2, ArrowLeft, ShieldCheck, Smartphone, Info, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { attendanceApi } from '../../api';
import { toast } from 'react-hot-toast';

export default function AttendanceScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const scannerRef = useRef(null);

  const handleScan = useCallback(async (token) => {
    if (loading || successData) return;
    
    setLoading(true);
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.pause(true);
      }

      const { data } = await attendanceApi.memberCheckin(token);
      
      if (data.success) {
        setSuccessData(data.data);
        toast.success("Check-in Successful!");
        // Add a vibration if supported
        if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
        setTimeout(() => navigate('/member/pass'), 3500);
      }
    } catch (err) {
      console.error("Check-in failed:", err);
      setError(err.response?.data?.message || "Invalid QR Code or Expired");
      
      setTimeout(() => {
        setError(null);
        setLoading(false);
        if (scannerRef.current) {
          scannerRef.current.resume();
        }
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [loading, successData, navigate]);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("member-scanner");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 20, // Higher FPS for smoother feel
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.75;
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            handleScan(decodedText);
          },
          () => {} 
        );
        setScanning(true);
      } catch (err) {
        console.error("Scanner failed:", err);
        setError("Camera access denied or error occurred.");
      }
    };

    const timer = setTimeout(startScanner, 800);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [handleScan]);

  const handleManualCheckin = async (e) => {
    e.preventDefault();
    if (!manualCode || manualCode.length < 4 || submittingCode) return;

    setSubmittingCode(true);
    try {
      const { data } = await attendanceApi.memberCheckin({ code: manualCode });
      if (data.success) {
        setSuccessData(data.data);
        toast.success("Check-in Successful!");
        setTimeout(() => navigate('/member/pass'), 3500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Code");
    } finally {
      setSubmittingCode(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', background: 'var(--bg)', padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 500, margin: '0 auto'
    }}>
      
      {/* Header with improved hierarchy */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="btn-icon"
          style={{ background: 'var(--surface-2)', borderRadius: 16, width: 48, height: 48, border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={24} />
        </motion.button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
            Check-in <span style={{ color: 'var(--primary)' }}>Terminal</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600 }}>
             <ShieldCheck size={13} color="var(--success)" /> SECURE BIOMETRIC LINK
          </div>
        </div>
      </div>

      {/* Main Container - Scanner Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ borderRadius: 32, overflow: 'hidden', padding: 12, position: 'relative', border: '1px solid var(--primary-border)' }}
      >
        
        {/* Scanner Viewport */}
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '1/1', background: '#000',
          borderRadius: 24, overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
        }}>
          <div id="member-scanner" style={{ width: '100%', height: '100%', objectFit: 'cover' }}></div>

          {/* Overlays */}
          <AnimatePresence>
            {!scanning && !error && (
              <motion.div 
                exit={{ opacity: 0 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#09090b', zIndex: 10 }}
              >
                <div style={{ width: 140, height: 140 }}>
                  <DotLottiePlayer
                    src="https://lottie.host/08075727-86f3-4672-9723-96b6188a867c/NfS9X65Gz.json"
                    autoplay
                    loop
                  />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: -20 }}>
                  Initializing Core...
                </span>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ 
                  position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.98)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: '#fff', zIndex: 20,
                  backdropFilter: 'blur(12px)'
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
                >
                  <CameraOff size={40} />
                </motion.div>
                <div style={{ fontWeight: 900, fontSize: '1.6rem', marginBottom: 8, letterSpacing: '-0.02em' }}>CONNECTION ERROR</div>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', fontWeight: 600, maxWidth: 240 }}>{error}</p>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="btn"
                  style={{ marginTop: 24, padding: '12px 24px', borderRadius: 14, background: '#fff', color: 'var(--danger)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <RefreshCcw size={18} /> Retry Connection
                </motion.button>
              </motion.div>
            )}

            {successData && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ 
                  position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.98)', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', color: '#fff', zIndex: 30,
                  backdropFilter: 'blur(16px)'
                }}
              >
                <div style={{ width: 160, height: 160, marginBottom: 10 }}>
                  <DotLottiePlayer
                    src="https://lottie.host/64703a4b-9e48-4395-9467-f417f7b2e666/p8Z78X65Gz.json"
                    autoplay
                  />
                </div>
                <div style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: 4, letterSpacing: '-0.02em', marginTop: -20 }}>ACCESS GRANTED</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, opacity: 0.95, marginBottom: 24 }}>Welcome back, {successData.member?.firstName}!</div>
                
                {successData.streak && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.15)', borderRadius: 16, fontWeight: 800, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    🔥 {successData.streak.current} DAY STREAK!
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Improved Laser Scanner Beam */}
          {scanning && !successData && !error && (
            <div className="scan-beam" style={{ animationDuration: '2.5s', height: '3px' }} />
          )}

          {/* Sci-Fi Scanner Guides */}
          {scanning && !successData && !error && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Viewfinder corners */}
               <div style={{ position: 'absolute', top: '15%', left: '15%', width: 40, height: 40, borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '12px 0 0 0' }} />
               <div style={{ position: 'absolute', top: '15%', right: '15%', width: 40, height: 40, borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 12px 0 0' }} />
               <div style={{ position: 'absolute', bottom: '15%', left: '15%', width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0 0 12px' }} />
               <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 0 12px 0' }} />
               
               {/* Scanning Dots */}
               <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: 'absolute', width: 4, height: 4, background: 'var(--primary)', borderRadius: '50%', top: '50%', left: '10%' }} 
               />
               <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                style={{ position: 'absolute', width: 4, height: 4, background: 'var(--primary)', borderRadius: '50%', top: '50%', right: '10%' }} 
               />
            </div>
          )}
        </div>
      </motion.div>

      {/* Improved Info Card */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 20, padding: 16, border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={18} color="var(--primary)" />
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-2)', lineHeight: 1.5, fontWeight: 500 }}>
          Align the QR code within the frame to automatically verify your entry and log your attendance.
        </p>
      </div>

      {/* Manual Input Section */}
      {!successData && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-4)', fontWeight: 800, letterSpacing: '0.1em' }}>OR ENTER MANUALLY</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }}></div>
          </div>
          
          <div className="glass-panel" style={{ padding: 20, borderRadius: 24, background: 'rgba(255,255,255,0.02)' }}>
            <form onSubmit={handleManualCheckin} style={{ display: 'flex', gap: 10 }}>
              <input 
                type="text" placeholder="6-DIGIT CODE" maxLength={6} value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--bg)', color: '#fff', fontWeight: 800, textAlign: 'center', letterSpacing: '0.2em', fontSize: '1rem', outline: 'none' }}
              />
              <motion.button 
                whileTap={{ scale: 0.95 }}
                type="submit" disabled={submittingCode || manualCode.length < 4}
                className="btn btn-primary" style={{ padding: '0 20px', borderRadius: 14, fontWeight: 800 }}
              >
                {submittingCode ? <Loader2 className="animate-spin" size={20} /> : 'VERIFY'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}

      {/* Footer Info */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-4)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
         <ShieldCheck size={14} /> CLOUD ENCRYPTION ACTIVE
      </div>
    </div>
  );
}

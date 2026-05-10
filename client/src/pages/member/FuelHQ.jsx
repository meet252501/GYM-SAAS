import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Trash2, ChevronDown, ChevronUp, 
  Target, TrendingUp, Flame, Camera, Upload,
  Apple, Coffee, Utensils, Moon, PieChart,
  Loader2, Sparkles, Calendar as CalendarIcon, Award, Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useLocation } from 'react-router-dom';
import { nutritionApi } from '../../api';
import { sendAIMessage, analyzeFoodImage, useAIUsage } from '../../hooks/useGymAI';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BackButton from '../../components/ui/BackButton';
import { toast } from 'react-hot-toast';

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_INFO = {
  breakfast: { label: 'Breakfast', icon: Coffee, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  lunch: { label: 'Lunch', icon: Utensils, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  dinner: { label: 'Dinner', icon: Moon, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  snack: { label: 'Snack', icon: Apple, color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
};

const today = () => new Date().toISOString().split('T')[0];

function LiveCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  useEffect(() => {
    let currentStream = null;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        currentStream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error("Camera error:", err);
        toast.error("Could not access camera. Check permissions.");
        onClose();
      }
    }
    start();
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [onClose]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      onCapture(canvas.toDataURL('image/jpeg', 0.85));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000, overflow: 'hidden' }}>
      
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* ── Holographic Overlay Layer ── */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none' }} />
      
      {/* ── Tactical HUD ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '40px 24px', pointerEvents: 'none' }}>
         
         {/* Top Telemetry */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 12 }}>
               <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: 2 }}>NEURAL_SCAN.v2</div>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>AI_CORE: ONLINE</div>
            </div>
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
               style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.2)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)' }}>
               <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
               <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'white' }}>STREAM_LIVE</span>
            </motion.div>
         </div>

         {/* Central 3D Reticle */}
         <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Outer Rotating Ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
               style={{ position: 'absolute', width: 280, height: 280, border: '1px dashed rgba(245,158,11,0.3)', borderRadius: '50%' }} />
            
            {/* Inner Rotating Ring (Reverse) */}
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
               style={{ position: 'absolute', width: 240, height: 240, border: '1px solid rgba(245,158,11,0.1)', borderRadius: '50%' }} />

            {/* Target Crosshairs */}
            <div style={{ position: 'relative', width: 200, height: 200 }}>
               <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '12px 0 0 0' }} />
               <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 12px 0 0' }} />
               <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderRadius: '0 0 0 12px' }} />
               <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderRadius: '0 0 12px 0' }} />
               
               {/* Scanning Line */}
               <motion.div animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: 'absolute', left: '10%', right: '10%', height: 1, background: 'rgba(245,158,11,0.5)', boxShadow: '0 0 15px var(--primary)' }} />
            </div>

            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '22%', fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: 1 }}>ANALYZING_DEPTH...</div>
         </div>

         {/* Bottom Controls */}
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, pointerEvents: 'auto', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
               <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                  style={{ width: 56, height: 56, borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)' }}>
                  <X size={24} />
               </motion.button>

               <motion.button 
                 whileHover={{ scale: 1.05 }} 
                 whileTap={{ scale: 0.9 }} 
                 onClick={capture}
                 style={{ 
                   position: 'relative', width: 100, height: 100, borderRadius: '50%', 
                   background: 'transparent', border: 'none', display: 'flex', 
                   alignItems: 'center', justifyContent: 'center' 
                 }}
               >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', inset: -4, border: '2px dashed rgba(245,158,11,0.5)', borderRadius: '50%' }}
                  />
                  
                  <div style={{ 
                    width: '100%', height: '100%', borderRadius: '50%', 
                    background: 'radial-gradient(circle at 30% 30%, #fbbf24, #f59e0b 50%, #d97706 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 4px 10px rgba(255,255,255,0.4), 0 10px 30px rgba(245,158,11,0.5)', 
                    border: '4px solid rgba(255,255,255,0.3)'
                  }}>
                     <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ width: 36, height: 36, borderRadius: 10, background: 'white', boxShadow: '0 0 20px rgba(255,255,255,0.8)' }} 
                     />
                  </div>
               </motion.button>

               <div style={{ width: 56 }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
               <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 16px', borderRadius: 20, color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: 2 }}>
                  INITIALIZE_NEURAL_CAPTURE
               </div>
               <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  POSITION FOOD WITHIN SCANNING RADIUS
               </div>
            </div>
         </div>
      </div>
    </motion.div>
  );
}


function GoalModal({ goal, onClose, onSaved }) {
  const [form, setForm] = useState({ calories: goal.calories, protein: goal.protein, carbs: goal.carbs, fat: goal.fat });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: parseInt(v) || 0 }));
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await nutritionApi.updateGoal(form); onSaved(); onClose(); }
    catch (err) { console.error(err); }
    finally { setSaving(false); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="glass-card-premium" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Daily Targets</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'white' }}><X size={18} /></button>
        </div>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[['calories','Calories (kcal)','#F59E0B'],['protein','Protein (g)','#3B82F6'],['carbs','Carbs (g)','#10B981'],['fat','Fat (g)','#EF4444']].map(([k,label,color]) => (
            <div key={k}>
              <label style={{ fontSize: '0.75rem', color, fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 8, letterSpacing: '1px' }}>{label}</label>
              <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}40`, borderRadius: 14, padding: '14px', color: 'white', fontSize: '1rem', outline: 'none' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: '16px' }}>{saving ? 'UPDATING...' : 'SAVE TARGETS'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function SearchModal({ date, meal, onClose, onAdded, autoScan }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const [adding, setAdding] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const [scanPreview, setScanPreview] = useState(null);
  const [showLiveCam, setShowLiveCam] = useState(false);
  const galInputRef = useRef(null);

  const { limit, remaining, refreshUsage } = useAIUsage();

  const doSearch = useCallback(async () => {
    if (q.trim().length < 2) return;
    try {
      const res = await nutritionApi.search(q.trim());
      setResults(res.data?.data || []);
    } catch { setResults([]); }
  }, [q]);

  useEffect(() => {
    if (autoScan) {
      const t = setTimeout(() => setShowLiveCam(true), 500);
      return () => clearTimeout(t);
    }
  }, [autoScan]);

  const addEntry = async () => {
    if (!selected) return;
    setAdding(true);
    try {
      await nutritionApi.addEntry(date, { ...selected, servingsEaten: servings, meal });
      onAdded();
      onClose();
    } catch (e) { console.error(e); }
    finally { setAdding(false); }
  };

  const analyzeFood = async () => {
    if (!selected) return;
    if (limit !== Infinity && remaining <= 0) {
      setAiAnalysis("AI daily limit reached. Please upgrade for more insights!");
      return;
    }
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `You are a nutrition coach. Briefly analyze if this food is healthy for a gym member: ${selected.name} (${selected.calories} kcal, ${selected.protein}g protein, ${selected.carbs}g carbs, ${selected.fat}g fat per ${selected.servingSize}g). Keep it under 50 words.`;
      const reply = await sendAIMessage([{ role: 'user', content: prompt }]);
      setAiAnalysis(reply);
      await refreshUsage();
    } catch { setAiAnalysis("Analysis unavailable."); }
    finally { setAnalyzing(false); }
  };

  const handleCapturedImage = async (dataUrl) => {
    setShowLiveCam(false);
    setScanningImage(true);
    setScanPreview(dataUrl);
    setAiAnalysis(null);
    setResults([]);
    try {
      const base64Data = dataUrl.split(',')[1];
      const mimeType = dataUrl.split(';')[0].split(':')[1];
      const foodData = await analyzeFoodImage(base64Data, mimeType);
      setSelected({
        name: foodData.name || 'Unknown Food',
        calories: foodData.calories || 0,
        protein: foodData.protein || 0,
        carbs: foodData.carbs || 0,
        fat: foodData.fat || 0,
        servingSize: foodData.serving_size_g || 100,
        unit: 'g'
      });
      setServings(1);
      await refreshUsage();
    } catch (err) { setAiAnalysis(err.message || "Failed to identify food."); }
    finally { setScanningImage(false); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (limit !== Infinity && remaining <= 0) {
      alert("AI daily limit reached. Please upgrade your plan!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => handleCapturedImage(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(12px)' }}>
      <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
        className="glass-card-premium" style={{ width: '100%', maxWidth: 550, height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.2)', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
        
        {/* Search Input Moved to Top for better ergonomics */}
         <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
           <div style={{ position: 'relative' }}>
             <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()}
               placeholder="QUERY_FOOD_DATABASE..."
               style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px 100px 16px 20px', color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace', borderLeft: '3px solid var(--primary)' }} />
             
             <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 6 }}>
                <input type="file" ref={galInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                <button onClick={() => setShowLiveCam(true)} style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={18} />
                </button>
                <button onClick={() => galInputRef.current?.click()} style={{ width: 38, height: 38, borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={18} />
                </button>
             </div>
           </div>
         </div>

         {/* Content Area: Visual Stage & Results */}
         <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">
          
          {/* Visual Area (Scan Preview or Empty State) */}
          {scanPreview ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', marginBottom: 24 }}>
              <div style={{ borderRadius: '24px', overflow: 'hidden', border: '2px solid rgba(245,158,11,0.3)', position: 'relative', background: '#000', height: 280, boxShadow: '0 0 30px rgba(245,158,11,0.1)' }}>
                <img src={scanPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Visual ID" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))' }} />
                
                {/* HUD Overlay */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                  <div style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.6rem', color: 'var(--success)', fontWeight: 900 }}>V_LINKED</div>
                </div>

                {scanningImage && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                    <div style={{ marginTop: 16, fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: 2 }}>NEURAL_EXTRACTION_ACTIVE...</div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div style={{ height: 180, borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Sparkles size={32} color="rgba(255,255,255,0.1)" />
              <div style={{ marginTop: 12, fontSize: '0.7rem', color: 'var(--text-4)', fontWeight: 800 }}>READY_FOR_VISUAL_INPUT</div>
            </div>
          )}

          {/* AI Intelligence Report */}
          {aiAnalysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
               <div className="glass-card-premium" style={{ padding: 20, borderRadius: '20px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 900, marginBottom: 12 }}>
                    <Sparkles size={14} /> AI NUTRITION INTEL
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{aiAnalysis}</p>
               </div>
            </motion.div>
          )}

          {/* Search Results Stage */}
          {results.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 900, letterSpacing: 1, marginBottom: 12 }}>DATABASE_MATCHES</div>
              {results.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setSelected(item); setServings(1); setAiAnalysis(null); }}
                  style={{ 
                    padding: '16px', borderRadius: '18px', cursor: 'pointer', marginBottom: '8px',
                    background: selected === item ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected === item ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selected === item ? 'var(--primary)' : 'white' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '4px' }}>P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g</div>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{item.calories}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Selected Item Controls */}
          {selected && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ flex: 1 }}>
                     <label style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>QUANTITY_UNITS</label>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => setServings(s => Math.max(0.5, s - 0.5))} style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>-</button>
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, minWidth: 40, textAlign: 'center' }}>{servings}</span>
                        <button onClick={() => setServings(s => s + 0.5)} style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>+</button>
                     </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <label style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 900, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>ENERGY_VALUE</label>
                     <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>{Math.round(selected.calories * servings)} <span style={{ fontSize: '0.8rem' }}>kcal</span></div>
                  </div>
               </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Action Bar */}
         <div style={{ padding: '24px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
           <div style={{ display: 'flex', gap: 12 }}>
             <button onClick={analyzeFood} disabled={!selected || analyzing} className="btn-secondary" style={{ flex: 1, padding: '18px', borderRadius: '18px', opacity: (!selected || analyzing) ? 0.5 : 1, fontWeight: 900 }}>
               {analyzing ? 'SCANNING...' : 'AI INSIGHT'}
             </button>
             <button onClick={addEntry} disabled={!selected || adding} className="btn-primary" style={{ flex: 2, padding: '18px', borderRadius: '18px', opacity: (!selected || adding) ? 0.5 : 1, fontWeight: 900 }}>
               {adding ? 'SYNCING...' : 'CONFIRM_LOG'}
             </button>
           </div>
         </div>

        {/* Live Camera Component Overlay */}
        <AnimatePresence>
          {showLiveCam && (
            <LiveCamera 
              onCapture={handleCapturedImage} 
              onClose={() => setShowLiveCam(false)} 
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function MealSection({ meal, entries, onDelete, onAdd }) {
  const [open, setOpen] = useState(true);
  const info = MEAL_INFO[meal];
  const mealEntries = entries.filter(e => e.meal === meal);
  const mealCals = mealEntries.reduce((s, e) => s + e.calories * e.servingsEaten, 0);

  return (
    <div className="glass-card-premium" style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '16px' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', cursor: 'pointer' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: info.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <info.icon size={20} color={info.color} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>{info.label}</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 700 }}>{mealEntries.length} items logged</span>
        </div>
        <div style={{ textAlign: 'right', marginRight: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: info.color }}>{Math.round(mealCals)} <span style={{ fontSize: '0.7rem' }}>kcal</span></div>
        </div>
        {open ? <ChevronUp size={20} color="var(--text-4)" /> : <ChevronDown size={20} color="var(--text-4)" />}
      </div>
      
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px' }}>
              {mealEntries.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '0.85rem' }}>No meals recorded for {info.label.toLowerCase()} yet.</div>
              )}
              {mealEntries.map((e, i) => (
                <div key={e._id || i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '14px', marginBottom: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{e.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '2px' }}>{e.servingsEaten} servings · P:{e.protein}g C:{e.carbs}g F:{e.fat}g</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--primary)' }}>{Math.round(e.calories * e.servingsEaten)}</div>
                  <button onClick={() => onDelete(e._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.4)', padding: 8 }}><Trash2 size={16} /></button>
                </div>
              ))}
              <button onClick={() => onAdd(meal)} style={{ width: '100%', marginTop: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Plus size={18} /> Add Food to {info.label}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nutrition() {
  const location = useLocation();
  const [date, setDate] = useState(today());
  const [log, setLog] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null);
  const [goalModal, setGoalModal] = useState(false);
  const [tab, setTab] = useState('diary');
  const [autoScan, setAutoScan] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'scan') {
      const t = setTimeout(() => {
        setAddModal('breakfast');
        setAutoScan(true);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [location]);

  const loadDay = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, hRes, dpRes] = await Promise.all([
        nutritionApi.getDay(date),
        nutritionApi.getWeekly(),
        import('../../api').then(m => m.dietPlanApi.getAll())
      ]);
      setLog(lRes.data?.data || null);
      setWeekly(hRes.data?.data || []);
      setDietPlan(dpRes.data?.data?.[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) loadDay();
    }, 0);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [loadDay]);

  const deleteEntry = async (entryId) => {
    try {
      const res = await nutritionApi.deleteEntry(date, entryId);
      if (res.data?.data) setLog(res.data.data);
    } catch (e) { console.error(e); }
  };

  const totals = log?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal = log?.goal || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const entries = log?.entries || [];
  const remaining = Math.max(0, goal.calories - totals.calories);

  const goDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '24px 16px 100px' }}>
      <CyberMatrix intensity={0.05} />
      
      <div className="mobile-px-4" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1, paddingTop: 12, paddingBottom: 40 }}>
        <BackButton />
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h1 className="mobile-text-2xl" style={{ fontSize: '2.4rem', fontWeight: 900, margin: 0 }}>Fuel <span style={{ color: 'var(--primary)' }}>HQ</span></h1>
            <p style={{ color: 'var(--text-3)', fontWeight: 600, margin: 0 }}>Neural nutrition tracking active</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAddModal('snack');
              setTimeout(() => {
                const scanBtn = document.querySelector('[title="Live AI Scan"]');
                if (scanBtn) scanBtn.click();
              }, 300);
            }}
            style={{ 
              padding: '12px 20px', background: 'var(--primary)', border: 'none', borderRadius: '16px',
              color: '#000', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)', cursor: 'pointer'
            }}
          >
            <Camera size={20} />
            Scan Food
          </motion.button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => goDate(-1)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>‹</button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }} />
            <button onClick={() => goDate(1)} disabled={date >= today()} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: date >= today() ? '#444' : 'white', cursor: 'pointer' }}>›</button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '6px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[['diary', 'Diary Log'], ['weekly', 'Weekly Analytics']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: tab === key ? 'var(--primary)' : 'transparent', color: tab === key ? 'black' : 'var(--text-3)', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>
        ) : tab === 'diary' ? (
          <>
            {/* Bento Summary Cards */}
            <div className="grid-12" style={{ marginBottom: '20px' }}>
              <div style={{ gridColumn: 'span 8' }}>
                <div className="glass-card-premium mobile-p-5 mobile-flex-col" style={{ height: '100%', padding: '32px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <motion.circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
                        initial={{ strokeDasharray: '0 283' }} animate={{ strokeDasharray: `${(totals.calories/goal.calories)*283} 283` }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{Math.round(totals.calories)}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 800 }}>KCAL</span>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 900 }}>Total Energy</h3>
                    <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '0.95rem' }}>
                      You've consumed <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{Math.round((totals.calories/goal.calories)*100)}%</span> of your daily target.
                    </p>
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <span style={{ fontSize: '0.9rem', color: 'var(--success)', fontWeight: 800 }}>{Math.round(remaining)} kcal remaining</span>
                       <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
                       <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 700 }}>Goal: {goal.calories}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: 'span 4' }}>
                  <div className="glass-card-premium mobile-p-5" style={{ height: '100%', padding: '24px', borderRadius: '28px', background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(59,130,246,0.1) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                      <Target size={22} color="var(--primary)" />
                    </div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800 }}>Update Goal</h4>
                    <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: 'var(--text-3)' }}>Tweak your macro targets.</p>
                    <button onClick={() => setGoalModal(true)} className="btn-secondary" style={{ padding: '10px' }}>EDIT TARGETS</button>
                 </div>
              </div>
            </div>

            {/* Macros Breakdown */}
            <div className="grid-3" style={{ marginBottom: '32px' }}>
               {[
                 { label: 'Protein', key: 'protein', color: '#3b82f6', unit: 'g' },
                 { label: 'Carbs', key: 'carbs', color: '#10b981', unit: 'g' },
                 { label: 'Fats', key: 'fat', color: '#ef4444', unit: 'g' }
               ].map(m => (
                 <div key={m.key} className="glass-card-premium" style={{ padding: '16px 20px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: m.color, textTransform: 'uppercase' }}>{m.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>{Math.round(totals[m.key])} / {goal[m.key]}{m.unit}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totals[m.key]/goal[m.key])*100)}%` }}
                        style={{ height: '100%', background: m.color, borderRadius: '3px', boxShadow: `0 0 10px ${m.color}40` }} />
                    </div>
                 </div>
               ))}
            </div>

            {/* Diet Plan Widget */}
            {dietPlan && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-premium mobile-p-5" style={{ padding: '24px', borderRadius: '28px', marginBottom: '32px', border: '1px solid rgba(59,130,246,0.2)', background: 'linear-gradient(90deg, rgba(59,130,246,0.05), transparent)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChart size={24} color="#60a5fa" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 900 }}>{dietPlan.name} <span style={{ fontSize: '0.7rem', verticalAlign: 'middle', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>ACTIVE PLAN</span></h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>{dietPlan.description}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Meals Sections */}
            {MEALS.map(meal => (
              <MealSection key={meal} meal={meal} entries={entries} onDelete={deleteEntry} onAdd={m => setAddModal(m)} />
            ))}
          </>
        ) : (
          /* Weekly View */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium" style={{ padding: '32px', borderRadius: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
               <TrendingUp size={24} color="var(--primary)" />
               <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900 }}>Calorie Trend (7 Days)</h3>
            </div>
            
            <div style={{ height: '300px', width: '100%', marginBottom: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-4)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-4)', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0D0D10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                    {weekly.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.calories > entry.goal ? '#ef4444' : entry.calories > entry.goal * 0.8 ? '#f59e0b' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'AVG CALORIES', value: Math.round(weekly.reduce((s,d)=>s+d.calories,0)/Math.max(weekly.length,1)), icon: Flame, color: '#f59e0b' },
                { label: 'DAYS LOGGED', value: `${weekly.filter(d=>d.calories>0).length}/7`, icon: CalendarIcon, color: '#3b82f6' },
                { label: 'TOP DAY', value: Math.max(...weekly.map(d=>d.calories)), icon: Award, color: '#10b981' },
                { label: 'AVG PROTEIN', value: '142g', icon: Activity, color: '#8b5cf6' }
              ].map((s, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-4)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      <AnimatePresence>
        {addModal && (
          <SearchModal 
            date={date} 
            meal={addModal} 
            onClose={() => { setAddModal(null); setAutoScan(false); }} 
            onAdded={loadDay} 
            autoScan={autoScan}
          />
        )}
        {goalModal && <GoalModal goal={goal} onClose={() => setGoalModal(false)} onSaved={loadDay} />}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Trash2, ChevronDown, ChevronUp, Target, TrendingUp, Flame, Edit2, Camera } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { nutritionApi } from '../../api';
import { sendAIMessage, analyzeFoodImage } from '../../hooks/useGymAI';

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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        style={{ background: '#0D0D10', border: '1px solid #333', borderRadius: 20, width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Edit Daily Goals</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
        </div>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['calories','Calories (kcal)','#F59E0B'],['protein','Protein (g)','#3B82F6'],['carbs','Carbs (g)','#10B981'],['fat','Fat (g)','#EF4444']].map(([k,label,color]) => (
            <div key={k}>
              <label style={{ fontSize: '0.8rem', color, fontWeight: 700, display: 'block', marginBottom: 6 }}>{label}</label>
              <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                style={{ width: '100%', background: '#141418', border: `1px solid ${color}33`, borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1px solid #333', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#000', cursor: 'pointer', fontWeight: 800 }}>{saving ? 'Saving...' : 'Save Goals'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const today = () => new Date().toISOString().split('T')[0];

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABEL = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner', snack: '🍎 Snack' };
const MACRO_CFG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#F59E0B', goalKey: 'calories' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: '#3B82F6', goalKey: 'protein' },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: '#10B981', goalKey: 'carbs' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    color: '#EF4444', goalKey: 'fat' },
];

function MacroRing({ value, goal, color, label, unit }) {
  const pct = Math.min((value / Math.max(goal, 1)) * 100, 100);
  const r = 32, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={80} height={80}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
        <text x={40} y={37} textAnchor="middle" fill="white" fontSize={12} fontWeight={800}>{Math.round(value)}</text>
        <text x={40} y={50} textAnchor="middle" fill="#666" fontSize={9}>{unit}</text>
      </svg>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function SearchModal({ date, meal, onClose, onAdded }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [servings, setServings] = useState(1);
  const [adding, setAdding] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanningImage, setScanningImage] = useState(false);
  const fileInputRef = useRef(null);

  const doSearch = useCallback(async () => {
    if (q.trim().length < 2) return;
    setSearching(true);
    try {
      const res = await nutritionApi.search(q.trim());
      setResults(res.data?.data || []);
    } catch { setResults([]); }
    finally { setSearching(false); }
  }, [q]);

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
    setAnalyzing(true);
    setAiAnalysis(null);
    try {
      const prompt = `You are a nutrition coach. Briefly analyze if this food is healthy for a gym member: ${selected.name} (${selected.calories} kcal, ${selected.protein}g protein, ${selected.carbs}g carbs, ${selected.fat}g fat per ${selected.servingSize}g). Keep it under 50 words.`;
      const reply = await sendAIMessage([{ role: 'user', content: prompt }]);
      setAiAnalysis(reply);
    } catch {
      setAiAnalysis("Analysis unavailable right now.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanningImage(true);
    setAiAnalysis(null);
    setResults([]); 

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        const mimeType = file.type;
        try {
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
        } catch (err) {
          console.error(err);
          setAiAnalysis("Could not identify food from image.");
        } finally {
          setScanningImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setScanningImage(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        style={{ background: '#0D0D10', border: '1px solid #222', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #1a1a1f' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add Food — {MEAL_LABEL[meal]}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={q} onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Search food (e.g. banana, chicken breast)..."
              style={{ flex: 1, background: '#141418', border: '1px solid #333', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
              autoFocus />
            <button onClick={doSearch} disabled={searching || scanningImage}
              style={{ background: 'var(--primary)', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', color: '#000' }}>
              <Search size={16} />
            </button>
            <input type="file" accept="image/*" capture="environment" hidden ref={fileInputRef} onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} disabled={searching || scanningImage}
              style={{ background: '#222', border: '1px solid #333', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Scan Food Photo">
              <Camera size={16} />
            </button>
          </div>
          {scanningImage && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: 8, textAlign: 'center' }}>✨ Analyzing food image...</div>}
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {searching && <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Searching...</div>}
          {!searching && results.length === 0 && q && <div style={{ padding: 24, textAlign: 'center', color: '#555', fontSize: '0.85rem' }}>No results. Try a different search term.</div>}
          {results.map((item, i) => (
            <div key={i} onClick={() => { setSelected(item); setServings(1); setAiAnalysis(null); }}
              style={{ padding: '12px 20px', borderBottom: '1px solid #111', cursor: 'pointer', background: selected === item ? '#1a1a25' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                {item.brand && <div style={{ fontSize: '0.72rem', color: '#666' }}>{item.brand}</div>}
                <div style={{ fontSize: '0.72rem', color: '#555', marginTop: 2 }}>P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F59E0B' }}>{item.calories}</div>
                <div style={{ fontSize: '0.68rem', color: '#555' }}>kcal/{item.servingSize}g</div>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a1f', background: '#0a0a0d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Servings ({selected.servingSize}g each):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #333', background: '#141418', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                <span style={{ fontWeight: 800, minWidth: 24, textAlign: 'center' }}>{servings}</span>
                <button onClick={() => setServings(s => s + 0.5)}
                  style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #333', background: '#141418', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 800, color: '#F59E0B' }}>{Math.round(selected.calories * servings)} kcal</span>
            </div>
            
            {/* AI Analysis Section */}
            <div style={{ marginBottom: 14, background: '#141418', borderRadius: 10, padding: 12, border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#A855F7', display: 'flex', alignItems: 'center', gap: 6 }}>
                  ✨ AI Health Analysis
                </span>
                <button onClick={analyzeFood} disabled={analyzing}
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 6, padding: '4px 10px', color: '#A855F7', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  {analyzing ? 'Analyzing...' : 'Ask AI'}
                </button>
              </div>
              {aiAnalysis && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 8, fontSize: '0.8rem', color: '#ccc', lineHeight: 1.4 }}>
                  {aiAnalysis}
                </motion.div>
              )}
            </div>

            <button onClick={addEntry} disabled={adding}
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#000', fontWeight: 800, cursor: 'pointer', fontSize: '0.95rem' }}>
              {adding ? 'Adding...' : `Add to ${MEAL_LABEL[meal]}`}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function MealSection({ meal, entries, onDelete, onAdd }) {
  const [open, setOpen] = useState(true);
  const mealEntries = entries.filter(e => e.meal === meal);
  const mealCals = mealEntries.reduce((s, e) => s + e.calories * e.servingsEaten, 0);

  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', cursor: 'pointer' }}>
        <span style={{ fontSize: '1rem', fontWeight: 700, flex: 1 }}>{MEAL_LABEL[meal]}</span>
        <span style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700 }}>{Math.round(mealCals)} kcal</span>
        {open ? <ChevronUp size={16} color="#555" /> : <ChevronDown size={16} color="#555" />}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid #111' }}>
              {mealEntries.length === 0 && (
                <div style={{ padding: '14px 18px', color: '#444', fontSize: '0.85rem' }}>No items yet</div>
              )}
              {mealEntries.map((e, i) => (
                <div key={e._id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid #0d0d0d' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#555' }}>{e.servingsEaten} × {e.servingSize}g · P:{e.protein}g C:{e.carbs}g F:{e.fat}g</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F59E0B', flexShrink: 0 }}>{Math.round(e.calories * e.servingsEaten)} kcal</span>
                  <button onClick={() => onDelete(e._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4 }}><Trash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => onAdd(meal)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', borderTop: mealEntries.length ? '1px solid #0d0d0d' : 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Plus size={14} /> Add Food
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Nutrition() {
  const [date, setDate] = useState(today());
  const [log, setLog] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null);
  const [goalModal, setGoalModal] = useState(false);
  const [tab, setTab] = useState('diary');

  const loadDay = useCallback(async () => {
    setLoading(true);
    try {
      const [dayRes, weekRes] = await Promise.all([
        nutritionApi.getDay(date),
        nutritionApi.getWeekly(),
      ]);
      if (dayRes.data?.data)   setLog(dayRes.data.data);
      if (weekRes.data?.data)  setWeekly(weekRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => {
    const init = async () => { await loadDay(); };
    init();
  }, [loadDay]);

  const deleteEntry = async (entryId) => {
    try {
      const res = await nutritionApi.deleteEntry(date, entryId);
      if (res.data?.data) setLog(res.data.data);
    } catch (e) { console.error(e); }
  };

  const totals   = log?.totals   || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goal     = log?.goal     || { calories: 2000, protein: 150, carbs: 250, fat: 65 };
  const entries  = log?.entries  || [];
  const remaining = Math.max(0, goal.calories - totals.calories);

  const goDate = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={22} color="#F59E0B" /> Calorie Tracker
          </h2>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-3)' }}>Log your daily nutrition</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => goDate(-1)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer' }}>‹</button>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: '0.85rem' }} />
          <button onClick={() => goDate(1)} disabled={date >= today()} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: date >= today() ? '#333' : 'white', cursor: date >= today() ? 'default' : 'pointer' }}>›</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 12, padding: 4 }}>
        {[['diary', '📖 Diary'], ['weekly', '📊 Weekly']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ flex: 1, padding: '8px', borderRadius: 9, border: 'none', cursor: 'pointer', background: tab === key ? 'var(--primary)' : 'transparent', color: tab === key ? '#000' : 'var(--text-3)', fontWeight: 700, fontSize: '0.85rem' }}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>Loading...</div>}

      {!loading && tab === 'diary' && (
        <>
          {/* Macro Summary */}
          <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#F59E0B' }}>{Math.round(totals.calories)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>of {goal.calories} kcal · <span style={{ color: '#10B981' }}>{Math.round(remaining)} remaining</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
              {MACRO_CFG.map(m => (
                <MacroRing key={m.key} value={totals[m.key] || 0} goal={goal[m.goalKey] || 1} color={m.color} label={m.label} unit={m.unit} />
              ))}
            </div>
          </motion.div>

          {/* Calorie progress bar */}
          <div style={{ background: 'var(--surface-1)', borderRadius: 12, overflow: 'hidden', height: 8 }}>
            <motion.div initial={{ width: 0 }}
              animate={{ width: `${Math.min((totals.calories / goal.calories) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: totals.calories > goal.calories ? '#EF4444' : '#F59E0B', borderRadius: 12 }} />
          </div>

          {/* Meal Sections */}
          {MEALS.map(meal => (
            <MealSection key={meal} meal={meal} entries={entries}
              onDelete={deleteEntry} onAdd={m => setAddModal(m)} />
          ))}
        </>
      )}

      {!loading && tab === 'weekly' && (
        <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>7-Day Calorie Trend</h3>
          </div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={weekly} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a1f', border: '1px solid #333', borderRadius: 8 }} />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]} name="Calories">
                  {weekly.map((d, i) => (
                    <Cell key={i} fill={d.calories > d.goal ? '#EF4444' : d.calories > d.goal * 0.8 ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-3)', justifyContent: 'center' }}>
            <span><span style={{ color: '#3B82F6' }}>■</span> Under goal</span>
            <span><span style={{ color: '#F59E0B' }}>■</span> Near goal</span>
            <span><span style={{ color: '#EF4444' }}>■</span> Over goal</span>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[
              { label: 'Avg Calories', value: `${Math.round(weekly.reduce((s,d)=>s+d.calories,0)/Math.max(weekly.filter(d=>d.calories>0).length,1))} kcal` },
              { label: 'Days Logged', value: `${weekly.filter(d=>d.calories>0).length}/7` },
              { label: 'Best Day', value: `${Math.max(...weekly.map(d=>d.calories))} kcal` },
              { label: 'Goal', value: `${weekly[0]?.goal || 2000} kcal/day` },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{s.label}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && tab === 'diary' && (
        <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', cursor: 'pointer' }}
          onClick={() => setGoalModal(true)}>
          <Target size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              Daily Goals
              <Edit2 size={13} color="var(--text-3)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {MACRO_CFG.map(m => (
                <div key={m.key} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: m.color, fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{goal[m.goalKey]}<span style={{ fontSize: '0.65rem', color: 'var(--text-3)' }}>{m.unit}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Search modal */}
      <AnimatePresence>
        {addModal && (
          <SearchModal date={date} meal={addModal} onClose={() => setAddModal(null)} onAdded={loadDay} />
        )}
      </AnimatePresence>

      {/* Goal modal */}
      <AnimatePresence>
        {goalModal && (
          <GoalModal goal={goal} onClose={() => setGoalModal(false)} onSaved={loadDay} />
        )}
      </AnimatePresence>
    </div>
  );
}

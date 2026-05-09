/**
 * MemberAI — Compact GymCoach chat bubble for members
 * Plan-gated: Trial=3, Basic=10, Premium=30, Elite=∞
 * Groq primary · Gemini backup · offline rule engine
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, X, Send, Lock, Crown, Star, Zap } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import {
  sendAIMessage, buildMemberPrompt,
  canSendMessage, incrementUsage, PLAN_LIMITS,
} from '../../hooks/useGymAI';

const QUICK_ACTIONS = [
  { label: '💪 Chest workout', msg: 'Give me a chest workout for today' },
  { label: '🥗 Protein tips', msg: 'How much protein do I need daily?' },
  { label: '🔥 Lose fat fast', msg: 'Best exercises for fat loss?' },
  { label: '😴 Recovery tips', msg: 'How to recover faster between workouts?' },
];

const UPGRADE_FOR = { Trial: 'Basic', Basic: 'Premium', Premium: 'Elite' };
const PLAN_ICON   = { Trial: Zap, Basic: Zap, Premium: Star, Elite: Crown };

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', gap: 7, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginBottom: 2,
          background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dumbbell size={12} color="white" />
        </div>
      )}
      <div style={{
        maxWidth: '82%', padding: '8px 12px',
        borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
        background: isUser ? 'var(--primary)' : 'var(--surface-2)',
        color: isUser ? '#000' : 'var(--text-1)',
        fontSize: '0.82rem', lineHeight: 1.5, fontWeight: isUser ? 600 : 400,
        border: isUser ? 'none' : '1px solid var(--border)',
        whiteSpace: 'pre-wrap',
      }}>{msg.content}</div>
    </motion.div>
  );
}

function UsageBar({ used, limit }) {
  if (limit === Infinity) return null;
  const pct = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(0, limit - used);
  return (
    <div style={{ padding: '6px 14px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-4)', marginBottom: 4 }}>
        <span>AI messages today</span>
        <span style={{ color: remaining <= 2 ? 'var(--danger)' : 'var(--text-3)' }}>{remaining} remaining</span>
      </div>
      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 3 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          style={{ height: '100%', borderRadius: 3,
            background: pct >= 80 ? 'var(--danger)' : pct >= 50 ? 'var(--primary)' : 'var(--success)' }} />
      </div>
    </div>
  );
}

function UpgradePrompt({ plan }) {
  const next = UPGRADE_FOR[plan];
  const nextLimit = PLAN_LIMITS[next];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ margin: '8px 14px', padding: '14px', borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
        border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}>
      <Lock size={20} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
      <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: 4 }}>Daily limit reached</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: 10 }}>
        Upgrade to <strong style={{ color: 'var(--primary)' }}>{next}</strong> for{' '}
        {nextLimit === Infinity ? 'unlimited' : `${nextLimit} messages`}/day
      </div>
      <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.78rem' }}>
        Upgrade to {next} ↗
      </button>
    </motion.div>
  );
}

export default function MemberAI() {
  const { user } = useAuthStore();
  const plan      = user?.membershipPlan || 'Basic';
  const userId    = user?._id || 'guest';
  const limit     = PLAN_LIMITS[plan] ?? 10;

  const [open, setOpen]     = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey ${user?.firstName || 'there'}! 💪 I'm GymCoach, your personal AI trainer. What's on your workout agenda today?`,
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    try {
      const raw = localStorage.getItem(`gymflow_ai_usage_${userId}`);
      if (!raw) return 0;
      const d = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      return d.date === today ? (d.count || 0) : 0;
    } catch { return 0; }
  });
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const locked = !canSendMessage(userId, plan, 'member');
  const systemMsg = { role: 'system', content: buildMemberPrompt(user) };

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || loading || locked) return;
    setInput('');

    incrementUsage(userId);
    setUsageCount(c => c + 1);

    const userMsg = { role: 'user', content: userText };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const reply = await sendAIMessage([systemMsg, ...history.slice(-6)]);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚡ Connection issue, try again shortly!' }]);
    } finally {
      setLoading(false);
    }
  }

  const PlanIcon = PLAN_ICON[plan] || Zap;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 20 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', bottom: 90, right: 20, zIndex: 999,
              width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'var(--gradient-brand)',
              boxShadow: '0 0 0 0 rgba(245,158,11,0.4), 0 6px 20px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'coachPulse 3s infinite',
            }}
          >
            <Dumbbell size={22} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              position: 'fixed', bottom: 90, right: 16, zIndex: 1000,
              width: 340, maxHeight: 500,
              background: '#0A0A0D',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 20,
              boxShadow: '0 0 40px rgba(245,158,11,0.1), 0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid rgba(245,158,11,0.15)',
              background: 'linear-gradient(90deg, rgba(245,158,11,0.08), transparent)',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-brand)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(245,158,11,0.4)' }}>
                <Dumbbell size={14} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>GymCoach AI</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PlanIcon size={10} /> {plan} · {limit === Infinity ? 'Unlimited' : `${Math.max(0, limit - usageCount)} msgs left`}
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                <X size={15} />
              </button>
            </div>

            {/* Usage bar */}
            <UsageBar used={usageCount} limit={limit} />

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }} className="no-scrollbar">
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {loading && (
                <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Dumbbell size={12} color="white" />
                  </div>
                  <div style={{ display: 'flex', gap: 4, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '4px 14px 14px 14px', border: '1px solid var(--border)' }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i} animate={{ scale: [1,1.6,1] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Locked state */}
            {locked && <UpgradePrompt plan={plan} />}

            {/* Quick actions (first visit only) */}
            {!locked && messages.length <= 1 && (
              <div style={{ padding: '0 10px 8px', display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {QUICK_ACTIONS.map(a => (
                  <button key={a.label} onClick={() => send(a.msg)}
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: 20, padding: '4px 10px', fontSize: '0.7rem', color: 'var(--primary)',
                      cursor: 'pointer', fontWeight: 600 }}>
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            {!locked && (
              <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(245,158,11,0.1)', display: 'flex', gap: 7 }}>
                <input
                  ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  className="form-input" style={{ flex: 1, fontSize: '0.82rem', height: 36 }}
                  placeholder="Ask your coach…"
                  disabled={loading}
                />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => send()}
                  disabled={!input.trim() || loading}
                  style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: input.trim() ? 'var(--gradient-brand)' : 'var(--surface-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: input.trim() ? '0 0 10px rgba(245,158,11,0.4)' : 'none' }}>
                  <Send size={14} color={input.trim() ? 'white' : 'var(--text-4)'} />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes coachPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4), 0 6px 20px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 0 10px rgba(245,158,11,0), 0 6px 20px rgba(0,0,0,0.4); }
        }
      `}</style>
    </>
  );
}

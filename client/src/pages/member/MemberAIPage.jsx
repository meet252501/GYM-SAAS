/**
 * MemberAIPage — Full-screen GymCoach AI for members
 * Route: /member/ai
 * Plan-gated: Trial=3, Basic=10, Premium=30, Elite=∞
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Send, Lock, Crown, Star, Zap, Copy, Check, Sparkles, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import {
  sendAIMessage, buildMemberPrompt,
  canSendMessage, incrementUsage, PLAN_LIMITS,
} from '../../hooks/useGymAI';

const PLAN_ICON   = { Trial: Zap, Basic: Zap, Premium: Star, Elite: Crown };
const UPGRADE_FOR = { Trial: 'Basic', Basic: 'Premium', Premium: 'Elite' };

const QUICK_ACTIONS = [
  { label: '💪 Chest day', msg: 'Give me a complete chest workout for today' },
  { label: '🔥 Burn fat', msg: 'Best exercises for fat loss? Give me a 4-week plan.' },
  { label: '🥗 Protein tips', msg: 'How much protein do I need daily for muscle gain?' },
  { label: '😴 Recovery', msg: 'How do I recover faster between workouts?' },
  { label: '🧠 Motivation', msg: 'I feel like skipping the gym today. Motivate me!' },
  { label: '📋 Full plan', msg: 'Create a 30-day beginner workout plan for me.' },
];

// ─── Message bubble ───────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard?.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      style={{
        display: 'flex',
        gap: 10,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginBottom: 2,
          background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(245,158,11,0.35)',
        }}>
          <Dumbbell size={14} color="white" />
        </div>
      )}

      <div style={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '10px 14px',
          borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          background: isUser
            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
            : 'rgba(255,255,255,0.04)',
          color: isUser ? '#000' : 'var(--text-1)',
          fontSize: '0.88rem', lineHeight: 1.6, fontWeight: isUser ? 600 : 400,
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.07)',
          whiteSpace: 'pre-wrap',
          backdropFilter: isUser ? 'none' : 'blur(8px)',
          boxShadow: isUser
            ? '0 4px 16px rgba(245,158,11,0.25)'
            : '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {msg.content}
        </div>
        {/* Copy button for AI messages */}
        {!isUser && (
          <button
            onClick={copyText}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-4)', padding: '2px 4px',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.68rem',
              transition: 'color 0.15s',
            }}
          >
            {copied ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Dumbbell size={14} color="white" />
      </div>
      <div style={{
        display: 'flex', gap: 5, padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '4px 18px 18px 18px',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Usage bar ────────────────────────────────────────────────
function UsageBar({ used, limit, plan }) {
  if (limit === Infinity) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--success)' }}>
        <Sparkles size={12} />
        Elite · Unlimited messages
      </div>
    );
  }
  const pct = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(0, limit - used);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
        <span style={{ color: 'var(--text-3)' }}>{plan} · {remaining} msgs left</span>
        <span style={{ color: remaining <= 2 ? 'var(--danger)' : 'var(--text-4)' }}>{used}/{limit}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          style={{
            height: '100%', borderRadius: 3,
            background: pct >= 80 ? 'var(--danger)' : pct >= 50 ? 'var(--primary)' : 'var(--success)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function MemberAIPage() {
  const { user } = useAuthStore();
  const plan   = user?.membershipPlan || 'Basic';
  const userId = user?._id || 'guest';
  const limit  = PLAN_LIMITS[plan] ?? 10;

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hey ${user?.firstName || 'there'}! 💪 I'm GymCoach, your personal AI trainer.\n\nI can help you with workout plans, nutrition advice, recovery tips, and keeping you motivated. What's on your fitness agenda today?`,
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(() => {
    try {
      const raw = localStorage.getItem(`gymflow_ai_usage_${userId}`);
      if (!raw) return 0;
      const d = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      return d.date === today ? (d.count ?? 0) : 0;
    } catch { return 0; }
  });
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const scrollRef  = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Show scroll-to-bottom button when scrolled up
  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  const locked = !canSendMessage(userId, plan, 'member');
  const systemMsg = { role: 'system', content: buildMemberPrompt(user) };
  const PlanIcon = PLAN_ICON[plan] || Zap;

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
      const reply = await sendAIMessage([systemMsg, ...history.slice(-8)]);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚡ Connection issue — try again in a moment!' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 160px)',   // account for header + bottom nav
      minHeight: 500,
      gap: 0,
    }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #F59E0B, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(245,158,11,0.4)',
          }}>
            <Dumbbell size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>GymCoach AI</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <PlanIcon size={10} /> Your personal trainer
            </div>
          </div>
        </div>
        <UsageBar used={usageCount} limit={limit} plan={plan} />
      </div>

      {/* ── Chat Messages ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 14,
          padding: '4px 0 8px',
          position: 'relative',
        }}
      >
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              position: 'absolute', bottom: 140, right: 20, zIndex: 10,
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <ChevronDown size={16} color="var(--text-2)" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Quick Actions (when chat is fresh) ── */}
      {messages.length <= 1 && !locked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 10 }}
        >
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={() => send(a.msg)}
              style={{
                background: 'rgba(245,158,11,0.07)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 20, padding: '5px 12px',
                fontSize: '0.75rem', color: 'var(--primary)',
                cursor: 'pointer', fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {a.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Upgrade prompt when locked ── */}
      {locked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '16px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(139,92,246,0.06))',
            border: '1px solid rgba(245,158,11,0.25)',
            textAlign: 'center', marginBottom: 8,
          }}
        >
          <Lock size={22} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Daily limit reached</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: 12 }}>
            Upgrade to <strong style={{ color: 'var(--primary)' }}>{UPGRADE_FOR[plan]}</strong> for more messages
          </div>
          <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            Upgrade Plan ↗
          </button>
        </motion.div>
      )}

      {/* ── Input ── */}
      {!locked && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end',
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="form-input no-scrollbar"
            placeholder="Ask your coach… (Enter to send, Shift+Enter for newline)"
            disabled={loading}
            rows={1}
            style={{
              flex: 1, resize: 'none', overflowY: 'hidden',
              minHeight: 40, maxHeight: 100,
              fontSize: '0.88rem', lineHeight: 1.5,
              paddingTop: 10, paddingBottom: 10,
            }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, flexShrink: 0,
              borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                : 'var(--surface-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() ? '0 0 16px rgba(245,158,11,0.5)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Send size={16} color={input.trim() && !loading ? 'white' : 'var(--text-4)'} />
          </motion.button>
        </div>
      )}
    </div>
  );
}

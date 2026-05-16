/**
 * AdminAI — Floating AI panel for gym administrators
 * Unlimited usage · Groq primary · Gemini backup · offline fallback
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Maximize2, Sparkles, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendAIMessage, buildAdminPrompt } from '../../hooks/useGymAI';


const QUICK_PROMPTS = [
  'Which members are at risk of churning?',
  'How can I increase revenue this month?',
  'Suggest a weekend promotion idea',
  'Who should I contact for renewal today?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', gap: 8, alignItems: 'flex-start',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--primary)' : 'linear-gradient(135deg,#7C3AED,#A855F7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 800, color: isUser ? '#000' : '#fff',
      }}>
        {isUser ? 'A' : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '80%', padding: '10px 14px', borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        background: isUser ? 'var(--primary)' : 'var(--surface-2)',
        color: isUser ? '#000' : 'var(--text-1)',
        fontSize: '0.83rem', lineHeight: 1.55, fontWeight: isUser ? 600 : 400,
        border: isUser ? 'none' : '1px solid var(--border)',
      }}>
        {isUser ? msg.content : (
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminAI() {
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "PROTOCOL_ACTIVE: GYMFLOW_EXECUTIVE_INTELLIGENCE_v4.0. Strategic advisory nodes fully operational. Standing by for operational inquiries regarding fiscal velocity, attrition risks, or utilization metrics.",
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const systemMsg = {
    role: 'system',
    content: buildAdminPrompt({
      totalMembers: 0,
      activeMembers: 0,
      expiringSoon: 0,
      revenueThisMonth: 0,
      todayCheckins: 0,
      avgAttendance: 0,
    })
  };

  async function send(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: userText };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const reply = await sendAIMessage([systemMsg, ...history.slice(-8)]);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  const panelW = expanded ? 520 : 360;
  const panelH = expanded ? 600 : 460;

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 999,
              width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
              boxShadow: '0 0 0 0 rgba(168,85,247,0.4), 0 8px 24px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'aiPulse 2.5s infinite',
            }}
          >
            <Sparkles size={24} color="white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{
              position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
              width: panelW, height: panelH,
              background: 'linear-gradient(180deg, #0F0F12 0%, #0A0A0D 100%)',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: 20,
              boxShadow: '0 0 60px rgba(168,85,247,0.15), 0 24px 48px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              transition: 'width 0.3s, height 0.3s',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid rgba(168,85,247,0.2)',
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(90deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(168,85,247,0.5)',
              }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-1)' }}>GymFlow Intelligence</div>
                <div style={{ fontSize: '0.68rem', color: '#A855F7', fontWeight: 600 }}>
                  Admin AI · Unlimited · {loading ? 'Thinking…' : 'Online'}
                </div>
              </div>
              <button onClick={() => { setMessages([messages[0]]); }} title="Clear chat"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4 }}>
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setExpanded(e => !e)} title="Expand"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4)', padding: 4 }}>
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }} className="no-scrollbar">
              {messages.map((m, i) => <Message key={i} msg={m} />)}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{ display: 'flex', gap: 5, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: '4px 18px 18px 18px', border: '1px solid var(--border)' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#A855F7' }} />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts (only when no prior exchanges) */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_PROMPTS.map(q => (
                  <button key={q} onClick={() => send(q)}
                    style={{
                      background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)',
                      borderRadius: 20, padding: '5px 12px', fontSize: '0.72rem', color: '#C084FC',
                      cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(168,85,247,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(168,85,247,0.08)'}
                  >{q}</button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(168,85,247,0.15)', display: 'flex', gap: 8 }}>
              <input
                ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                className="form-input" style={{ flex: 1, fontSize: '0.85rem', borderColor: 'rgba(168,85,247,0.3)' }}
                placeholder="Ask anything about your gym…"
                disabled={loading}
              />
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: input.trim() ? 'linear-gradient(135deg,#7C3AED,#A855F7)' : 'var(--surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s', flexShrink: 0,
                  boxShadow: input.trim() ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                }}>
                <Send size={15} color={input.trim() ? 'white' : 'var(--text-4)'} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes aiPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.4), 0 8px 24px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 0 12px rgba(168,85,247,0), 0 8px 24px rgba(0,0,0,0.4); }
        }
      `}</style>
    </>
  );
}

/**
 * MemberAIPage — Premium GymCoach AI
 * Route: /member/ai
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Send, Bot, Brain, Copy, Check, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import useAuthStore from '../../store/authStore';
import {
  sendAIMessage, buildMemberPrompt, useAIUsage
} from '../../hooks/useGymAI';
import CyberMatrix from '../../components/ui/CyberMatrix';

const QUICK_ACTIONS = [
  { label: '💪 Chest day', msg: 'Give me a complete chest workout for today' },
  { label: '🥗 Protein tips', msg: 'How much protein do I need daily for muscle gain?' },
  { label: '📋 Full plan', msg: 'Create a 30-day beginner workout plan for me.' },
];

// --- Sub-components ---

function Message({ msg }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard?.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '24px' }}
    >
      <div style={{ display: 'flex', gap: '12px', maxWidth: '85%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        
        {/* Avatar */}
        <div style={{ 
          width: '36px', height: '36px', borderRadius: '12px', flexShrink: 0,
          background: isUser ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: isUser ? '0 0 15px var(--primary)40' : 'none',
          marginTop: 'auto'
        }}>
          {isUser ? <Dumbbell size={16} color="black" /> : <Bot size={16} color="var(--primary)" />}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
          <div className={isUser ? '' : 'glass-card-premium'} style={{
            padding: '14px 18px',
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: isUser ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
            color: isUser ? 'black' : 'var(--text-1)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            fontWeight: isUser ? 500 : 400,
            boxShadow: isUser ? '0 8px 24px rgba(245,158,11,0.2)' : 'none',
            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ wordBreak: 'break-word' }} className="markdown-body">
              {isUser ? (
                 <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
          
          {!isUser && (
             <button
              onClick={copyText}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-4)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 0', opacity: 0.6, transition: 'opacity 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
            >
              {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy response'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MemberAIPage() {
  const { user } = useAuthStore();
  const { dailyCount, limit, remaining, refreshUsage } = useAIUsage();

  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Tactical Assessment Ready, ${user?.firstName || 'Recruit'}. State your objective.`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const locked = remaining <= 0 && limit !== Infinity;

  async function handleSend(text) {
    const userText = (text || input).trim();
    if (!userText || loading || locked) return;
    
    setInput('');
    const userMsg = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const reply = await sendAIMessage([{ role: 'system', content: buildMemberPrompt(user) }, ...messages, userMsg].slice(-10));
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      await refreshUsage();
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "⚡ System glitch. My neural circuits are cooling down. Try again in a minute." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      width: '100%',
      height: 'calc(100vh - 64px)', // Take full height minus brand header
      background: 'var(--bg)',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      paddingBottom: '84px' // Space for fixed bottom nav
    }}>
      <CyberMatrix intensity={0.04} />
      
      {/* STATIC HEADER */}
      <div style={{ 
        padding: '12px 20px', 
        background: 'rgba(9,9,11,0.6)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 30,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--primary)40'
          }}>
            <Brain size={20} color="black" />
          </div>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0, color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural Coach</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: '0.6rem', color: 'var(--text-4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sync Active</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '0.55rem', color: 'var(--text-4)', fontWeight: 800, marginBottom: '2px' }}>
            CAPACITY: {dailyCount}/{limit === Infinity ? '∞' : limit}
          </div>
          <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: limit === Infinity ? '100%' : `${(dailyCount/limit)*100}%` }}
              style={{ height: '100%', background: 'var(--primary)' }}
            />
          </div>
        </div>
      </div>

      {/* SCROLLABLE MESSAGE AREA */}
      <div className="no-scrollbar" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column',
        scrollBehavior: 'smooth',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '40px' }}>
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="var(--primary)" />
                </div>
                <div className="glass-card-premium" style={{ padding: '12px 20px', borderRadius: '18px', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <motion.div 
                        key={i} 
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }}
                        style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}
                      />
                    ))}
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', marginLeft: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Analyzing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} style={{ height: '10px' }} />
        </div>
      </div>

      {/* STATIC FOOTER / INPUT - "Sticking" just above the nav bar */}
      <div style={{ 
        padding: '16px 20px 24px', 
        background: 'linear-gradient(to top, rgba(9,9,11,1) 80%, transparent)',
        flexShrink: 0,
        zIndex: 150,
        position: 'fixed',
        bottom: '84px', // Exactly above the bottom nav height in layout
        left: 0,
        right: 0,
        pointerEvents: 'none'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', pointerEvents: 'auto' }}>
          {/* Quick Suggestions */}
          {!locked && messages.length < 3 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
              {QUICK_ACTIONS.map((a, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, background: 'rgba(245,158,11,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(a.msg)}
                  style={{
                    padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(245,158,11,0.15)', color: 'var(--text-2)',
                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {a.label}
                </motion.button>
              ))}
            </div>
          )}

          {locked ? (
            <div className="glass-card-premium" style={{ padding: '16px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ margin: 0, color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px' }}>QUOTA EXHAUSTED</p>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="State your objective..."
                  style={{ 
                    width: '100%', padding: '14px 20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', fontSize: '0.9rem',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(245,158,11,0.4)';
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.target.style.background = 'rgba(255,255,255,0.03)';
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--primary)30' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', 
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px var(--primary)20', flexShrink: 0,
                  opacity: (!input.trim() || loading) ? 0.5 : 1
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} color="black" /> : <Send size={20} color="black" />}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}

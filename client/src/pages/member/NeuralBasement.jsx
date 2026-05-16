import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Loader2, Send, Database, ShieldCheck, DownloadCloud } from 'lucide-react';
import { localAI } from '../../services/localAI.service';
import CyberMatrix from '../../components/ui/CyberMatrix';
import BackButton from '../../components/ui/BackButton';

export default function NeuralBasement() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isInit, setIsInit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const initializeAI = async () => {
        setLoading(true);
        try {
            await localAI.initialize((p) => {
                if (p.status === 'progress') setProgress(p.progress);
                if (p.status === 'done') setProgress(100);
            });
            setIsInit(true);
            setMessages([{ role: 'assistant', content: "Neural Basement protocols active. All intelligence is now running locally on your hardware. How can I assist your evolution today?" }]);
        } catch {
            setMessages([{ role: 'assistant', content: "Initialization failed. Check hardware compatibility." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const reply = await localAI.chat(input, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Local buffer overflow or model timeout." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 152px)', color: 'white', padding: '24px 16px' }}>
            <CyberMatrix intensity={0.08} />
            
            <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', z_index: 1 }}>
                <BackButton />
                
                <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>Neural <span style={{ color: 'var(--primary)' }}>Basement</span></h1>
                        <p style={{ color: 'var(--text-3)', fontSize: '1rem', margin: '4px 0 0' }}>Off-grid localized intelligence module</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 800 }}>
                           <Database size={14} color="var(--primary)" /> 400MB ON-DEVICE
                        </div>
                        <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>
                           <ShieldCheck size={14} /> 100% PRIVATE
                        </div>
                    </div>
                </header>

                {!isInit ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium" style={{ padding: 60, textAlign: 'center', borderRadius: 40 }}>
                        <DownloadCloud size={64} color="var(--primary)" style={{ marginBottom: 24, opacity: 0.5 }} />
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 16 }}>Initialize Local Core</h2>
                        <p style={{ color: 'var(--text-3)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                            Download the 400MB specialized gym model to your browser's persistent storage. Subsequent loads will be instant and 100% offline.
                        </p>
                        
                        {loading ? (
                            <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }}>
                                <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                                    <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary)' }} />
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-4)' }}>LOADING NEURAL LAYERS: {Math.round(progress)}%</div>
                            </div>
                        ) : (
                            <button onClick={initializeAI} className="btn-primary" style={{ padding: '16px 40px', borderRadius: 20, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12, margin: '0 auto' }}>
                                <Zap size={20} /> SYNC LOCAL CORE
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div style={{ height: '65vh', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 16 }} className="no-scrollbar">
                            {messages.map((m, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                                    style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                    <div style={{ 
                                        padding: '16px 20px', borderRadius: 24, 
                                        background: m.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        color: m.role === 'user' ? 'black' : 'white',
                                        fontWeight: m.role === 'user' ? 800 : 500,
                                        border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                                        fontSize: '0.95rem', lineHeight: 1.5
                                    }}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 12, alignItems: 'center', color: 'var(--text-4)', fontSize: '0.8rem', fontWeight: 800 }}>
                                    <Loader2 className="animate-spin" size={16} /> NEURAL PROCESSING...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
                            <input 
                                value={input} 
                                onChange={e => setInput(e.target.value)}
                                placeholder="Query the local gym engine..." 
                                style={{ 
                                    flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', 
                                    padding: '18px 24px', borderRadius: 20, color: 'white', outline: 'none', fontWeight: 600
                                }} 
                            />
                            <button disabled={loading} className="btn-primary" style={{ width: 60, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={24} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

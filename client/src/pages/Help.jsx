import { motion } from 'framer-motion';
import { 
  MessageSquare, Terminal, Database, Bot 
} from 'lucide-react';
import CyberMatrix from '../components/ui/CyberMatrix';
import BackButton from '../components/ui/BackButton';

const SECTIONS = [
  {
    title: 'Deployment & Core',
    icon: Terminal,
    items: [
      { q: 'How do I initialize the terminal?', a: 'Run `npm run seed` in the server directory to establish initial elite protocols.' },
      { q: 'What is the Neural Basement?', a: 'A local-first AI module (<400MB) that runs 100% privately on your hardware.' }
    ]
  },
  {
    title: 'Member Protocols',
    icon: Database,
    items: [
      { q: 'How are QR codes generated?', a: 'QR codes are dynamically generated based on your unique Gym ID for secure member onboarding.' },
      { q: 'Can I export member data?', a: 'Yes, use the EXPORT CSV button in the Member Directory for workforce audits.' }
    ]
  },
  {
    title: 'AI Coaching',
    icon: Bot,
    items: [
      { q: 'Which AI models are used?', a: 'Groq (Llama 3.1) for coaching and Gemini Pro Vision for nutrition scanning.' },
      { q: 'Are there usage limits?', a: 'Yes, strict rate limits (10 req/15 min) are enforced to protect your cloud quotas.' }
    ]
  }
];

export default function Help() {
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 152px)', color: 'white', padding: '24px 16px' }}>
      <CyberMatrix intensity={0.05} />
      
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <BackButton />
        
        <header style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>Command <span style={{ color: 'var(--primary)' }}>Support</span></h1>
          <p style={{ color: 'var(--text-3)', fontSize: '1.1rem', marginTop: 8 }}>Knowledge base for the GymFlow Pro ecosystem</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
          {SECTIONS.map((section, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <section.icon size={20} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{section.title}</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ paddingLeft: 12, borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4, color: 'var(--text-2)' }}>{item.q}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-4)', lineHeight: 1.5 }}>{item.a}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: 40, borderRadius: 32, textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,158,11,0.05), rgba(236,72,153,0.05))' }}>
           <MessageSquare size={48} color="var(--primary)" style={{ marginBottom: 20, opacity: 0.5 }} />
           <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 12 }}>Need Direct Intelligence?</h2>
           <p style={{ color: 'var(--text-3)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px' }}>
             Our neural support engineers are available for high-level technical integration and architectural guidance.
           </p>
           <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" style={{ padding: '12px 32px', borderRadius: 16, fontWeight: 900 }}>OPEN TICKET</button>
              <button className="btn-ghost" style={{ padding: '12px 32px', borderRadius: 16, fontWeight: 900, border: '1px solid rgba(255,255,255,0.1)' }}>CHAT LIVE</button>
           </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, Home } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical System Failure:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          background: '#09090b', 
          color: '#fff', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ 
              maxWidth: 450, 
              padding: 40, 
              borderRadius: 32, 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)'
            }}
          >
            <div style={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              background: 'rgba(239, 68, 68, 0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 24px' 
            }}>
              <ShieldAlert size={40} color="#ef4444" />
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>
              System <span style={{ color: '#ef4444' }}>Halt</span>
            </h1>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 32 }}>
              A critical protocol error occurred. Our automated diagnostics have been notified. Please refresh or return home.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: 16, 
                  background: '#fff', 
                  color: '#000', 
                  fontWeight: 800, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <RefreshCcw size={18} /> Refresh
              </motion.button>
              
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: 16, 
                  background: 'rgba(255,255,255,0.05)', 
                  color: '#fff', 
                  fontWeight: 800, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                <Home size={18} /> Home
              </motion.button>
            </div>

            {import.meta.env.DEV && (
              <div style={{ marginTop: 32, padding: 16, background: '#000', borderRadius: 12, textAlign: 'left', fontSize: '0.7rem', color: '#ef4444', overflow: 'auto', maxHeight: 150 }}>
                {this.state.error?.toString()}
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

import { motion } from 'framer-motion';

/**
 * NeuralGIF Component
 * Professional-grade GIF player for local high-quality exercise assets.
 * Includes Cyber Protocol styling (Scan-beams, glow).
 */
export default function NeuralGIF({ gifPath, className, style }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: 'inherit', overflow: 'hidden', ...style }} className={className}>
      {/* Grid Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
      
      {/* Animated Scan Line */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }} 
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'var(--primary)', zIndex: 3, boxShadow: '0 0 20px var(--primary)', opacity: 0.6 }} 
      />

      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={gifPath} 
          alt="Exercise Demonstration" 
          style={{ 
            width: '90%', 
            height: '90%', 
            objectFit: 'contain', 
            mixBlendMode: 'screen',
            filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 0 15px rgba(245,158,11,0.4))'
          }}
          onError={(e) => {
            // Fallback to a placeholder if the local GIF hasn't been downloaded yet
            e.target.src = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0001-2gPfomN.gif';
          }}
        />
      </div>

      {/* Protocol Label */}
      <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, fontSize: '0.5rem', color: 'var(--primary)', fontWeight: 900, letterSpacing: 1, zIndex: 5 }}>
        LIVE_DEMO_PROTOCOL
      </div>
    </div>
  );
}

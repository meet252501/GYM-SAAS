import React from 'react';

/**
 * CyberMatrix - A reusable high-fidelity background for the GymFlow Pro ecosystem.
 * Features:
 * - Matrix-style grid grid
 * - Dynamic glows
 * - Subtle animation potential
 */
const CyberMatrix = ({ opacity = 0.5, gridColor = 'rgba(255,255,255,0.03)' }) => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      background: '#000',
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {/* The Matrix Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(${gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        opacity: opacity
      }} />

      {/* Dynamic Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
        filter: 'blur(100px)'
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        filter: 'blur(100px)'
      }} />

      {/* Subtle Scanline Effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
        backgroundSize: '100% 4px, 3px 100%',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default CyberMatrix;

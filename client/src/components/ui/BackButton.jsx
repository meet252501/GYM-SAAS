import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BackButton({ to, label = 'Back', style = {} }) {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{ x: -4, backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'var(--text-3)',
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: '24px',
        ...style
      }}
    >
      <ChevronLeft size={18} />
      {label}
    </motion.button>
  );
}

import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};

export default function BentoCard({ children, className = '', style = {}, onClick, delay = 0 }) {
  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`glass-card-premium ${className}`}
      style={{
        padding: '20px',
        borderRadius: '24px',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

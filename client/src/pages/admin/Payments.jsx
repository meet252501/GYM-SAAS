import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownRight, Download, Search, CheckCircle, X } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  { id: 'INV-001', member: 'Alex Johnson', date: '2025-05-06', amount: 120, status: 'Completed', plan: 'Premium Plan' },
  { id: 'INV-002', member: 'Sarah Chen', date: '2025-05-05', amount: 80, status: 'Completed', plan: 'Basic Plan' },
  { id: 'INV-003', member: 'Mike Ross', date: '2025-05-04', amount: 150, status: 'Pending', plan: 'Elite Plan' },
  { id: 'INV-004', member: 'Emma Davis', date: '2025-05-03', amount: 120, status: 'Completed', plan: 'Premium Plan' },
  { id: 'INV-005', member: 'James Wilson', date: '2025-05-01', amount: 80, status: 'Failed', plan: 'Basic Plan' },
  { id: 'INV-006', member: 'Priya Patel', date: '2025-04-30', amount: 150, status: 'Completed', plan: 'Elite Plan' },
  { id: 'INV-007', member: 'Carlos Ruiz', date: '2025-04-28', amount: 80, status: 'Completed', plan: 'Basic Plan' },
];

export default function Payments() {
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const filtered = MOCK_TRANSACTIONS.filter(tx =>
    tx.member.toLowerCase().includes(search.toLowerCase()) ||
    tx.id.toLowerCase().includes(search.toLowerCase()) ||
    tx.plan.toLowerCase().includes(search.toLowerCase())
  );

  function handleDownload(tx) {
    setToast(`Downloaded ${tx.id}.pdf`);
    setTimeout(() => setToast(null), 2500);
  }

  const statusStyle = status => ({
    Completed: 'badge-active',
    Pending: 'badge-trial',
    Failed: 'badge-expired',
  }[status] || 'badge-expired');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed', top: 80, right: 24, zIndex: 200,
              background: 'var(--success)', color: 'white', padding: '10px 18px',
              borderRadius: 16, fontWeight: 700, fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(16,185,129,0.4)'
            }}
          >
            <CheckCircle size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid-3">
        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-icon stat-icon-green"><DollarSign size={24} className="text-success" /></div>
          <div>
            <div className="stat-value">$12,450</div>
            <div className="stat-label">Total Revenue (MTD)</div>
            <div className="stat-change up"><ArrowUpRight size={14} /> +8.4%</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-icon stat-icon-amber"><CreditCard size={24} className="text-primary" /></div>
          <div>
            <div className="stat-value">145</div>
            <div className="stat-label">Successful Payments</div>
            <div className="stat-change up"><ArrowUpRight size={14} /> +12 this week</div>
          </div>
        </motion.div>

        <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-icon stat-icon-red"><ArrowDownRight size={24} className="text-danger" /></div>
          <div>
            <div className="stat-value">3</div>
            <div className="stat-label">Failed Transactions</div>
            <div className="stat-change down">Action Required</div>
          </div>
        </motion.div>
      </div>

      {/* Table Card */}
      <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex justify-between items-center" style={{ padding: '4px 0 20px', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            Recent Transactions
            <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-3)', fontWeight: 400 }}>
              ({filtered.length} result{filtered.length !== 1 ? 's' : ''})
            </span>
          </h3>
          <div className="input-wrapper" style={{ width: 260 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Search invoice, name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  layout
                >
                  <td style={{ fontWeight: 600, color: 'var(--text-2)' }}>{tx.id}</td>
                  <td style={{ fontWeight: 600 }}>{tx.member}</td>
                  <td className="text-muted">{tx.plan}</td>
                  <td className="text-muted">{tx.date}</td>
                  <td style={{ fontWeight: 700 }}>${tx.amount}</td>
                  <td>
                    <span className={`badge ${statusStyle(tx.status)}`}>{tx.status}</span>
                  </td>
                  <td>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Download Invoice"
                      onClick={() => handleDownload(tx)}
                    >
                      <Download size={16} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '32px 0' }}>
                      <Search className="empty-icon" />
                      <div className="empty-title">No results found</div>
                      <div className="empty-desc">Try a different search term.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}

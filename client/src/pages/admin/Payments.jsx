import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, ArrowDownRight, 
  Download, Search, Plus, 
  Receipt, FileText
} from 'lucide-react';
import { paymentApi } from '../../api';
import MemberSelector from '../../components/ui/MemberSelector';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import CyberMatrix from '../../components/ui/CyberMatrix';

export default function Payments() {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, successful: 0, failed: 0 });

  const [recordForm, setRecordForm] = useState({ 
    memberId: '', 
    type: 'membership', 
    amount: '', 
    paidAt: new Date().toISOString().split('T')[0], 
    notes: '' 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, statsRes] = await Promise.all([
        paymentApi.getAll({ limit: 50 }),
        paymentApi.getStats(30)
      ]);

      setTransactions(txRes.data.data || []);
      
      const statsData = statsRes.data.data || [];
      const totalRev = statsData.reduce((sum, s) => sum + s.revenue, 0);
      const totalCount = statsData.reduce((sum, s) => sum + s.count, 0);
      
      setStats({
        revenue: totalRev,
        successful: totalCount,
        failed: 0 
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Calling fetchData() in a setTimeout to avoid cascading render warning in some strict lint environments
    const timer = setTimeout(fetchData, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const filtered = transactions.filter(tx =>
    tx.memberName?.toLowerCase().includes(search.toLowerCase()) ||
    tx._id?.toLowerCase().includes(search.toLowerCase()) ||
    tx.type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!recordForm.memberId) return toast.error("Please select a member");
    
    try {
      await paymentApi.record({
        ...recordForm,
        amount: parseFloat(recordForm.amount),
        gateway: 'cash'
      });
      
      setIsRecordModalOpen(false);
      setRecordForm({ memberId: '', type: 'membership', amount: '', paidAt: new Date().toISOString().split('T')[0], notes: '' });
      toast.success(`Recorded ₹${recordForm.amount} payment`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const statusStyle = status => ({
    completed: 'badge-active',
    pending: 'badge-trial',
    failed: 'badge-expired',
    refunded: 'badge-expired',
  }[status] || 'badge-expired');

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      <CyberMatrix opacity={0.03} />
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="page-layout"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}
      >
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Financials</h1>
          <p className="text-faint">Track revenue, invoices, and payment history</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" onClick={() => toast.success("Exporting...")}>
            <Download size={18} /> Export
          </button>
          <button className="btn btn-primary" onClick={() => setIsRecordModalOpen(true)}>
            <Plus size={18} /> Record Payment
          </button>
        </div>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><DollarSign size={24} /></div>
          <div>
            <div className="stat-value">₹{loading ? '...' : stats.revenue.toLocaleString('en-IN')}</div>
            <div className="stat-label">30-Day Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><Receipt size={24} /></div>
          <div>
            <div className="stat-value">{loading ? '...' : stats.successful}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red"><ArrowDownRight size={24} /></div>
          <div>
            <div className="stat-value">{stats.failed}</div>
            <div className="stat-label">Pending / Failed</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div className="input-wrapper" style={{ width: 320 }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="form-input"
              placeholder="Filter by member or invoice ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Member</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: 14, width: 80 }} /></td>
                    <td><div className="skeleton" style={{ height: 20, width: 150 }} /></td>
                    <td><div className="skeleton" style={{ height: 24, width: 80, borderRadius: 12 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 100 }} /></td>
                    <td><div className="skeleton" style={{ height: 16, width: 60 }} /></td>
                    <td><div className="skeleton" style={{ height: 24, width: 80, borderRadius: 12 }} /></td>
                    <td><div className="skeleton" style={{ height: 32, width: 32, borderRadius: 8 }} /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '80px 0', textAlign: 'center' }}>
                    <Receipt size={48} className="text-faint mb-4" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <h3 style={{ color: 'var(--text-2)' }}>No transactions found</h3>
                    <p className="text-faint">Try adjusting your search or record a new payment.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx._id} className="hoverable-row">
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      #{tx._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ fontWeight: 600 }}>{tx.memberName}</td>
                    <td>
                      <span className="badge badge-common" style={{ textTransform: 'capitalize' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${statusStyle(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td>
                      <button className="btn-icon text-faint" onClick={() => toast.success("Invoice view coming soon")}>
                        <FileText size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} title="Record Payment">
        <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MemberSelector 
            selectedId={recordForm.memberId}
            onSelect={id => setRecordForm({...recordForm, memberId: id})}
          />

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select" 
                value={recordForm.type}
                onChange={e => setRecordForm({...recordForm, type: e.target.value})}
              >
                <option value="membership">Membership Renewal</option>
                <option value="class">Class Fee</option>
                <option value="product">Supplement / Product</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                required 
                placeholder="0.00"
                value={recordForm.amount}
                onChange={e => setRecordForm({...recordForm, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={recordForm.paidAt}
              onChange={e => setRecordForm({...recordForm, paidAt: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              className="form-input" 
              rows={2}
              placeholder="Add any additional details..."
              value={recordForm.notes}
              onChange={e => setRecordForm({...recordForm, notes: e.target.value})}
            />
          </div>

          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsRecordModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}

import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const inputStyle = {
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'white',
  fontSize: '0.875rem',
  outline: 'none',
};

const Deals = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ── ApiFeatures query state ──────────────────────────────
  const [search, setSearch] = useState('');
  const [stage, setStage]   = useState('');
  const [sort, setSort]     = useState('-createdAt');
  const [page, setPage]     = useState(1);
  const LIMIT = 10;

  // ── Modal state ──────────────────────────────────────────
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal]   = useState(null);
  const [formData, setFormData] = useState({
    title: '', contact: '', value: '', currency: 'EGP', stage: 'lead', expectedCloseDate: '', notes: ''
  });

  // ── Build query string → sent to ApiFeatures on the backend ──
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search) { params.set('title[regex]', search); params.set('title[options]', 'i'); } // ApiFeatures.filter()
    if (stage)  params.set('stage', stage);
    params.set('sort', sort);                          // ApiFeatures.sort()
    params.set('page', page);                          // ApiFeatures.paginate()
    params.set('limit', LIMIT);
    return params.toString();
  }, [search, stage, sort, page]);

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      const [dealsRes, contactsRes] = await Promise.all([
        api.get(`/deals?${buildQuery()}`),
        api.get('/contacts?limit=200'),
      ]);
      setDeals(dealsRes.data.data.deals || dealsRes.data.data || []);
      setTotal(dealsRes.data.results ?? dealsRes.data.total ?? 0);
      setContacts(contactsRes.data.data.contacts || contactsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchDeals(); }, [fetchDeals]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (['owner', 'admin'].includes(user?.role)) {
        try {
          const res = await api.get('/users');
          setUsers(res.data.data.users || res.data.data || []);
        } catch (err) { console.error('Error fetching users:', err); }
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStageChange  = (e) => { setStage(e.target.value);  setPage(1); };
  const handleSortChange   = (e) => { setSort(e.target.value);   setPage(1); };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Form helpers ─────────────────────────────────────────
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setFormData({ title: '', contact: '', value: '', currency: 'EGP', stage: 'lead', expectedCloseDate: '', notes: '' });
    setShowAddModal(true);
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title || '',
      contact: deal.contact?._id || deal.contact || '',
      value: deal.value || '',
      currency: deal.currency || 'EGP',
      stage: deal.stage || 'lead',
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
      notes: deal.notes || '',
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deals', { ...formData, value: Number(formData.value) || 0 });
      setShowAddModal(false);
      fetchDeals();
    } catch (err) { alert(err.response?.data?.message || 'Error creating deal'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentStage = selectedDeal.stage;
      const newStage = formData.stage;
      const { stage: _stage, ...updateData } = formData;
      await api.patch(`/deals/${selectedDeal._id}`, { ...updateData, value: Number(updateData.value) || 0 });
      if (newStage !== currentStage) {
        await api.patch(`/deals/${selectedDeal._id}/stage`, { stage: newStage });
      }
      setShowEditModal(false);
      fetchDeals();
    } catch (err) { alert(err.response?.data?.message || 'Error updating deal'); }
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [dealToAssign, setDealToAssign] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const openAssignModal = (deal) => {
    setDealToAssign(deal);
    setSelectedAssignee(deal.assignedTo?._id || deal.assignedTo || '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/deals/${dealToAssign._id}/assign`, { assignedTo: selectedAssignee });
      setShowAssignModal(false);
      fetchDeals();
    } catch (err) { alert(err.response?.data?.message || 'Error assigning deal'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this deal?')) {
      try {
        await api.delete(`/deals/${id}`);
        fetchDeals();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting deal'); }
    }
  };

  const stageColor = (s) => ({
    lead:      { bg: 'rgba(79,70,229,0.2)',   fg: '#818cf8' },
    qualified: { bg: 'rgba(59,130,246,0.2)',  fg: '#60a5fa' },
    proposal:  { bg: 'rgba(245,158,11,0.2)',  fg: '#fbbf24' },
    won:       { bg: 'rgba(16,185,129,0.2)',  fg: '#34d399' },
    lost:      { bg: 'rgba(239,68,68,0.2)',   fg: '#f87171' },
  }[s] || { bg: 'rgba(255,255,255,0.1)', fg: '#e2e8f0' });

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Active Deals</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Create Deal</button>
      </div>

      {/* ── Toolbar — uses ApiFeatures on the backend ─────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 180px' }}
          placeholder="🔍 Search by title…"
          value={search}
          onChange={handleSearchChange}
        />
        <select style={{ ...inputStyle, flex: '0 0 150px' }} value={stage} onChange={handleStageChange}>
          <option value="">All Stages</option>
          <option value="lead">Lead</option>
          <option value="qualified">Qualified</option>
          <option value="proposal">Proposal</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <select style={{ ...inputStyle, flex: '0 0 190px' }} value={sort} onChange={handleSortChange}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-value">Highest Value</option>
          <option value="value">Lowest Value</option>
          <option value="title">Title A→Z</option>
        </select>
        {(search || stage) && (
          <button
            onClick={() => { setSearch(''); setStage(''); setPage(1); }}
            style={{ ...inputStyle, cursor: 'pointer', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading deals…</p>
      ) : deals.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No deals match your filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Deal Title', 'Contact', 'Value', 'Stage', 'Close Date', 'Assignee', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const sc = stageColor(deal.stage);
                return (
                  <tr key={deal._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{deal.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{deal.contact?.name || '—'}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--secondary)', whiteSpace: 'nowrap' }}>
                      {deal.value?.toLocaleString()} {deal.currency || 'EGP'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.fg, textTransform: 'capitalize' }}>
                        {deal.stage}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {deal.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {['owner', 'admin'].includes(user?.role) && (
                        <button onClick={() => openAssignModal(deal)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Assign</button>
                      )}
                      <button onClick={() => openEditModal(deal)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(deal._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>Next →</button>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Deal' : 'Create New Deal'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="title" placeholder="Deal Name" value={formData.title} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <select required name="contact" value={formData.contact} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }}>
                <option value="" disabled>Select Associated Contact</option>
                {contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input required type="number" name="value" placeholder="Deal Value" value={formData.value} onChange={handleInputChange} style={{ ...inputStyle, flex: 2, padding: '0.75rem' }} />
                <select name="currency" value={formData.currency} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select name="stage" value={formData.stage} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="lead">Lead</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
                <input type="date" name="expectedCloseDate" value={formData.expectedCloseDate} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }} title="Expected Close Date" />
              </div>
              <textarea name="notes" placeholder="Notes…" value={formData.notes} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem', minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Save Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Modal ───────────────────────────────────── */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assign Deal</h3>
            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select required value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} style={{ ...inputStyle, padding: '0.75rem' }}>
                <option value="" disabled>Select User</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAssignModal(false)} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;

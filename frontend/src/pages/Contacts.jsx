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

const Contacts = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // ── ApiFeatures query state ──────────────────────────────
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [sort, setSort]       = useState('-createdAt');
  const [page, setPage]       = useState(1);
  const LIMIT = 10;

  // ── Modal state ──────────────────────────────────────────
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', source: 'other', status: 'new', notes: ''
  });

  // ── Build query string → sent to ApiFeatures on the backend ──
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (search) { params.set('name[regex]', search); params.set('name[options]', 'i'); } // backend: ApiFeatures.filter()
    if (status)  params.set('status', status);
    params.set('sort', sort);                          // backend: ApiFeatures.sort()
    params.set('page', page);                          // backend: ApiFeatures.paginate()
    params.set('limit', LIMIT);
    return params.toString();
  }, [search, status, sort, page]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contacts?${buildQuery()}`);
      setContacts(res.data.data.contacts || res.data.data || []);
      setTotal(res.data.results ?? res.data.total ?? 0);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  // Re-fetch whenever any filter/sort/page changes
  useEffect(() => { fetchContacts(); }, [fetchContacts]);

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

  // Reset to page 1 when filters change
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatusChange = (e) => { setStatus(e.target.value); setPage(1); };
  const handleSortChange   = (e) => { setSort(e.target.value);   setPage(1); };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Form helpers ─────────────────────────────────────────
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setFormData({ name: '', email: '', phone: '', source: 'other', status: 'new', notes: '' });
    setShowAddModal(true);
  };

  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '', email: contact.email || '', phone: contact.phone || '',
      source: contact.source || 'other', status: contact.status || 'new', notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', formData);
      setShowAddModal(false);
      fetchContacts();
    } catch (err) { alert(err.response?.data?.message || 'Error creating contact'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/contacts/${selectedContact._id}`, formData);
      setShowEditModal(false);
      fetchContacts();
    } catch (err) { alert(err.response?.data?.message || 'Error updating contact'); }
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [contactToAssign, setContactToAssign] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const openAssignModal = (contact) => {
    setContactToAssign(contact);
    setSelectedAssignee(contact.assignedTo?._id || contact.assignedTo || '');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/contacts/${contactToAssign._id}/assign`, { assignedTo: selectedAssignee });
      setShowAssignModal(false);
      fetchContacts();
    } catch (err) { alert(err.response?.data?.message || 'Error assigning contact'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting contact'); }
    }
  };

  const statusColor = (s) => ({
    new:       { bg: 'rgba(79,70,229,0.2)',   fg: '#818cf8' },
    contacted: { bg: 'rgba(245,158,11,0.2)',  fg: '#fbbf24' },
    qualified: { bg: 'rgba(16,185,129,0.2)',  fg: '#34d399' },
    lost:      { bg: 'rgba(239,68,68,0.2)',   fg: '#f87171' },
  }[s] || { bg: 'rgba(255,255,255,0.1)', fg: '#e2e8f0' });

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Page header ──────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>All Contacts</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Add Contact</button>
      </div>

      {/* ── Toolbar — uses ApiFeatures on the backend ─────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: '1 1 180px' }}
          placeholder="🔍 Search by name…"
          value={search}
          onChange={handleSearchChange}
        />
        <select style={{ ...inputStyle, flex: '0 0 150px' }} value={status} onChange={handleStatusChange}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="lost">Lost</option>
        </select>
        <select style={{ ...inputStyle, flex: '0 0 180px' }} value={sort} onChange={handleSortChange}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="name">Name A→Z</option>
          <option value="-name">Name Z→A</option>
        </select>
        {(search || status) && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setPage(1); }}
            style={{ ...inputStyle, cursor: 'pointer', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading contacts…</p>
      ) : contacts.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No contacts match your filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                {['Name', 'Email', 'Phone', 'Status', 'Source', 'Created', 'Assignee', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => {
                const sc = statusColor(c.status);
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{c.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{c.email || '—'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.fg }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{c.source || '—'}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {c.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {['owner', 'admin'].includes(user?.role) && (
                        <button onClick={() => openAssignModal(c)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Assign</button>
                      )}
                      <button onClick={() => openEditModal(c)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(c._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
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
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
          >← Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
          >Next →</button>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────── */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Contact' : 'Add New Contact'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                </select>
                <select name="source" value={formData.source} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <textarea name="notes" placeholder="Notes…" value={formData.notes} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem', minHeight: '80px', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Save Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Modal ───────────────────────────────────── */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Assign Contact</h3>
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

export default Contacts;

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const inputStyle = {
  padding: '0.6rem 0.85rem',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'white',
  fontSize: '0.875rem',
  outline: 'none',
};

const typeIcon  = { call: '📞', email: '✉️', meeting: '🤝', note: '📝', task_created: '✅', deal_created: '💼' };
const typeColor = { call: '#3b82f6', email: '#8b5cf6', meeting: '#f59e0b', note: '#10b981', task_created: '#64748b', deal_created: '#ec4899' };

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts]     = useState([]);
  const [deals, setDeals]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);

  // ── ApiFeatures query state ──────────────────────────────
  const [type, setType]   = useState('');
  const [sort, setSort]   = useState('-createdAt');
  const [page, setPage]   = useState(1);
  const LIMIT = 10;

  // ── Modal state ──────────────────────────────────────────
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: '', type: 'note', description: '', relatedTo: '', relatedId: '', metadata: ''
  });

  // ── Build query string → sent to ApiFeatures on the backend ──
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);              // ApiFeatures.filter()
    params.set('sort', sort);                         // ApiFeatures.sort()
    params.set('page', page);                         // ApiFeatures.paginate()
    params.set('limit', LIMIT);
    return params.toString();
  }, [type, sort, page]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [actRes, contactsRes, dealsRes] = await Promise.all([
        api.get(`/activities?${buildQuery()}`),
        api.get('/contacts?limit=200'),
        api.get('/deals?limit=200'),
      ]);
      setActivities(actRes.data.data.activities || actRes.data.data || []);
      setTotal(actRes.data.results ?? actRes.data.total ?? 0);
      setContacts(contactsRes.data.data.contacts || contactsRes.data.data || []);
      setDeals(dealsRes.data.data.deals || dealsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTypeChange = (e) => { setType(e.target.value); setPage(1); };
  const handleSortChange = (e) => { setSort(e.target.value); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // ── Form helpers ─────────────────────────────────────────
  const handleInputChange = (e) => {
    if (e.target.name === 'relatedTo') {
      setFormData({ ...formData, relatedTo: e.target.value, relatedId: '' });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const openAddModal = () => {
    setFormData({ title: '', type: 'note', description: '', relatedTo: '', relatedId: '', metadata: '' });
    setShowAddModal(true);
  };

  const openEditModal = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      title: activity.title || '', type: activity.type || 'note',
      description: activity.description || '', relatedTo: activity.relatedTo || '',
      relatedId: activity.relatedId?._id || activity.relatedId || '',
      metadata: activity.metadata ? JSON.stringify(activity.metadata) : '',
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (!payload.relatedTo) { delete payload.relatedTo; delete payload.relatedId; }
      if (payload.metadata) { try { payload.metadata = JSON.parse(payload.metadata); } catch (_) {} }
      else delete payload.metadata;
      await api.post('/activities', payload);
      setShowAddModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error creating activity'); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (!payload.relatedTo) { payload.relatedTo = null; payload.relatedId = null; }
      if (payload.metadata && typeof payload.metadata === 'string') {
        try { payload.metadata = JSON.parse(payload.metadata); } catch (_) {}
      }
      await api.patch(`/activities/${selectedActivity._id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error updating activity'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently delete this activity?')) {
      try {
        await api.delete(`/activities/${id}`);
        fetchData();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting activity'); }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Page header ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Recent Activities & Logs</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Log Activity</button>
      </div>

      {/* ── Toolbar — uses ApiFeatures on the backend ─────── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select style={{ ...inputStyle, flex: '0 0 165px' }} value={type} onChange={handleTypeChange}>
          <option value="">All Types</option>
          <option value="note">📝 Note</option>
          <option value="call">📞 Call</option>
          <option value="email">✉️ Email</option>
          <option value="meeting">🤝 Meeting</option>
          <option value="task_created">✅ Task Created</option>
          <option value="deal_created">💼 Deal Created</option>
        </select>
        <select style={{ ...inputStyle, flex: '0 0 185px' }} value={sort} onChange={handleSortChange}>
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="title">Title A→Z</option>
        </select>
        {type && (
          <button onClick={() => { setType(''); setPage(1); }} style={{ ...inputStyle, cursor: 'pointer', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}>
            ✕ Clear
          </button>
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {total > 0 ? `${total} log${total !== 1 ? 's' : ''} found` : ''}
        </span>
      </div>

      {/* ── Activity feed ─────────────────────────────────── */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading activity logs…</p>
      ) : activities.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No activities match your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.map((activity) => (
            <div key={activity._id} className="stat-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.25rem 1.5rem' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `${typeColor[activity.type] || '#64748b'}20`,
                color: typeColor[activity.type] || '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
              }}>
                {typeIcon[activity.type] || '📝'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{activity.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    <button onClick={() => openEditModal(activity)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(activity._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Delete</button>
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: typeColor[activity.type] || '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {activity.type.replace('_', ' ')}
                  {activity.relatedTo && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', textTransform: 'none', fontWeight: 400 }}>→ linked to {activity.relatedTo}</span>}
                </div>
                {activity.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>{activity.description}</p>
                )}
                {activity.performedBy && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                      {activity.performedBy.name?.charAt(0) || 'U'}
                    </div>
                    Logged by {activity.performedBy.name || 'System'}
                  </div>
                )}
              </div>
            </div>
          ))}
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
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Activity' : 'Log New Activity'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input required name="title" placeholder="Event Title (e.g. Discovery Call)" value={formData.title} onChange={handleInputChange} style={{ ...inputStyle, flex: 2, padding: '0.75rem' }} />
                <select name="type" value={formData.type} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="note">General Note</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select name="relatedTo" value={formData.relatedTo} onChange={handleInputChange} style={{ ...inputStyle, flex: 1, padding: '0.75rem' }}>
                  <option value="">No Relation</option>
                  <option value="Contact">Related to Contact</option>
                  <option value="Deal">Related to Deal</option>
                </select>
                {formData.relatedTo && (
                  <select required name="relatedId" value={formData.relatedId} onChange={handleInputChange} style={{ ...inputStyle, flex: 2, padding: '0.75rem' }}>
                    <option value="" disabled>Select {formData.relatedTo}</option>
                    {formData.relatedTo === 'Contact' && contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    {formData.relatedTo === 'Deal' && deals.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                  </select>
                )}
              </div>
              <textarea name="description" placeholder="Notes from the activity…" value={formData.description} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem', minHeight: '80px', resize: 'vertical' }} />
              <input name="metadata" placeholder='Optional metadata JSON (e.g. {"duration": 30})' value={formData.metadata} onChange={handleInputChange} style={{ ...inputStyle, padding: '0.75rem' }} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); }} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Log Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;

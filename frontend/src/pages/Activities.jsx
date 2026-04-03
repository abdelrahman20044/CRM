import { useState, useEffect } from 'react';
import api from '../services/api';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'note',
    description: '',
    relatedTo: '',
    relatedId: '',
    metadata: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [actRes, contactsRes, dealsRes] = await Promise.all([
        api.get('/activities'),
        api.get('/contacts'),
        api.get('/deals')
      ]);
      setActivities(actRes.data.data.activities || actRes.data.data || []);
      setContacts(contactsRes.data.data.contacts || contactsRes.data.data || []);
      setDeals(dealsRes.data.data.deals || dealsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching activities data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      title: activity.title || '',
      type: activity.type || 'note',
      description: activity.description || '',
      relatedTo: activity.relatedTo || '',
      relatedId: activity.relatedId?._id || activity.relatedId || '',
      metadata: activity.metadata ? JSON.stringify(activity.metadata) : ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (!payload.relatedTo) {
         delete payload.relatedTo;
         delete payload.relatedId;
      }
      if (payload.metadata) {
         try { payload.metadata = JSON.parse(payload.metadata); } catch(e) {}
      } else {
          delete payload.metadata;
      }
      
      await api.post('/activities', payload);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating activity log');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload = { ...formData };
      if (!payload.relatedTo) {
         payload.relatedTo = null;
         payload.relatedId = null;
      }
      if (payload.metadata && typeof payload.metadata === 'string') {
         try { payload.metadata = JSON.parse(payload.metadata); } catch(e) {}
      }
      
      await api.patch(`/activities/${selectedActivity._id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating activity log');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this activity?')) {
      try {
        await api.delete(`/activities/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting activity');
      }
    }
  };

  const getTypeColor = (type) => {
    const map = {
        'call': '#3b82f6',
        'email': '#8b5cf6',
        'meeting': '#f59e0b',
        'note': '#10b981',
        'task_created': '#64748b',
        'deal_created': '#ec4899'
    };
    return map[type] || '#64748b';
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Recent Activities & Logs</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Log Activity</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading activity logs...</p>
      ) : activities.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No activities logged yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((activity) => (
                <div key={activity._id} className="stat-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.5rem' }}>
                    <div style={{ 
                        width: '48px', height: '48px', borderRadius: '12px', 
                        background: `${getTypeColor(activity.type)}20`,
                        color: getTypeColor(activity.type),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}>
                        {activity.type === 'email' ? '✉' : activity.type === 'call' ? '📞' : activity.type === 'meeting' ? '🤝' : '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{activity.title}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span>{new Date(activity.createdAt).toLocaleString()}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => openEditModal(activity)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Edit</button>
                                    <button onClick={() => handleDelete(activity._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Delete</button>
                                </div>
                            </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                            {activity.type.replace('_', ' ')}
                            {activity.relatedTo && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem', textTransform: 'none' }}>→ Linked to {activity.relatedTo}</span>}
                        </div>
                        {activity.description && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                {activity.description}
                            </p>
                        )}
                        {activity.performedBy && (
                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>
                                    {activity.performedBy.name?.charAt(0) || 'U'}
                                </div>
                                Logged by {activity.performedBy.name || 'System User'}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Activity' : 'Log New Activity'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                  <input required name="title" placeholder="Event Title (e.g. Discovery Call)" value={formData.title} onChange={handleInputChange} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                  <select name="type" value={formData.type} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                      <option value="note">General Note</option>
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                  </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                  <select name="relatedTo" value={formData.relatedTo} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                      <option value="">No Direct Relation</option>
                      <option value="Contact">Related to Contact</option>
                      <option value="Deal">Related to Deal</option>
                  </select>
                  
                  {formData.relatedTo && (
                    <select required name="relatedId" value={formData.relatedId} onChange={handleInputChange} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                        <option value="" disabled>Select {formData.relatedTo}</option>
                        {formData.relatedTo === 'Contact' && contacts.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        {formData.relatedTo === 'Deal' && deals.map(d => <option key={d._id} value={d._id}>{d.title}</option>)}
                    </select>
                  )}
              </div>

              <textarea name="description" placeholder="Notes from the activity..." value={formData.description} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', minHeight: '80px' }} />
              
              <input name="metadata" placeholder="Optional Metadata Tags (e.g. {'duration': 30})" value={formData.metadata} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
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

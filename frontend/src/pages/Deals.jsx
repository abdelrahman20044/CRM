import { useState, useEffect } from 'react';
import api from '../services/api';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', contact: '', value: '', currency: 'EGP', stage: 'lead', expectedCloseDate: '', notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealsRes, contactsRes] = await Promise.all([
        api.get('/deals'),
        api.get('/contacts')
      ]);
      setDeals(dealsRes.data.data.deals || dealsRes.data.data || []);
      setContacts(contactsRes.data.data.contacts || contactsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ title: '', contact: '', value: '', currency: 'EGP', stage: 'lead', expectedCloseDate: '', notes: '' });
    setShowAddModal(true);
  };

  const openEditModal = (deal) => {
    setSelectedDeal(deal);
    setFormData({
      title: deal.title || '',
      contact: deal.contact?._id || deal.contact || '', // handle populated contact object
      value: deal.value || '',
      currency: deal.currency || 'EGP',
      stage: deal.stage || 'lead',
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
      notes: deal.notes || ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/deals', { ...formData, value: Number(formData.value) || 0 });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating deal');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Stage changes use a dedicated endpoint
      const currentStage = selectedDeal.stage;
      const newStage = formData.stage;
      const { stage: _stage, ...updateData } = formData;

      await api.patch(`/deals/${selectedDeal._id}`, { ...updateData, value: Number(updateData.value) || 0 });

      if (newStage !== currentStage) {
        await api.patch(`/deals/${selectedDeal._id}/stage`, { stage: newStage });
      }

      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating deal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this deal?')) {
      try {
        await api.delete(`/deals/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting deal');
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Active Deals</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Create Deal</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading deals...</p>
      ) : deals.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No deals found in the pipeline. Create one!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Deal Title</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Contact</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Value</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Stage</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{deal.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{deal.contact?.name || 'Unknown'}</td>
                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--secondary)' }}>
                    ${deal.value?.toLocaleString()} {deal.currency || 'USD'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: deal.stage === 'won' ? 'rgba(16, 185, 129, 0.2)' : 
                                   deal.stage === 'lost' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                      color: deal.stage === 'won' ? '#34d399' : 
                             deal.stage === 'lost' ? '#f87171' : '#818cf8',
                      textTransform: 'capitalize'
                    }}>
                      {deal.stage}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(deal)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(deal._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Deal' : 'Create New Deal'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="title" placeholder="Deal Name (e.g. Website Redesign)" value={formData.title} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              
              <select required name="contact" value={formData.contact} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                <option value="" disabled>Select Associated Contact</option>
                {contacts.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <input required type="number" name="value" placeholder="Deal Value" value={formData.value} onChange={handleInputChange} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                <select name="currency" value={formData.currency} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                  <select name="stage" value={formData.stage} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                  </select>
                  <input type="date" name="expectedCloseDate" value={formData.expectedCloseDate} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} title="Expected Close Date" />
              </div>

              <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', minHeight: '80px' }} />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Save Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;

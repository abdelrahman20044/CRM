import { useState, useEffect } from 'react';
import api from '../services/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', source: 'other', status: 'new', notes: ''
  });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contacts');
      setContacts(res.data.data.contacts || res.data.data || []);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({ name: '', email: '', phone: '', source: 'other', status: 'new', notes: '' });
    setShowAddModal(true);
  };

  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      source: contact.source || 'other',
      status: contact.status || 'new',
      notes: contact.notes || ''
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contacts', formData);
      setShowAddModal(false);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating contact');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/contacts/${selectedContact._id}`, formData);
      setShowEditModal(false);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating contact');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting contact');
      }
    }
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>All Contacts</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Add Contact</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No contacts found. Add one to get started!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Created</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{contact.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{contact.email || '-'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: contact.status === 'new' ? 'rgba(79, 70, 229, 0.2)' : 
                                   contact.status === 'qualified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: contact.status === 'new' ? '#818cf8' : 
                             contact.status === 'qualified' ? '#34d399' : '#e2e8f0'
                    }}>
                      {contact.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => openEditModal(contact)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(contact._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Delete</button>
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
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Contact' : 'Add New Contact'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input required name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select name="status" value={formData.status} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="lost">Lost</option>
                </select>
                <select name="source" value={formData.source} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <textarea name="notes" placeholder="Notes..." value={formData.notes} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', minHeight: '80px' }} />
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Updates' : 'Save Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;

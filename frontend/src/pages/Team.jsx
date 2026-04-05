import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Team = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'sales_rep', password: '', passwordConfirm: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      // The backend returns users, make sure to handle differing response structures
      setUsers(res.data.data.users || res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
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
    setFormData({ name: '', email: '', role: 'sales_rep', password: '', passwordConfirm: '' });
    setShowAddModal(true);
  };

  const openEditModal = (targetUser) => {
    setSelectedUser(targetUser);
    setFormData({
      name: targetUser.name || '',
      role: targetUser.role || 'sales_rep'
    });
    setShowEditModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating team member');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        name: formData.name,
        role: formData.role
      };
      
      await api.patch(`/users/${selectedUser._id}`, updatePayload);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating team member');
    }
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this team member? They will lose access.')) {
      try {
        await api.delete(`/users/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deactivating team member');
      }
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm('Re-activate this team member?')) {
      try {
        await api.patch(`/users/${id}/activate`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error activating team member');
      }
    }
  };

  // Helper flags for permissions
  const canCreateAdmins = currentUser?.role === 'owner';

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500 }}>Team Workspace</h2>
        <button className="btn-primary" onClick={openAddModal}>+ Invite Member</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading team members...</p>
      ) : users.length === 0 ? (
        <div className="stat-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>No team members found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Role</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((targetUser) => {
                const isOwner = targetUser.role === 'owner';
                const isAdmin = targetUser.role === 'admin';
                const canEdit = !isOwner && !(currentUser.role === 'admin' && isAdmin);
                
                const isActive = targetUser.isActive !== false; // treat undefined as active
                return (
                  <tr key={targetUser._id} style={{ 
                    borderBottom: '1px solid var(--border)',
                    opacity: isActive ? 1 : 0.6,
                    background: targetUser._id === currentUser._id ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
                  }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      {targetUser.name}
                      {targetUser._id === currentUser._id && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>(You)</span>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{targetUser.email}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize', fontWeight: 500, color: isOwner ? 'var(--secondary)' : 'inherit' }}>{targetUser.role.replace('_', ' ')}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '6px', 
                          fontSize: '0.75rem', 
                          background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: isActive ? '#34d399' : '#9ca3af',
                          fontWeight: 600
                        }}>
                          {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {canEdit && (
                        <button onClick={() => openEditModal(targetUser)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>Edit</button>
                      )}
                      
                      {currentUser.role === 'owner' && !isOwner && isActive && (
                        <button onClick={() => handleDeactivate(targetUser._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Deactivate</button>
                      )}

                      {!isActive && (
                        <button onClick={() => handleActivate(targetUser._id)} style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Re-Activate</button>
                      )}
                    </td>
                  </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'var(--bg-dark)', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{showEditModal ? 'Edit Team Member' : 'Invite New Team Member'}</h3>
            <form onSubmit={showEditModal ? handleEditSubmit : handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <input required name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              
              {!showEditModal && (
                <input required type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
              )}
              
              <select name="role" value={formData.role} onChange={handleInputChange} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }}>
                  {canCreateAdmins && <option value="admin">Administrator</option>}
                  <option value="manager">Manager</option>
                  <option value="sales_rep">Sales Representative</option>
              </select>

              {!showEditModal && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input required minLength="8" type="password" name="password" placeholder="Temporary Password" value={formData.password} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                  <input required minLength="8" type="password" name="passwordConfirm" placeholder="Confirm Password" value={formData.passwordConfirm} onChange={handleInputChange} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => {setShowAddModal(false); setShowEditModal(false);}} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{showEditModal ? 'Save Details' : 'Send Invite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;

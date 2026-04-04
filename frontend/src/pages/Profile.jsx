import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordData.password !== passwordData.passwordConfirm) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.patch('/auth/updatePassword', passwordData);
      // Backend updatePassword returns new token
      if (res.data.token) {
        localStorage.setItem('jwt', res.data.token);
      }
      setMessage("Password successfully updated. Your session is refreshed.");
      setPasswordData({ passwordCurrent: '', password: '', passwordConfirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div style={{ position: 'relative', height: '100%', maxWidth: '800px' }}>
      <div className="stat-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative', height: '100%', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.5rem' }}>Account Settings</h2>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal workspace preferences and security.</p>
      </div>

      <div className="stat-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Full Name</label>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>{user.name}</div>
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email Address</label>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>{user.email}</div>
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Role</label>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Company Reference</label>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace' }}>{user.company || 'N/A'}</div>
            </div>
        </div>
      </div>

      <div className="stat-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Security</h3>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{message}</div>}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ maxWidth: '400px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Password</label>
                <input 
                  type="password" required name="passwordCurrent" value={passwordData.passwordCurrent} onChange={handlePasswordChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '1rem', maxWidth: '400px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password</label>
                    <input 
                      type="password" required minLength="8" name="password" value={passwordData.password} onChange={handlePasswordChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm New</label>
                    <input 
                      type="password" required minLength="8" name="passwordConfirm" value={passwordData.passwordConfirm} onChange={handlePasswordChange}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }}
                    />
                </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ maxWidth: '400px', marginTop: '0.5rem' }}>
                {loading ? 'Updating Security...' : 'Update Password'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

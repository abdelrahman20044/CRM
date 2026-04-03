import { useState, useContext } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  // Using the context to log the user in if the reset returns a token (based on standard architectures)
  // Wait, resetPassword in authController usually logs the user in and returns a token immediately.
  const { logout } = useContext(AuthContext);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await api.patch(`/auth/resetPassword/${token}`, { password, passwordConfirm });
      setMessage('Password successfully reset! Logging you in...');
      
      // If the backend returns a token upon reset, we clear existing session and redirect
      if (res.data.token) {
          localStorage.setItem('jwt', res.data.token);
          // Force a reload so the context picks up the new logged-in state
          setTimeout(() => window.location.href = '/', 1500);
      } else {
          setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password. Token may be invalid/expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '1rem' }}>
      <div style={{ background: 'var(--glass-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontWeight: 600, fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create New Password</h1>
          <p style={{ color: 'var(--text-muted)' }}>Must be at least 8 characters</p>
        </div>

        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        {message && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{message}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>New Password</label>
            <input 
              type="password" 
              required 
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm New Password</label>
            <input 
              type="password" 
              required 
              minLength="8"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.875rem', fontWeight: 600 }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

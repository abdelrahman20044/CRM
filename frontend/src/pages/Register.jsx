import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', padding: '2rem 1rem' }}>
      <div style={{ background: 'var(--glass-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)', width: '100%', maxWidth: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="brand-icon" style={{ boxShadow: 'none' }}>★</div>
          </div>
          <h1 style={{ fontWeight: 600, fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Workspace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Set up your company CRM</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Details</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name</label>
                <input required name="name" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Admin Email</label>
                <input type="email" required name="email" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
                <input type="password" required name="password" minLength="8" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Confirm Password</label>
                <input type="password" required name="passwordConfirm" minLength="8" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
          </div>

          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Company Details</h3>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Company Name</label>
                <input required name="companyName" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Company Email</label>
                <input type="email" required name="companyEmail" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Company Phone</label>
                <input required name="companyPhone" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Company Address</label>
                <input required name="companyAddress" onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'white' }} />
              </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ marginTop: '1.5rem', padding: '1rem' }}
          >
            {isLoading ? 'Creating Workspace...' : 'Create Account'}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

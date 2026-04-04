import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in securely
    const checkUser = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (token) {
            // Hit the /me endpoint to validate token and fetch user details
            const res = await api.get('/auth/me');
            setUser(res.data.data.user);
        }
      } catch (err) {
        console.log("Not logged in");
        localStorage.removeItem('jwt');
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('jwt', res.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const registerUser = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('jwt', res.data.token);
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    // You could also hit an optional /logout endpoint if the backend has one to clear HTTP-only cookies
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

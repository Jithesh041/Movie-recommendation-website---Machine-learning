import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('jsgflix-user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('jsgflix-user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Ensure nationality is set
    const userWithNationality = {
      ...userData,
      nationality: userData.nationality || 'United States'
    };
    setUser(userWithNationality);
    localStorage.setItem('jsgflix-user', JSON.stringify(userWithNationality));
    if (userWithNationality.token) localStorage.setItem('token', userWithNationality.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jsgflix-user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

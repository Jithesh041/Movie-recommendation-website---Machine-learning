import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        nationality: 'United States'
      });
      login({ ...data.user, token: data.token });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <form onSubmit={submit}>
        <p className="eyebrow">Start discovering</p>
        <h1>Create account.</h1>
        
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={loading}
        />
        
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={loading}
        />
        
        <input
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          minLength="6"
          required
          disabled={loading}
        />
        
        <input
          type="text"
          placeholder="Nationality"
          value="United States"
          disabled
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
        />
        
        {error && <p className="notice">{error}</p>}
        
        <button className="button" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

import React, { useState } from 'react';
import { Api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await Api.login({ email, password });
      if (res?.token) {
        login(res.token, res.user || { email });
        navigate('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page" style={{ maxWidth: 420 }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 className="title">Login</h2>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label>
            <div className="text-muted">Email</div>
            <input
              className="input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              aria-label="Email address"
            />
          </label>
          <label>
            <div className="text-muted">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              aria-label="Password"
            />
          </label>
          {error ? <div className="text-muted" role="alert" style={{ color: 'var(--error)' }}>{error}</div> : null}
          <button className="btn" type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

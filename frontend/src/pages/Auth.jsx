import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { LogIn, UserPlus, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Auth({ setActivePage, setTriggerUploadOnboarding }) {
  const { loginUser } = useAuth();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data.success) {
        loginUser(res.data.user, res.data.token, false);
        setSuccessMessage('Welcome back! Logging you in...');
        setTimeout(() => {
          setActivePage('dashboard');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await authApi.register({ name, email, password });
      if (res.data.success) {
        loginUser(res.data.user, res.data.token, true);
        setSuccessMessage('Account created successfully! Preparing your workspace...');
        if (setTriggerUploadOnboarding) {
          setTriggerUploadOnboarding(true);
        }
        setTimeout(() => {
          setActivePage('dashboard');
        }, 500);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto' }}>
      <button
        type="button"
        className="btn-secondary"
        style={{ marginBottom: '20px', padding: '6px 12px', fontSize: '0.8rem' }}
        onClick={() => setActivePage('home')}
      >
        <ArrowLeft size={14} />
        <span>Back to Home</span>
      </button>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '36px', height: '36px',
          background: '#8E3B46',
          borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '800', fontSize: '1rem',
          margin: '0 auto 12px auto'
        }}>
          R
        </div>
        <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
          {tab === 'signin' ? 'Welcome Back' : 'Create Your Account'}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {tab === 'signin' ? 'Access your career intelligence portfolio.' : 'Get instant ATS scoring, keyword matching, and AI recommendations.'}
        </p>
      </div>

      <div className="card">
        {/* Tab selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: 'var(--bg-card-2)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <button
            type="button"
            className={`tab-btn ${tab === 'signin' ? 'active' : ''}`}
            style={{ justifyContent: 'center', padding: '8px', fontSize: '0.84rem', borderBottom: 'none', borderRadius: '6px' }}
            onClick={() => { setTab('signin'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            style={{ justifyContent: 'center', padding: '8px', fontSize: '0.84rem', borderBottom: 'none', borderRadius: '6px' }}
            onClick={() => { setTab('signup'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.25)', borderRadius: '8px', padding: '10px 14px', color: '#C0392B', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ background: 'rgba(45, 106, 79, 0.08)', border: '1px solid rgba(45, 106, 79, 0.25)', borderRadius: '8px', padding: '10px 14px', color: '#2D6A4F', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={15} />
            <span>{successMessage}</span>
          </div>
        )}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '11px' }} disabled={loading}>
              <LogIn size={15} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Priyanshi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (6+ characters)</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px', padding: '11px' }} disabled={loading}>
              <UserPlus size={15} />
              <span>{loading ? 'Creating Account...' : 'Create Account & Upload Resume'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Mail, Phone, Link, Globe, Briefcase, CheckCircle2, Save } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, latestAnalysis, loginUser, token } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    linkedin: '',
    github: '',
    portfolio: '',
    domain: '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: user?.name || latestAnalysis?.parsed_name || '',
        email: user?.email || latestAnalysis?.parsed_email || '',
        mobile: user?.mobile || latestAnalysis?.parsed_mobile || '',
        linkedin: user?.linkedin || latestAnalysis?.linkedin || '',
        github: user?.github || latestAnalysis?.github || '',
        portfolio: user?.portfolio || '',
        domain: user?.domain || latestAnalysis?.predicted_field || 'Software Engineering',
      });
      setSavedSuccess(false);
    }
  }, [isOpen, user, latestAnalysis]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSavedSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      linkedin: formData.linkedin,
      github: formData.github,
      portfolio: formData.portfolio,
      domain: formData.domain,
    };
    loginUser(updatedUser, token || 'session-token');
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(23, 19, 19, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '560px', width: '100%', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#8E3B46',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: '800',
            flexShrink: 0
          }}>
            {(formData.name || 'P').charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="eyebrow" style={{ margin: 0 }}>Candidate Profile</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {formData.name || 'User Profile'}
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Manage your personal credentials, contact links, and career preferences.
            </div>
          </div>
        </div>

        {savedSuccess && (
          <div style={{
            background: 'rgba(45, 106, 79, 0.08)',
            border: '1px solid rgba(45, 106, 79, 0.25)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#2D6A4F',
            fontSize: '0.82rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} color="#2D6A4F" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Priyanshi Choudhary"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="priyanshi@example.com"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Career Domain</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="Data Science & AI"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">LinkedIn Profile URL</label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">GitHub Profile URL</label>
            <input
              type="text"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Personal Portfolio / Website</label>
            <input
              type="text"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://myportfolio.dev"
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '9px 16px', fontSize: '0.84rem' }}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: '0.84rem' }}
            >
              <Save size={14} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

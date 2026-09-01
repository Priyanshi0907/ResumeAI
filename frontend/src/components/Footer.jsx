import React from 'react';

export default function Footer({ setActivePage }) {
  const footerLink = {
    fontSize: '0.82rem',
    color: '#9A8F88',
    cursor: 'pointer',
    transition: 'color 0.15s ease',
    textDecoration: 'none',
  };

  const sectionLabel = {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#6B5E58',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '16px',
  };

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '30px', height: '30px',
              background: '#8E3B46',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '0.9rem',
            }}>
              R
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#F2ECE4' }}>ResumeAI</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#7A6B65', lineHeight: '1.65', maxWidth: '300px' }}>
            Next-generation ATS intelligence platform designed to decode recruitment patterns, match candidates to live roles, and optimize career portfolios with AI.
          </div>
        </div>

        {/* Platform */}
        <div>
          <div style={sectionLabel}>Platform</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={footerLink} onClick={() => setActivePage('analyzer')}>Resume Scorer</span>
            <span style={footerLink} onClick={() => setActivePage('matcher')}>JD Keyword Matcher</span>
            <span style={footerLink} onClick={() => setActivePage('matcher')}>AI Cover Letter Writer</span>
          </div>
        </div>

        {/* Resources */}
        <div>
          <div style={sectionLabel}>Resources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={footerLink} onClick={() => setActivePage('tips')}>Writing Guidelines</span>
            <span style={footerLink} onClick={() => setActivePage('tips')}>ATS Formatting Rules</span>
            <span style={footerLink} onClick={() => setActivePage('feedback')}>Community Feedback</span>
          </div>
        </div>

        {/* Architecture */}
        <div>
          <div style={sectionLabel}>Architecture</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: '#6B5E58' }}>
            <span>React SPA</span>
            <span>Node.js Express API</span>
            <span>FastAPI ML Engine</span>
            <span>Groq Llama 3.3 70B</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ fontSize: '0.72rem', color: '#4A3D3A' }}>
          © 2026 ResumeAI. React + Node.js + FastAPI Microservice Stack.
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', color: '#6B5E58' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Security Standards</span>
        </div>
      </div>
    </footer>
  );
}

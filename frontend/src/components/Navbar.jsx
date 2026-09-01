import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Layers,
  Star,
  Home as HomeIcon
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, scrollToSection }) {
  const { isLoggedIn } = useAuth();

  const handleNavClick = (sectionId) => {
    if (activePage !== 'home') {
      setActivePage('home');
      setTimeout(() => {
        if (scrollToSection) scrollToSection(sectionId);
      }, 100);
    } else {
      if (scrollToSection) scrollToSection(sectionId);
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="nav-brand" onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <div className="brand-icon">
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>R</span>
          </div>
          <div>
            <div className="brand-title">ResumeAI</div>
            <div className="brand-sub">Career Intelligence</div>
          </div>
        </div>

        {/* Center Nav: Home, Capabilities, Reviews */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('hero')}
          >
            <HomeIcon size={14} />
            <span>Home</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavClick('capabilities')}
          >
            <Layers size={14} />
            <span>Capabilities</span>
          </button>

          <button
            className="nav-btn"
            onClick={() => handleNavClick('reviews')}
          >
            <Star size={14} />
            <span>Reviews</span>
          </button>
        </nav>

        {/* Right Action: Sign In / Sign Up */}
        <div className="nav-actions">
          <div className="status-pill">
            <span className="pulse-dot"></span>
            <span>Online</span>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.84rem' }}
            onClick={() => setActivePage('auth')}
          >
            <LogIn size={14} />
            <span>Sign In / Sign Up</span>
          </button>
        </div>
      </div>
    </header>
  );
}

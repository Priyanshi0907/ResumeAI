import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

function MainApp() {
  const [activePage, setActivePage] = useState('home');
  const { isLoggedIn } = useAuth();

  const scrollToSection = (id) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If user is authenticated, open the Executive Dashboard (Image 3)
  if (isLoggedIn) {
    return <Dashboard initialTab="overview" />;
  }

  // Public / Pre-auth flow
  return (
    <div className="app-container">
      {activePage !== 'auth' && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          scrollToSection={scrollToSection}
        />
      )}

      <main className="main-content" style={{ padding: activePage === 'auth' ? '2rem 1rem' : undefined }}>
        {activePage === 'auth' ? (
          <Auth setActivePage={setActivePage} />
        ) : (
          <Home setActivePage={setActivePage} />
        )}
      </main>

      {/* Remove footer from sign up/sign in portal */}
      {activePage !== 'auth' && <Footer setActivePage={setActivePage} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

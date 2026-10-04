import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resumeai_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('resumeai_token') || '');
  const [latestAnalysis, setLatestAnalysis] = useState(() => {
    const saved = localStorage.getItem('resumeai_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [justSignedUp, setJustSignedUp] = useState(false);

  const loginUser = (userData, userToken, isNewUser = false) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('resumeai_user', JSON.stringify(userData));
    localStorage.setItem('resumeai_token', userToken);
    if (isNewUser) {
      setJustSignedUp(true);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setToken('');
    setLatestAnalysis(null);
    setJustSignedUp(false);
    localStorage.removeItem('resumeai_user');
    localStorage.removeItem('resumeai_token');
    localStorage.removeItem('resumeai_analysis');
  };

  const saveAnalysis = (data) => {
    setLatestAnalysis(data);
    if (data) {
      localStorage.setItem('resumeai_analysis', JSON.stringify(data));
      try {
        localStorage.removeItem('resume_history_cleared');
        const stored = localStorage.getItem('resume_audit_history');
        let records = stored ? JSON.parse(stored) : [];
        const now = new Date().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const prevScore = records.length > 0 ? records[records.length - 1].score : (data.resume_score || 85);
        const versionNum = records.length + 1;
        const newEntry = {
          id: `v${versionNum}.0_${Date.now()}`,
          version: `Version ${versionNum}.0`,
          filename: data.pdf_name || `Resume_v${versionNum}.pdf`,
          date: now,
          timestamp: Date.now(),
          score: data.resume_score || 85,
          content: data.health_breakdown?.content || 92,
          formatting: data.health_breakdown?.formatting || 84,
          keywords: data.health_breakdown?.keywords || 87,
          impact: data.health_breakdown?.impact || 76,
          completeness: data.health_breakdown?.completeness || 91,
          diff: records.length > 0 ? (data.resume_score || 85) - prevScore : 0,
        };
        records.push(newEntry);
        localStorage.setItem('resume_audit_history', JSON.stringify(records));
      } catch (err) {
        console.error('Error auto-recording resume history:', err);
      }
    }
  };

  const clearJustSignedUp = () => {
    setJustSignedUp(false);
  };

  const value = {
    user,
    token,
    isLoggedIn: !!user,
    latestAnalysis,
    justSignedUp,
    loginUser,
    logoutUser,
    saveAnalysis,
    clearJustSignedUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

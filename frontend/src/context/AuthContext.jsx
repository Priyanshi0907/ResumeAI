import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const getUserAnalysisKey = (userId) => `resumeai_analysis_user_${userId}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('resumeai_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('resumeai_token') || '');
  const [latestAnalysis, setLatestAnalysis] = useState(() => {
    // Try to restore analysis for the currently stored user
    const savedUser = localStorage.getItem('resumeai_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        const userKey = getUserAnalysisKey(u.id);
        const userAnalysis = localStorage.getItem(userKey);
        if (userAnalysis) return JSON.parse(userAnalysis);
      } catch (_) {}
    }
    // Fallback: legacy global key
    const saved = localStorage.getItem('resumeai_analysis');
    return saved ? JSON.parse(saved) : null;
  });

  const [justSignedUp, setJustSignedUp] = useState(false);

  const loginUser = (userData, userToken, isNewUser = false) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('resumeai_user', JSON.stringify(userData));
    localStorage.setItem('resumeai_token', userToken);

    // Restore this user's previously saved analysis (if any)
    if (!isNewUser && userData.id) {
      const userKey = getUserAnalysisKey(userData.id);
      const userAnalysis = localStorage.getItem(userKey);
      if (userAnalysis) {
        try {
          setLatestAnalysis(JSON.parse(userAnalysis));
        } catch (_) {}
      } else {
        // No saved analysis for this user yet
        setLatestAnalysis(null);
      }
    } else if (isNewUser) {
      // Fresh account — clear any stale analysis
      setLatestAnalysis(null);
    }

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
    // Do NOT remove the per-user analysis so it survives the next login
    // Legacy global key cleanup only
    localStorage.removeItem('resumeai_analysis');
  };

  const saveAnalysis = (data) => {
    setLatestAnalysis(data);
    if (data) {
      // Save under legacy key for backward compatibility
      localStorage.setItem('resumeai_analysis', JSON.stringify(data));
      // Save under per-user key so it persists across login sessions
      const savedUser = localStorage.getItem('resumeai_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u.id) {
            localStorage.setItem(getUserAnalysisKey(u.id), JSON.stringify(data));
          }
        } catch (_) {}
      }
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

  const removeAnalysis = () => {
    setLatestAnalysis(null);
    localStorage.removeItem('resumeai_analysis');
    localStorage.removeItem('resume_audit_history');
    localStorage.removeItem('resume_history_cleared');
    // Also clear per-user key
    const savedUser = localStorage.getItem('resumeai_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.id) {
          localStorage.removeItem(getUserAnalysisKey(u.id));
        }
      } catch (_) {}
    }
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
    removeAnalysis,
    clearJustSignedUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

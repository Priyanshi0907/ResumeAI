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
    localStorage.setItem('resumeai_analysis', JSON.stringify(data));
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

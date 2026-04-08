import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vds_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [domain, setDomain] = useState(() => {
    return localStorage.getItem('vds_domain') || null;
  });

  const login = async (username) => {
    // Simple mock login for now
    const newUser = { username, id: 1 };
    setUser(newUser);
    localStorage.setItem('vds_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setDomain(null);
    localStorage.removeItem('vds_user');
    localStorage.removeItem('vds_domain');
  };

  const selectDomain = (newDomain) => {
    setDomain(newDomain);
    localStorage.setItem('vds_domain', newDomain);
  };

  return (
    <AppContext.Provider value={{ user, domain, login, logout, selectDomain }}>
      {children}
    </AppContext.Provider>
  );
};

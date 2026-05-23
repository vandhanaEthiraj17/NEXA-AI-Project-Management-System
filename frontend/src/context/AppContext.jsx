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

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.status === 'success') {
        const newUser = { username: data.username, role: data.role };
        setUser(newUser);
        localStorage.setItem('vds_user', JSON.stringify(newUser));
        return { success: true, role: data.role };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: 'Server unreachable' };
    }
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

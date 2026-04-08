import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [editorMode, setEditorMode] = useState('visual');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Fetch initial settings from backend
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(data => {
        setTheme(data.theme || 'light');
        setEditorMode(data.editor_mode || 'visual');
        setNotifications(data.notifications !== false);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  useEffect(() => {
    // Apply theme to body
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const updateSettings = async (newSettings) => {
    const combined = { theme, editor_mode: editorMode, notifications, ...newSettings };
    
    if (newSettings.theme !== undefined) setTheme(newSettings.theme);
    if (newSettings.editor_mode !== undefined) setEditorMode(newSettings.editor_mode);
    if (newSettings.notifications !== undefined) setNotifications(newSettings.notifications);

    try {
      await fetch('http://localhost:5000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(combined)
      });
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ theme, editorMode, notifications, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

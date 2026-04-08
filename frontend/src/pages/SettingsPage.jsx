import React, { useContext, useState } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { AppContext } from '../context/AppContext';
import { Moon, Sun, Layout, Bell, Shield, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { theme, editorMode, notifications, updateSettings } = useContext(SettingsContext);
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleThemeChange = (newTheme) => {
    updateSettings({ theme: newTheme });
    showSuccess('Theme updated successfully');
  };

  const handleEditorModeChange = (mode) => {
    updateSettings({ editor_mode: mode });
    showSuccess('Editor mode updated successfully');
  };

  const handleNotificationToggle = () => {
    updateSettings({ notifications: !notifications });
    showSuccess('Notification preferences updated');
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Platform Settings</h1>
        <p className="page-subtitle">Customize your workspace and application preferences.</p>
      </header>
      
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e3fcef', color: '#006644', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #abf5d1' }}>
          <CheckCircle size={18} />
          <span style={{ fontWeight: 500 }}>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Appearance Settings */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sun size={18} /> Appearance
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div 
              onClick={() => handleThemeChange('light')}
              style={{
                flex: 1, padding: '1.5rem', border: `2px solid ${theme === 'light' ? '#0052cc' : '#dfe1e6'}`, 
                borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: '#f4f5f7'
              }}
            >
              <Sun size={24} color={theme === 'light' ? '#0052cc' : '#5e6c84'} style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, color: theme === 'light' ? '#0052cc' : '#172b4d' }}>Light Mode</div>
            </div>
            <div 
              onClick={() => handleThemeChange('dark')}
              style={{
                flex: 1, padding: '1.5rem', border: `2px solid ${theme === 'dark' ? '#0052cc' : '#dfe1e6'}`, 
                borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: '#202124'
              }}
            >
              <Moon size={24} color={theme === 'dark' ? '#0052cc' : '#9aa0a6'} style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, color: theme === 'dark' ? '#0052cc' : '#e8eaed' }}>Dark Mode</div>
            </div>
          </div>
        </div>

        {/* Editor Preferences */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={18} /> Default Layout View
          </h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => handleEditorModeChange('visual')}
              className={editorMode === 'visual' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Visual Dashboard
            </button>
            <button 
              onClick={() => handleEditorModeChange('compact')}
              className={editorMode === 'compact' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Compact Data Grid
            </button>
            <button 
              onClick={() => handleEditorModeChange('developer')}
              className={editorMode === 'developer' ? 'btn-primary' : 'btn-secondary'}
              style={{ flex: 1, padding: '0.75rem' }}
            >
              Developer Console
            </button>
          </div>
        </div>

        {/* Notifications & Privacy */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} /> Preferences & Privacy
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Push Notifications</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive alerts for high-risk delays.</div>
              </div>
            </div>
            <button 
              onClick={handleNotificationToggle}
              style={{ 
                width: '40px', height: '24px', borderRadius: '12px', padding: '2px', border: 'none', cursor: 'pointer',
                background: notifications ? '#00875a' : '#dfe1e6', transition: 'background 0.3s'
              }}
            >
              <div style={{ 
                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                transform: notifications ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.3s'
              }} />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ border: '1px solid #ffbdad', background: 'var(--bg-main)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#de350b', marginBottom: '1rem' }}>Account Session</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Signed in securely as <strong>{user?.username}</strong>. Signing out will clear your session.
          </p>
          <button 
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#ffebe6', color: '#de350b', border: '1px solid #ffbdad', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
          >
            <LogOut size={18} /> Sign Out of Platform
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;

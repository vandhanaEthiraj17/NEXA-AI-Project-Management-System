import React, { useContext, useState } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { AppContext } from '../context/AppContext';
import { Moon, Sun, Layout, Bell, Shield, LogOut, CheckCircle2, Sliders, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
  const { theme, editorMode, notifications, updateSettings } = useContext(SettingsContext);
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [successMsg, setSuccessMsg] = useState('');

  const handleThemeChange = (newTheme) => {
    updateSettings({ theme: newTheme });
    showSuccess('Theme preferences updated');
  };

  const handleEditorModeChange = (mode) => {
    updateSettings({ editor_mode: mode });
    showSuccess('Default workspace layout modified');
  };

  const handleNotificationToggle = () => {
    updateSettings({ notifications: !notifications });
    showSuccess('Notification rules updated');
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
    <div className="max-w-[720px] mx-auto space-y-6 select-none">
      {/* Header */}
      <header className="pb-4 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sliders className="text-neon-cyan" size={24} />
            Platform Configurations
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure workspace parameters and diagnostic telemetry settings.</p>
        </div>
      </header>
      
      {/* Notification popup */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 p-3 rounded-xl text-xs"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Appearance Settings */}
        <GlassCard>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sun size={14} className="text-neon-cyan" /> Appearance Preferences
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border cursor-pointer text-center flex flex-col items-center justify-center transition-all duration-300 ${
                theme === 'light' 
                  ? 'border-neon-cyan bg-neon-cyan/5 text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              <Sun size={20} className="mb-2" />
              <div className="text-xs font-semibold">Light Matrix</div>
            </div>
            <div 
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border cursor-pointer text-center flex flex-col items-center justify-center transition-all duration-300 ${
                theme === 'dark' 
                  ? 'border-neon-purple bg-neon-purple/5 text-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              <Moon size={20} className="mb-2" />
              <div className="text-xs font-semibold">Dark Matrix</div>
            </div>
          </div>
        </GlassCard>

        {/* Editor Preferences */}
        <GlassCard>
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Eye size={14} className="text-neon-cyan" /> Default Layout View
          </h2>
          <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
            <button 
              onClick={() => handleEditorModeChange('visual')}
              className={`py-2 px-3 rounded-lg border font-bold uppercase transition-all duration-200 cursor-pointer ${
                editorMode === 'visual' 
                  ? 'bg-neon-purple/10 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                  : 'bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Visual Dashboard
            </button>
            <button 
              onClick={() => handleEditorModeChange('compact')}
              className={`py-2 px-3 rounded-lg border font-bold uppercase transition-all duration-200 cursor-pointer ${
                editorMode === 'compact' 
                  ? 'bg-neon-purple/10 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                  : 'bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Compact Grid
            </button>
            <button 
              onClick={() => handleEditorModeChange('developer')}
              className={`py-2 px-3 rounded-lg border font-bold uppercase transition-all duration-200 cursor-pointer ${
                editorMode === 'developer' 
                  ? 'bg-neon-purple/10 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                  : 'bg-transparent border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Terminal Core
            </button>
          </div>
        </GlassCard>

        {/* Notifications & Privacy */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Push Alert Telemetry</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Receive risk diagnostics alerts immediately in the sidebar.</p>
              </div>
            </div>
            <button 
              onClick={handleNotificationToggle}
              className={`w-10 h-6 rounded-full p-0.5 border-none cursor-pointer transition-colors duration-300 flex items-center ${
                notifications ? 'bg-neon-cyan' : 'bg-slate-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                notifications ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-950/20 bg-gradient-to-r from-rose-950/5 to-transparent">
          <h2 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Shield size={14} /> Session Management
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Security session keys are verified for operator: <strong className="text-white font-mono">{user?.username}</strong>. Signing out terminates live scans.
          </p>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl cursor-pointer bg-rose-500/10 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-rose-200 text-xs font-bold font-mono transition-colors uppercase tracking-wider"
          >
            <LogOut size={14} /> Log Out Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

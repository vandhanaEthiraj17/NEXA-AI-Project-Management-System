import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Briefcase, Building, Save, CheckCircle, ShieldCheck } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch profile from backend
    fetch('http://localhost:5000/api/user/profile')
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full border-2 border-neon-purple border-t-transparent animate-spin mb-4"></div>
        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Fetching Operator Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto space-y-6 select-none">
      {/* Header */}
      <header className="pb-4 border-b border-white/5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <User className="text-neon-cyan" size={24} />
            Operator Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage credentials and authentication details.</p>
        </div>
      </header>

      {/* Main Glass Panel */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        {/* Card Top / Avatar */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-white border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <User size={30} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{profile.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">
              {profile.role} • {profile.department}
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Full Identity Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Secure Email Node</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={14} />
                </span>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Operational Title</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Briefcase size={14} />
                </span>
                <input 
                  type="text" 
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Operational Division</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Building size={14} />
                </span>
                <input 
                  type="text" 
                  value={profile.department}
                  onChange={(e) => setProfile({...profile, department: e.target.value})}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-1.5 font-mono uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin"></div>
              ) : (
                <Save size={14} />
              )}
              Commit Changes
            </button>
            
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-emerald-400 font-semibold text-xs flex items-center gap-1"
                >
                  <CheckCircle size={14} /> {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

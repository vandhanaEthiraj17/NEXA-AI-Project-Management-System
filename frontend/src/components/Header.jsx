import React, { useContext, useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Notification state
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabName = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'System Analytics Dashboard';
    if (path.includes('analysis')) return 'Predictive Project Scoping';
    if (path.includes('simulation')) return 'Risk Scenario Planner';
    if (path.includes('insights')) return 'AI Scenarios Analysis';
    if (path.includes('kanban')) return 'Active Sprint Board';
    if (path.includes('resource-allocation')) return 'Developer Resource Maps';
    if (path.includes('analytics')) return 'Enterprise Intelligence';
    if (path.includes('client-portal')) return 'Scoping Scans Board';
    if (path.includes('profile')) return 'System Operator Profile';
    if (path.includes('settings')) return 'Platform Configurations';
    return 'Decision Intelligence Hub';
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearch(e.target.value.length > 0);
  };

  const mockSearchResults = [
    { id: 1, title: 'Project Delay Report (Q2)', type: 'Analytics' },
    { id: 2, title: 'Team Optimization Strategies', type: 'Insight' },
    { id: 3, title: 'Risk Analysis: Cloud Migration', type: 'Prediction' }
  ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header className="h-[64px] border-b border-white/5 bg-bg-glass/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-mono uppercase tracking-wider text-[10px]">OPERATIONAL STATE</span>
        <span className="text-slate-600">/</span>
        <span className="font-semibold text-white tracking-wide text-glow">{getTabName()}</span>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-5">
        
        {/* Command bar / Search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 hover:border-white/10 focus-within:border-neon-purple/50 rounded-lg px-3 py-1.5 transition-all duration-300 w-52 focus-within:w-64">
            <Search size={14} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search insights..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery && setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="bg-transparent border-none text-xs text-white outline-none w-full placeholder-slate-500 font-sans" 
            />
            <div className="text-[9px] font-mono text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">⌘K</div>
          </div>
          
          <AnimatePresence>
            {showSearch && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-[110%] left-0 right-0 glass-panel-heavy rounded-lg p-2 z-50 border border-white/10 shadow-2xl space-y-1"
              >
                {mockSearchResults.length > 0 ? mockSearchResults.map(res => (
                  <div key={res.id} className="p-2 text-xs cursor-pointer rounded-md hover:bg-white/[0.04] text-slate-200 flex justify-between items-center transition-colors">
                    <span>{res.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-mono uppercase">{res.type}</span>
                  </div>
                )) : (
                  <div className="p-2 text-xs text-slate-500 text-center font-sans">No records located.</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Notifications */}
        <div className="relative flex items-center" ref={notifRef}>
          <button 
            className="relative cursor-pointer text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.02]"
            onClick={() => { setShowNotif(!showNotif); setUnreadCount(0); }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-bg-deep animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[125%] right-0 w-[280px] glass-panel-heavy rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 bg-white/[0.02] font-semibold text-xs text-white flex justify-between items-center">
                  <span>System Diagnostics Logs</span>
                  <span className="text-[9px] font-mono text-neon-cyan">2 UNREAD</span>
                </div>
                <div className="max-h-[220px] overflow-y-auto divide-y divide-white/5">
                  <div className="p-3 hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => setShowNotif(false)}>
                    <div className="text-rose-400 font-semibold text-[10px] flex items-center gap-1.5 uppercase mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                      Timeline Threat Alert
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">High project delay risk detected in "Sprint 2" (exceeds 72%).</div>
                  </div>
                  <div className="p-3 hover:bg-white/[0.02] cursor-pointer transition-colors" onClick={() => { setShowNotif(false); navigate('/insights'); }}>
                    <div className="text-neon-cyan font-semibold text-[10px] flex items-center gap-1.5 uppercase mb-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan"></span>
                      Optimization Scans
                    </div>
                    <div className="text-slate-300 text-[11px] leading-relaxed">ML model has generated 3 suggested optimization scenarios.</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* User Hub */}
        <Link to="/profile" className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/5 transition-all duration-300">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center text-white border border-white/10 shadow-md">
            <User size={14} />
          </div>
          <div className="text-left shrink-0">
            <div className="text-[11px] font-semibold text-white tracking-wide">{user?.username || 'System Operator'}</div>
            <div className="text-[9px] text-slate-500 font-mono leading-none">{user?.role?.toUpperCase() || 'MANAGER'}</div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;

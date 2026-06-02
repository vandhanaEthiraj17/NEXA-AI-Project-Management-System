import React, { useContext } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  SlidersHorizontal, 
  Lightbulb,
  Activity,
  LogOut,
  RefreshCw,
  Play,
  Users,
  BarChart3,
  Globe,
  Settings
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { domain, logout, user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role || 'manager';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/app/dashboard', roles: ['manager'] },
    { id: 'kanban', label: 'Active Sprint', icon: <Play size={20} />, path: '/app/kanban', roles: ['manager'] },
    { id: 'resource-allocation', label: 'Resource Map', icon: <Users size={20} />, path: '/app/resource-allocation', roles: ['manager'] },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, path: '/app/analytics', roles: ['manager'] },
    { id: 'client-portal', label: 'Project Portal', icon: <Globe size={20} />, path: '/app/client-portal', roles: ['client', 'manager'] },
    { id: 'analysis', label: 'New Analysis', icon: <PlusSquare size={20} />, path: '/app/analysis', roles: ['manager'] },
    { id: 'simulation', label: 'Simulation Panel', icon: <SlidersHorizontal size={20} />, path: '/app/simulation', roles: ['manager'] },
    { id: 'insights', label: 'Decision Insights', icon: <Lightbulb size={20} />, path: '/app/insights', roles: ['manager'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[84px] shrink-0 border-r border-white/5 bg-bg-glass backdrop-blur-xl flex flex-col items-center py-6 h-full justify-between z-20">
      {/* Logo */}
      <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => navigate('/select-domain')}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Activity size={20} className="text-white" />
        </div>
        <span className="font-mono text-[9px] font-bold text-slate-400 tracking-wider mt-1 text-glow">NEXA.AI</span>
      </div>

      {/* Domain Quick-Change Widget */}
      {domain && (
        <div className="group relative my-4 flex flex-col items-center">
          <button 
            className="w-10 h-10 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-neon-cyan/40 flex items-center justify-center text-slate-400 hover:text-neon-cyan transition-all duration-300"
            onClick={() => navigate('/select-domain')}
            title={`Domain: ${domain}`}
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-2 glass-panel px-3 py-1.5 rounded-lg text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
            <span className="text-[10px] text-slate-500 block">ACTIVE DOMAIN</span>
            <span className="font-semibold text-white">{domain}</span>
          </div>
        </div>
      )}

      {/* Navigation Icons Stack */}
      <nav className="flex-1 flex flex-col gap-3 justify-center w-full px-3">
        {filteredItems.map((item) => {
          const isActive = location.pathname.includes(item.id);
          return (
            <div key={item.id} className="group relative flex justify-center w-full">
              <button
                onClick={() => navigate(item.path)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative border ${
                  isActive 
                    ? 'bg-neon-purple/10 border-neon-purple text-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {item.icon}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-neon-purple rounded-l-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 glass-panel px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-xl border border-white/10">
                {item.label}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="flex flex-col gap-3 w-full px-3 mt-auto">
        <div className="group relative flex justify-center w-full">
          <button
            onClick={() => navigate('/app/settings')}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border ${
              location.pathname.includes('settings')
                ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Settings size={20} />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 glass-panel px-3 py-1.5 rounded-lg text-xs font-medium text-white whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
            Platform Settings
          </div>
        </div>

        <div className="group relative flex justify-center w-full">
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={20} />
          </button>
          <div className="absolute left-16 top-1/2 -translate-y-1/2 ml-3 glass-panel px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 border border-rose-500/10">
            Log Out Session
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

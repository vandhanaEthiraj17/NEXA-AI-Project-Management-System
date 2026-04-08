import React, { useContext } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  SlidersHorizontal, 
  Lightbulb,
  Activity,
  LogOut,
  RefreshCw,
  Play
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { domain, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/app/dashboard' },
    { id: 'kanban', label: 'Active Sprint', icon: <Play size={18} />, path: '/app/kanban' },
    { id: 'analysis', label: 'New Analysis', icon: <PlusSquare size={18} />, path: '/app/analysis' },
    { id: 'simulation', label: 'Simulation Panel', icon: <SlidersHorizontal size={18} />, path: '/app/simulation' },
    { id: 'insights', label: 'Decision Insights', icon: <Lightbulb size={18} />, path: '/app/insights' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/select-domain')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <img src="/nexa-logo.png" alt="NexaAI Logo" style={{ height: '32px' }} />
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>NexaAI</span>
      </div>
      
      <div className="active-domain-box" style={{ margin: '1rem 0 2rem 0', padding: '1rem', background: '#f4f5f7', borderRadius: '8px', border: '1px solid #dfe1e6' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#5e6c84', marginBottom: '0.5rem' }}>Current Domain</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#172b4d' }}>{domain || 'None'}</span>
          <RefreshCw size={14} style={{ cursor: 'pointer', color: '#5e6c84' }} onClick={() => navigate('/select-domain')} title="Switch Domain" />
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${location.pathname.includes(item.id) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <div 
          className={`nav-item ${location.pathname.includes('settings') ? 'active' : ''}`} 
          onClick={() => navigate('/app/settings')} 
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', 
            cursor: 'pointer', color: '#5e6c84', fontWeight: 600, borderRadius: '6px',
            background: location.pathname.includes('settings') ? '#ebecf0' : 'transparent'
          }}
        >
          <SlidersHorizontal size={18} />
          <span>Platform Settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

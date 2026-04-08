import React, { useContext, useState, useEffect, useRef } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';

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
  const [unreadCount, setUnreadCount] = useState(3);

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
    if (path.includes('dashboard')) return 'Strategic Dashboard';
    if (path.includes('analysis')) return 'New Intelligence Analysis';
    if (path.includes('simulation')) return 'Scenario Simulation';
    if (path.includes('insights')) return 'Decision Insights';
    return 'Decision Intelligence Platform';
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowSearch(e.target.value.length > 0);
  };

  const mockSearchResults = [
    { id: 1, title: 'Project Delay Report (Q2)' },
    { id: 2, title: 'Team Optimization Strategies' },
    { id: 3, title: 'Risk Analysis: Cloud Migration' }
  ].filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Simulated real-time new notification
  useEffect(() => {
    const timer = setTimeout(() => setUnreadCount(prev => prev + 1), 15000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="app-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 2rem',
      borderBottom: '1px solid #dfe1e6',
      background: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      height: '60px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5e6c84', fontSize: '0.85rem' }}>
        <span>Analyses</span>
        <span style={{ margin: '0 0.5rem' }}>/</span>
        <span style={{ color: '#172b4d', fontWeight: 600 }}>{getTabName()}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#5e6c84' }}>
        
        {/* Search Container */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f4f5f7', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #dfe1e6' }}>
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search insights..." 
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => searchQuery && setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', outline: 'none', width: '150px' }} 
            />
          </div>
          
          {showSearch && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '0.5rem', zIndex: 100 }}>
              {mockSearchResults.length > 0 ? mockSearchResults.map(res => (
                <div key={res.id} style={{ padding: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '3px', color: '#172b4d' }} onMouseOver={e => e.currentTarget.style.background = '#f4f5f7'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {res.title}
                </div>
              )) : (
                <div style={{ padding: '0.5rem', fontSize: '0.85rem', color: '#888' }}>No results found</div>
              )}
            </div>
          )}
        </div>
        
        {/* Notifications Container */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={notifRef}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotif(!showNotif); setUnreadCount(0); }}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#de350b', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', width: '14px', height: '14px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </div>
            )}
          </div>

          {showNotif && (
            <div style={{ position: 'absolute', top: '100%', right: -10, marginTop: '1rem', width: '250px', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 }}>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid #dfe1e6', fontWeight: 600, fontSize: '0.9rem', color: '#172b4d' }}>Recent Notifications</div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ padding: '0.75rem', borderBottom: '1px solid #dfe1e6', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => setShowNotif(false)}>
                  <div style={{ color: '#de350b', fontWeight: 600, marginBottom: '0.25rem' }}>High delay risk detected</div>
                  <div style={{ color: '#5e6c84' }}>Project "Cloud DB" exceeds acceptable variance.</div>
                </div>
                <div style={{ padding: '0.75rem', borderBottom: '1px solid #dfe1e6', fontSize: '0.8rem', cursor: 'pointer' }} onClick={() => { setShowNotif(false); navigate('/insights'); }}>
                  <div style={{ color: '#0052cc', fontWeight: 600, marginBottom: '0.25rem' }}>New analysis completed</div>
                  <div style={{ color: '#5e6c84' }}>Your Software report is ready.</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f4f5f7'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0052cc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={14} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#172b4d' }}>{user?.username || 'Decision Maker'}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;


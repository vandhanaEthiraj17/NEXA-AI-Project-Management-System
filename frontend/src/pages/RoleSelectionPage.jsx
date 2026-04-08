import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import { Briefcase, HeartPulse, TrendingUp, Cpu } from 'lucide-react';

const RoleSelectionPage = () => {
  const { selectRole, user } = useContext(RoleContext);
  const navigate = useNavigate();

  const handleSelect = (roleName) => {
    selectRole(roleName);
    navigate('/app/dashboard');
  };

  const roles = [
    { id: 'project_manager', title: 'Project Manager', desc: 'Predict delays and optimize engineering timelines.', icon: <Briefcase size={32} /> },
    { id: 'healthcare', title: 'Healthcare Dept', desc: 'Allocate staff and triage patient workloads.', icon: <HeartPulse size={32} /> },
    { id: 'business', title: 'Business Executive', desc: 'Simulate ROI and optimize cost-to-outcome.', icon: <TrendingUp size={32} /> },
    { id: 'generic', title: 'General Intelligence', desc: 'Generic mode for standalone decision metrics.', icon: <Cpu size={32} /> }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Select Your Operational Role</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome, {user?.username}. Which domain matrix should we initialize?</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {roles.map((role) => (
            <div 
              key={role.id} 
              className="card" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              onClick={() => handleSelect(role.id)}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '1rem', background: 'rgba(55, 65, 81, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {role.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{role.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{role.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

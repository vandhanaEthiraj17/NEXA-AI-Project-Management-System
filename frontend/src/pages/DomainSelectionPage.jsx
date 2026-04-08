import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import './DomainSelectionPage.css';

const domains = [
  {
    id: 'Software',
    title: 'Software Project',
    description: 'Predict risks, delays, and optimize developer allocation for software delivery.',
    icon: '💻'
  },
  {
    id: 'Business',
    title: 'Business Decisions',
    description: 'Analyze market demand, budget constraints, and resource scaling for growth.',
    icon: '📊'
  },
  {
    id: 'Hardware',
    title: 'Hardware & Production',
    description: 'Monitor machine uptime, manpower, and production timelines for manufacturing.',
    icon: '⚙️'
  }
];

const DomainSelectionPage = () => {
  const { selectDomain, user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSelect = (domainId) => {
    selectDomain(domainId);
    navigate('/app/dashboard');
  };

  return (
    <div className="selection-container">
      <div className="selection-header">
        <h1>Welcome, {user?.username || 'Decision Maker'}</h1>
        <p>Select a domain to start your AI-powered autonomous decision analysis.</p>
      </div>
      
      <div className="domain-grid">
        {domains.map((d) => (
          <div key={d.id} className="domain-card" onClick={() => handleSelect(d.id)}>
            <div className="domain-icon">{d.icon}</div>
            <h3>{d.title}</h3>
            <p>{d.description}</p>
            <button className="select-btn">Select Domain</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainSelectionPage;

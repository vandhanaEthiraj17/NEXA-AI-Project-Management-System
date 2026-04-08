import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';

const SimulationPanel = () => {
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);

  if (!data) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>No Simulation Data</h2>
        <p style={{ color: '#666' }}>Run an analysis first to enable the interactive simulation engine.</p>
      </div>
    );
  }

  // Extract base values from inputs
  const baseTeamSize = parseInt(data.scenarios[0]?.teamSize || 5);
  const baseRisk = parseFloat(data.metrics.risk_score);

  const [simTeamSize, setSimTeamSize] = useState(baseTeamSize);
  const [simResources, setSimResources] = useState(5);
  const [simRisk, setSimRisk] = useState(baseRisk);

  useEffect(() => {
    // Simple real-time simulation logic
    // More team size = less risk, more resources = less risk
    const teamDiff = simTeamSize - baseTeamSize;
    const resDiff = simResources - 5;
    
    let newRisk = baseRisk - (teamDiff * 3) - (resDiff * 2);
    newRisk = Math.max(5, Math.min(99, Math.round(newRisk * 10) / 10));
    setSimRisk(newRisk);
  }, [simTeamSize, simResources, baseTeamSize, baseRisk]);

  const getRiskColor = (risk) => {
    if (risk > 60) return '#e63946';
    if (risk > 35) return '#f4a261';
    return '#2a9d8f';
  };

  return (
    <div className="animate-fade-in simulation-container">
      <header className="page-header">
        <h1 className="page-title">{domain} Strategy Simulation</h1>
        <p className="page-subtitle">Adjust parameters to see real-time impact on project risk and outcomes.</p>
      </header>

      <div className="simulation-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card shadow-sm">
          <h3 className="section-title">Interactive Parameters</h3>
          
          <div className="simulation-controls" style={{ marginTop: '2rem' }}>
            <div className="control-group" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Adjust Team Size</span>
                <span style={{ color: '#0052cc', fontWeight: 700 }}>{simTeamSize} Personnel</span>
              </div>
              <input 
                type="range" min="1" max="50" value={simTeamSize} 
                onChange={(e) => setSimTeamSize(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div className="control-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600 }}>Resource Allocation</span>
                <span style={{ color: '#0052cc', fontWeight: 700 }}>Level {simResources}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" value={simResources} 
                onChange={(e) => setSimResources(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Simulation Summary</h4>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>
              By {simTeamSize > baseTeamSize ? 'increasing' : 'decreasing'} the team size to {simTeamSize} and 
              setting resources to level {simResources}, the projected risk shifts by 
              <span style={{ fontWeight: 600, color: simRisk < baseRisk ? '#2a9d8f' : '#e63946' }}>
                {' '}{Math.abs(baseRisk - simRisk).toFixed(1)}%
              </span>.
            </p>
          </div>
        </div>

        <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: `12px solid ${getRiskColor(simRisk)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.3s' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#333' }}>{simRisk}%</span>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 600 }}>Projected Risk</span>
          </div>
          
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Baseline Risk</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333' }}>{baseRisk}%</div>
              </div>
              <div>
                <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Simulated Delta</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: simRisk < baseRisk ? '#2a9d8f' : '#e63946' }}>
                  {simRisk < baseRisk ? '-' : '+'}{Math.abs(baseRisk - simRisk).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', width: '100%', padding: '0 2rem' }}>
            <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={() => alert('Configuration Saved for Strategy Report')}>
              Lock Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;

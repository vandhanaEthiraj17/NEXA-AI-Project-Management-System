import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';

const SimulationPanel = () => {
  const { projectData: data } = useContext(DataContext);

  // Extract base values or use defaults
  const baseRisk = data?.metrics?.risk_score || 50;
  const baseTeamSize = 5; 

  const [simTeamSize, setSimTeamSize] = useState(baseTeamSize);
  const [simResources, setSimResources] = useState(5);
  const [simRisk, setSimRisk] = useState(baseRisk);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    // Basic simulation logic: more team members and resources reduce risk
    const teamDiff = simTeamSize - baseTeamSize;
    const resDiff = simResources - 5;
    
    let newRisk = baseRisk - (teamDiff * 3) - (resDiff * 2);
    newRisk = Math.max(5, Math.min(99, Math.round(newRisk * 10) / 10));
    setSimRisk(newRisk);
  }, [simTeamSize, simResources, baseTeamSize, baseRisk]);

  if (!data) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>No Simulation Data</h2>
        <p style={{ color: '#666' }}>Run an analysis first to enable the interactive simulation engine.</p>
      </div>
    );
  }

  const handleSaveSnapshot = () => {
    // Calculate Efficiency Score (Lower risk + Lower resources = Higher score)
    const efficiency = (100 - simRisk) / (simTeamSize + simResources);
    
    const newSnapshot = {
      id: Date.now(),
      teamSize: simTeamSize,
      resources: simResources,
      risk: simRisk,
      efficiency: efficiency.toFixed(2),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setSnapshots(prev => [newSnapshot, ...prev].slice(0, 3)); // Keep top 3
  };

  const getRiskColor = (risk) => {
    if (risk > 60) return '#de350b';
    if (risk > 35) return '#ff991f';
    return '#00875a';
  };

  return (
    <div className="animate-fade-in simulation-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#172b4d', margin: 0 }}>Strategic Decision Intelligence</h1>
        <p style={{ fontSize: '1.1rem', color: '#5e6c84', marginTop: '0.5rem' }}>Simulate "What-If" scenarios and rank decision paths based on risk-to-resource efficiency.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        
        {/* Left: Interactive Controls */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172b4d', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0052cc' }}></div>
            Interactive Scenario Parameters
          </h3>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#42526e' }}>Variable: Team Capacity</span>
              <span style={{ background: '#deebff', color: '#0052cc', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.9rem' }}>{simTeamSize} Personnel</span>
            </div>
            <input 
              type="range" min="1" max="30" value={simTeamSize} 
              onChange={(e) => setSimTeamSize(parseInt(e.target.value))}
              style={{ width: '100%', height: '6px', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#42526e' }}>Variable: Resource Allocation</span>
              <span style={{ background: '#deebff', color: '#0052cc', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.9rem' }}>Level {simResources}/10</span>
            </div>
            <input 
              type="range" min="1" max="10" value={simResources} 
              onChange={(e) => setSimResources(parseInt(e.target.value))}
              style={{ width: '100%', height: '6px', borderRadius: '3px', cursor: 'pointer' }}
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} 
            onClick={handleSaveSnapshot}
          >
            Lock Scenario & Rank Decision
          </button>
        </div>

        {/* Right: Real-time Projection */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', border: `2px solid ${getRiskColor(simRisk)}20` }}>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ebecf0" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={getRiskColor(simRisk)} strokeWidth="3" strokeDasharray={`${simRisk}, 100`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#172b4d' }}>{simRisk}%</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>PROJECTED RISK</div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
              <div>
                <div style={{ color: '#5e6c84', fontSize: '0.8rem', marginBottom: '0.25rem' }}>BASELINE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#172b4d' }}>{baseRisk}%</div>
              </div>
              <div style={{ width: '1px', background: '#dfe1e6' }}></div>
              <div>
                <div style={{ color: '#5e6c84', fontSize: '0.8rem', marginBottom: '0.25rem' }}>DELTA</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: simRisk < baseRisk ? '#00875a' : '#de350b' }}>
                  {simRisk < baseRisk ? '-' : '+'}{Math.abs(baseRisk - simRisk).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Decision Ranking System */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172b4d', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Decision Path Ranking System
        </h3>
        
        {snapshots.length === 0 ? (
          <div style={{ padding: '3rem', border: '2px dashed #dfe1e6', borderRadius: '8px', textAlign: 'center', color: '#5e6c84' }}>
            No scenarios locked. Use the sliders above to simulate and save decision pathways for AI comparison.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {snapshots.sort((a, b) => b.efficiency - a.efficiency).map((snapshot, i) => (
              <div key={snapshot.id} className="animate-slide-in" style={{ padding: '1.25rem', background: 'white', borderRadius: '8px', border: '1px solid #dfe1e6', display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 100px', alignItems: 'center', boxShadow: i === 0 ? '0 4px 12px rgba(0, 82, 204, 0.1)' : 'none', borderColor: i === 0 ? '#0052cc' : '#dfe1e6' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: i === 0 ? '#0052cc' : '#dfe1e6' }}>#{i + 1}</div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5e6c84', fontWeight: 600 }}>TEAM / RESOURCE</div>
                  <div style={{ fontWeight: 700, color: '#172b4d' }}>{snapshot.teamSize}P / Lvl {snapshot.resources}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5e6c84', fontWeight: 600 }}>EXPOSURE RISK</div>
                  <div style={{ fontWeight: 700, color: getRiskColor(snapshot.risk) }}>{snapshot.risk}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#5e6c84', fontWeight: 600 }}>EFFICIENCY RATIO</div>
                  <div style={{ fontWeight: 700, color: '#172b4d' }}>{snapshot.efficiency}</div>
                </div>
                {i === 0 && (
                  <div style={{ background: '#deebff', color: '#0052cc', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textAlign: 'center' }}>
                    RECOMMENDED
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SimulationPanel;


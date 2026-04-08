import React from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const Dashboard = ({ data }) => {
  if (!data) return null;

  const { 
    original_risk, 
    recommended_team, 
    optimized_days, 
    risk_reduction,
    scenarios 
  } = data;

  // Determine risk color class
  const getRiskClass = (risk) => {
    if (risk > 60) return 'danger';
    if (risk > 35) return 'warning';
    return 'success';
  };

  return (
    <div className="glass-card animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>AI Prediction Results</h2>
        <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>Confidence: 94%</span>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title">Base Delay Risk</div>
          <div className={`stat-value ${getRiskClass(original_risk)}`}>
            {original_risk}%
          </div>
          <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>Initial parameters</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(15,23,42,0.6))', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="stat-title" style={{ color: 'var(--accent-success)' }}>Risk Reduction</div>
          <div className="stat-value success">
            ↓ {risk_reduction}%
          </div>
          <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>With optimizations</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Recommended Scenario</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{recommended_team}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TEAM SIZE</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-light)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{optimized_days}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DAYS</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="section-title" style={{ fontSize: '1rem', marginTop: '1rem' }}>Simulation: Risk vs Team Size</h3>
      <div className="chart-container" style={{ flexGrow: 1, minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={scenarios}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis dataKey="teamSize" stroke="var(--text-muted)" tickFormatter={(val) => `Team: ${val}`} />
            <YAxis stroke="var(--text-muted)" tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border-light)', borderRadius: '0.5rem', color: 'var(--text-main)' }}
              itemStyle={{ color: 'var(--text-main)' }}
            />
            <Area type="monotone" dataKey="risk" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { AlertCircle, CheckCircle, TrendingDown, Info, UserPlus, Briefcase, Calendar, X, TrendingUp, Zap } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);
  const [modalContent, setModalContent] = useState(null);
  
  if (!data) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>No Analysis Data</h2>
        <p style={{ color: '#666' }}>Please run a new analysis to see the decision intelligence dashboard.</p>
      </div>
    );
  }

  const { risk_score, success_probability, recommended_action, risk_reason, success_reason } = data.metrics;
  const scenarios = data.scenarios;
  const { best_decision, explanation } = data;

  const getRiskColor = (risk) => {
    if (risk > 60) return '#de350b';
    if (risk > 35) return '#ff991f';
    return '#00875a';
  };

  // Mocked Trend Data for Full Analytics
  const trendData = [
    { name: 'W1', risk: 45, velocity: 12 },
    { name: 'W2', risk: 42, velocity: 15 },
    { name: 'W3', risk: 38, velocity: 18 },
    { name: 'W4', risk: risk_score, velocity: 22 }
  ];

  return (
    <div className="animate-fade-in dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#172b4d', margin: 0 }}>Executive Analytics Dashboard</h1>
          <p style={{ fontSize: '1.1rem', color: '#5e6c84', marginTop: '0.4rem' }}>{domain} Intelligence • Real-time Risk & Performance Monitoring</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/app/analysis')}>New Analysis</button>
      </header>

      {/* Top Level KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: `6px solid ${getRiskColor(risk_score)}` }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>Current Risk</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: getRiskColor(risk_score) }}>{risk_score}%</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '6px solid #00875a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>Success Prob.</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00875a' }}>{success_probability}%</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '6px solid #0052cc' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>Team Velocity</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#172b4d' }}>22.5 pts</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '6px solid #ff991f' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase' }}>Resource Health</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#172b4d' }}>92%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Performance Trends Chart */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172b4d', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="#0052cc" /> Performance & Risk Trends
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getRiskColor(risk_score)} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={getRiskColor(risk_score)} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebecf0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="risk" stroke={getRiskColor(risk_score)} fillOpacity={1} fill="url(#colorRisk)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Decision Recommendations */}
        <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #0052cc 0%, #0747a6 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>AI Decision Intelligence</h3>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Optimal Strategy: {best_decision.name}</div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
              {explanation}
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, textTransform: 'uppercase' }}>Implementation Cost</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{best_decision.cost}</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/app/simulation')}
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', borderRadius: '8px', background: 'white', color: '#0052cc', border: 'none', fontWeight: 700, cursor: 'pointer' }}
            >
              Analyze What-If Alternatives
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
        {/* Scenario Ranking */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#172b4d', marginBottom: '1.5rem' }}>Scenario Performance Analysis</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebecf0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]} barSize={30}>
                  {scenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.risk > 60 ? '#de350b' : '#0052cc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Risk reasoning boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem', borderLeft: `4px solid ${getRiskColor(risk_score)}`, flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: getRiskColor(risk_score), fontWeight: 700 }}>AI Risk Reasoning</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#42526e', lineHeight: 1.5 }}>{risk_reason}</p>
          </div>
          <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #00875a', flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#00875a', fontWeight: 700 }}>AI Success Drivers</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#42526e', lineHeight: 1.5 }}>{success_reason}</p>
          </div>
        </div>
      </div>

      {/* Reasoning Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>{modalContent.title}</h3>
              <button onClick={() => setModalContent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${modalContent.type === 'risk' ? getRiskColor(risk_score) : '#52c41a'}` }}>
              <p style={{ margin: 0, color: '#172b4d', lineHeight: 1.6, fontSize: '1rem', fontWeight: 500 }}>
                {modalContent.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;


import React, { useContext } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { AlertCircle, CheckCircle, TrendingDown, Info, UserPlus, Briefcase, Calendar, X } from 'lucide-react';

const DashboardPage = () => {
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);
  const [modalContent, setModalContent] = React.useState(null);
  const [expandedResources, setExpandedResources] = React.useState(false);
  
  if (!data) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>No Analysis Data</h2>
        <p style={{ color: '#666' }}>Please run a new analysis to see the decision intelligence dashboard.</p>
      </div>
    );
  }

  const { risk_score, success_probability, recommended_action, risk_reason, success_reason, resource_details } = data.metrics;
  const scenarios = data.scenarios;
  const { best_decision, explanation } = data;

  const getRiskColor = (risk) => {
    if (risk > 60) return '#ff4d4f'; // Trendy Red
    if (risk > 35) return '#ffa940'; // Trendy Orange
    return '#52c41a'; // Trendy Green
  };

  const TrendyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#172b4d' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: payload[0].payload.risk > 60 ? '#ff4d4f' : '#0052cc', fontSize: '0.85rem' }}>
            Risk: {payload[0].value.toFixed(1)}%
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#5e6c84' }}>Confidence: High</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in dashboard-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">{domain} Decision Dashboard</h1>
        <p className="page-subtitle">AI-Driven Risk Prediction & Strategy Optimization</p>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
        <div 
          className="card shadow-sm clickable-card" 
          onClick={() => setModalContent({ title: 'Risk Intelligence Analysis', value: `${risk_score}%`, reason: risk_reason, type: 'risk' })}
          style={{ background: 'linear-gradient(135deg, #fff 0%, #fff1f0 100%)', border: 'none', borderLeft: `6px solid ${getRiskColor(risk_score)}`, borderRadius: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#ff4d4f', opacity: 0.6 }}><Info size={16} /></div>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Risk Score</div>
          <div className="stat-value" style={{ color: getRiskColor(risk_score), fontSize: '2.5rem', fontWeight: 800 }}>{risk_score}%</div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Click to view AI reasoning</p>
        </div>
        
        <div 
          className="card shadow-sm clickable-card" 
          onClick={() => setModalContent({ title: 'Success Probability Breakdown', value: `${success_probability}%`, reason: success_reason, type: 'success' })}
          style={{ background: 'linear-gradient(135deg, #fff 0%, #f6ffed 100%)', border: 'none', borderLeft: `6px solid #52c41a`, borderRadius: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#52c41a', opacity: 0.6 }}><CheckCircle size={16} /></div>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Success Probability</div>
          <div className="stat-value" style={{ color: '#52c41a', fontSize: '2.5rem', fontWeight: 800 }}>{success_probability}%</div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Click to view factors</p>
        </div>

        <div className="card shadow-sm" style={{ background: 'linear-gradient(135deg, #fff 0%, #e6f7ff 100%)', border: 'none', borderLeft: `6px solid #0052cc`, borderRadius: '12px', gridColumn: 'span 1' }}>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended Strategy</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: '#0052cc', marginTop: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>{recommended_action}</div>
          
          <div className="resource-list" style={{ marginTop: '1rem', borderTop: '1px solid rgba(0, 82, 204, 0.1)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0052cc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={14} /> AI RECOMMENDED ROLES:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: expandedResources ? '300px' : 'auto', overflowY: expandedResources ? 'auto' : 'visible', paddingRight: expandedResources ? '0.5rem' : '0' }}>
              {resource_details && (expandedResources ? resource_details : resource_details.slice(0, 3)).map(res => (
                <div key={res.id} style={{ background: 'rgba(255,255,255,0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0, 82, 204, 0.05)', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{res.role}</span>
                    <span style={{ fontSize: '0.7rem', color: '#5e6c84', background: '#deebff', padding: '1px 6px', borderRadius: '4px' }}>{res.experience}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#5e6c84', margin: 0 }}>{res.tasks}</p>
                </div>
              ))}
              {resource_details && resource_details.length > 3 && (
                <p 
                  onClick={() => setExpandedResources(!expandedResources)}
                  style={{ fontSize: '0.7rem', textAlign: 'center', color: '#0052cc', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  {expandedResources ? 'Show Less' : `+ ${resource_details.length - 3} more tailored resources`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        <div className="card shadow-sm">
          <h3 className="section-title">Scenario Comparison</h3>
          <div style={{ width: '100%', height: '350px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052cc" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0052cc" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d4f" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff4d4f" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} dx={-10} />
                <Tooltip content={<TrendyTooltip />} cursor={{fill: 'rgba(0, 82, 204, 0.05)', radius: 10}} />
                <Bar dataKey="risk" radius={[10, 10, 0, 0]} barSize={40}>
                  {scenarios.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.risk > 60 ? 'url(#riskGradient)' : 'url(#barGradient)'}
                      stroke={entry.risk > 60 ? '#ff4d4f' : '#0052cc'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card shadow-sm">
          <h3 className="section-title">Decision Intelligence</h3>
          <div className="best-decision-box" style={{ background: '#f0f7ff', border: '1px solid #b3d4ff', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle color="#0052cc" size={24} />
              <h4 style={{ margin: 0, color: '#0052cc' }}>Optimal Selection: {best_decision.name}</h4>
            </div>
            <p style={{ color: '#333', lineHeight: 1.6, fontSize: '0.95rem' }}>{explanation}</p>
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #cce0ff', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                <span>Simulated Risk:</span>
                <span style={{ fontWeight: 600, color: getRiskColor(best_decision.risk) }}>{best_decision.risk.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <span>Implementation Cost:</span>
                <span style={{ fontWeight: 600 }}>{best_decision.cost}</span>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <TrendingDown size={18} /> Visualize Simulations
            </button>
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
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: modalContent.type === 'risk' ? getRiskColor(risk_score) : '#52c41a' }}>{modalContent.value}</span>
              <span style={{ fontWeight: 600, color: '#888' }}>Project Rating</span>
            </div>

            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${modalContent.type === 'risk' ? getRiskColor(risk_score) : '#52c41a'}` }}>
              <p style={{ margin: 0, color: '#172b4d', lineHeight: 1.6, fontSize: '1rem', fontWeight: 500 }}>
                {modalContent.reason}
              </p>
            </div>

            <button 
              onClick={() => setModalContent(null)}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '0.8rem', borderRadius: '8px' }}
            >
              Continue Monitoring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { AlertCircle, CheckCircle, TrendingDown, Info, UserPlus, Briefcase, Calendar, X } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);
  const [modalContent, setModalContent] = React.useState(null);
  
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

      <div className="dashboard-main-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'max-content max-content 1fr auto',
        gridTemplateAreas: `
          "risk success strategy"
          "scenarios scenarios strategy"
          "details details strategy"
          "intelligence intelligence intelligence"
        `,
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Risk Card */}
        <div 
          className="card shadow-sm clickable-card" 
          onClick={() => setModalContent({ title: 'Risk Intelligence Analysis', value: `${risk_score}%`, reason: risk_reason, type: 'risk' })}
          style={{ 
            gridArea: 'risk',
            background: 'linear-gradient(135deg, #fff 0%, #fff1f0 100%)', 
            border: 'none', 
            borderLeft: `6px solid ${getRiskColor(risk_score)}`, 
            borderRadius: '12px', 
            cursor: 'pointer', 
            position: 'relative', 
            overflow: 'hidden',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#ff4d4f', opacity: 0.6 }}><Info size={16} /></div>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Risk Score</div>
          <div className="stat-value" style={{ color: getRiskColor(risk_score), fontSize: '2.5rem', fontWeight: 800 }}>{risk_score}%</div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Click to view AI reasoning</p>
        </div>
        
        {/* Success Card */}
        <div 
          className="card shadow-sm clickable-card" 
          onClick={() => setModalContent({ title: 'Success Probability Breakdown', value: `${success_probability}%`, reason: success_reason, type: 'success' })}
          style={{ 
            gridArea: 'success',
            background: 'linear-gradient(135deg, #fff 0%, #f6ffed 100%)', 
            border: 'none', 
            borderLeft: `6px solid #52c41a`, 
            borderRadius: '12px', 
            cursor: 'pointer', 
            position: 'relative', 
            overflow: 'hidden',
            minHeight: '160px'
          }}
        >
          <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#52c41a', opacity: 0.6 }}><CheckCircle size={16} /></div>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Success Probability</div>
          <div className="stat-value" style={{ color: '#52c41a', fontSize: '2.5rem', fontWeight: 800 }}>{success_probability}%</div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>Click to view factors</p>
        </div>

        {/* Recommended Strategy Card */}
        <div className="card shadow-sm" style={{ 
          gridArea: 'strategy',
          background: 'linear-gradient(135deg, #fff 0%, #e6f7ff 100%)', 
          border: 'none', 
          borderLeft: `6px solid #0052cc`, 
          borderRadius: '12px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="stat-label" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended Strategy</div>
          <div className="stat-value" style={{ fontSize: '1.4rem', color: '#0052cc', marginTop: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>{recommended_action}</div>
          
          <div className="resource-list" style={{ marginTop: 'auto', borderTop: '1px solid rgba(0, 82, 204, 0.1)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0052cc', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={14} /> AI RECOMMENDED ROLES:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {resource_details && resource_details.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => setModalContent({ type: 'developer', developer: res })}
                  style={{ background: 'rgba(255,255,255,0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0, 82, 204, 0.05)', transition: 'all 0.2s', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', cursor: 'pointer' }}
                  className="clickable-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#172b4d' }}>{res.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#52c41a', background: '#f6ffed', border: '1px solid #b7eb8f', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{res.availability}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0052cc', fontWeight: 600 }}>
                    {res.role} <span style={{ color: '#888', fontWeight: 400 }}>• {res.experience}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#5e6c84', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong>Skills:</strong> {res.skills}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem', paddingTop: '0.4rem', borderTop: '1px dashed rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff4d4f' }}>⭐ {res.performance} Rating</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#172b4d' }}>💰 {res.salary}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Comparison Section */}
        <div className="card shadow-sm" style={{ gridArea: 'scenarios' }}>
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

        {/* Dynamic AI Reasoning Details Section */}
        <div className="card shadow-sm" style={{ gridArea: 'details', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 className="section-title">AI Dynamic Risk Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', flex: 1 }}>
            <div 
              className="clickable-card"
              onClick={() => setModalContent({ title: 'Identified Risk Issues', value: `${risk_score}%`, reason: risk_reason, type: 'risk' })}
              style={{ background: 'rgba(255, 77, 79, 0.05)', border: '1px solid rgba(255, 77, 79, 0.2)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #ff4d4f', cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} color="#ff4d4f" />
                <h4 style={{ margin: 0, color: '#ff4d4f', fontWeight: 600 }}>Identified Risk Issues</h4>
              </div>
              <p style={{ margin: 0, color: '#172b4d', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {risk_reason}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ff4d4f', fontWeight: 600 }}>Tap to view detailed report →</div>
            </div>
            
            <div 
              className="clickable-card"
              onClick={() => setModalContent({ title: 'Success Probability Drivers', value: `${success_probability}%`, reason: success_reason, type: 'success' })}
              style={{ background: 'rgba(82, 196, 26, 0.05)', border: '1px solid rgba(82, 196, 26, 0.2)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid #52c41a', cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <CheckCircle size={18} color="#52c41a" />
                <h4 style={{ margin: 0, color: '#52c41a', fontWeight: 600 }}>Success Probability Drivers</h4>
              </div>
              <p style={{ margin: 0, color: '#172b4d', fontSize: '0.95rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {success_reason}
              </p>
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#52c41a', fontWeight: 600 }}>Tap to view detailed report →</div>
            </div>
          </div>
        </div>

        {/* Decision Intelligence Section (Horizontal) */}
        <div className="card shadow-sm" style={{ gridArea: 'intelligence', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
          <h3 className="section-title" style={{ marginBottom: '1.5rem' }}>Decision Intelligence</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div className="best-decision-box" style={{ flex: 2, background: '#f0f7ff', border: '1px solid #b3d4ff', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <CheckCircle color="#0052cc" size={24} />
                <h4 style={{ margin: 0, color: '#0052cc', fontWeight: 700 }}>Optimal Selection: {best_decision.name}</h4>
              </div>
              <p style={{ color: '#333', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>{explanation}</p>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 82, 204, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0, 82, 204, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5e6c84', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                  <span>Simulated Risk:</span>
                  <span style={{ fontWeight: 700, color: getRiskColor(best_decision.risk) }}>{best_decision.risk.toFixed(1)}%</span>
                </div>
                <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${best_decision.risk}%`, height: '100%', background: getRiskColor(best_decision.risk) }} />
                </div>
              </div>

              <div style={{ background: 'rgba(0, 82, 204, 0.03)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(0, 82, 204, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5e6c84', fontSize: '0.85rem' }}>
                  <span>Implementation Cost:</span>
                  <span style={{ fontWeight: 700, color: '#172b4d' }}>{best_decision.cost}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/app/simulation')}
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#0052cc', color: '#fff', border: 'none', padding: '0.8rem', cursor: 'pointer' }}
              >
                <TrendingDown size={18} /> Visualize Simulations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reasoning Modal */}
      {modalContent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.4)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem' }}>
                {modalContent.type === 'developer' ? 'Developer Profile' : modalContent.title}
              </h3>
              <button onClick={() => setModalContent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}><X size={20} /></button>
            </div>
            
            {modalContent.type === 'developer' ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #0052cc 0%, #00a3bf 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {modalContent.developer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#172b4d' }}>{modalContent.developer.name}</h4>
                    <p style={{ margin: 0, color: '#5e6c84', fontSize: '0.9rem' }}>{modalContent.developer.role} • {modalContent.developer.experience}</p>
                  </div>
                </div>
                
                <div style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#5e6c84', fontWeight: 600, fontSize: '0.85rem' }}>Performance:</span>
                    <span style={{ color: '#172b4d', fontWeight: 700, fontSize: '0.9rem' }}>⭐ {modalContent.developer.performance} Rating</span>
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#5e6c84', fontWeight: 600, fontSize: '0.85rem' }}>Expected Payroll:</span>
                    <span style={{ color: '#172b4d', fontWeight: 700, fontSize: '0.9rem' }}>💰 {modalContent.developer.salary}/mo</span>
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#5e6c84', fontWeight: 600, fontSize: '0.85rem' }}>Availability:</span>
                    <span style={{ color: '#52c41a', fontWeight: 700, background: '#f6ffed', padding: '2px 8px', borderRadius: '4px', border: '1px solid #b7eb8f', fontSize: '0.8rem' }}>{modalContent.developer.availability}</span>
                  </p>
                  <div style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ color: '#5e6c84', fontWeight: 600, display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Core Skills:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {modalContent.developer.skills.split(',').map((skill, i) => (
                        <span key={i} style={{ background: '#fff', color: '#0052cc', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #b3d4ff', fontWeight: 600 }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => {
                        window.alert(`${modalContent.developer.name} has been added to the project!`); 
                        setModalContent(null);
                    }}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: '#0052cc', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s', ':hover': { background: '#003d99' } }}
                  >
                    Add Developer
                  </button>
                  <button 
                    onClick={() => setModalContent(null)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'transparent', border: '1px solid #dfe1e6', color: '#5e6c84', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  style={{ width: '100%', marginTop: '2rem', padding: '0.8rem', borderRadius: '8px', background: '#0052cc', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Continue Monitoring
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

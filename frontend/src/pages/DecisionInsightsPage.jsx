import React, { useContext, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { Info, CheckCircle, ShieldAlert, X, Mail, MessageCircle, Download, Share2 } from 'lucide-react';

const DecisionInsightsPage = () => {
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!data) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#333' }}>No Analytics</h2>
        <p style={{ color: '#666' }}>Run an analysis to generate AI-powered decision insights.</p>
      </div>
    );
  }

  const { risk_score } = data.metrics;
  const { best_decision, explanation } = data;
  const scenarios = data.scenarios;

  const handleExport = (type) => {
    // Mock export handling
    alert(`Generating ${type} export...`);
    setShowExportModal(false);
  };

  const TrendyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#172b4d' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: payload[0].payload.name === best_decision.name ? '#52c41a' : '#0052cc', fontSize: '0.85rem' }}>
            Risk: {payload[0].value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in insights-container">
      <header className="page-header">
        <h1 className="page-title">{domain} Strategic Insights</h1>
        <p className="page-subtitle">Deep learning analysis of input parameters and simulated outcomes.</p>
      </header>

      <div className="card shadow-sm" style={{ marginBottom: '2rem', borderLeft: '6px solid #0052cc', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Info color="#0052cc" size={32} />
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a1a1a' }}>Why this decision?</h2>
        </div>
        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#444' }}>
          {explanation}
        </div>
      </div>

      <div className="insights-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card shadow-sm">
          <h3 className="section-title">Efficacy Analysis</h3>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="defGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052cc" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#0052cc" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#5e6c84', fontSize: 12}} />
                <Tooltip content={<TrendyTooltip />} />
                <Bar dataKey="risk" radius={[10, 10, 0, 0]} barSize={45}>
                  {scenarios.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === best_decision.name ? 'url(#optGradient)' : 'url(#defGradient)'} 
                      stroke={entry.name === best_decision.name ? '#52c41a' : '#0052cc'}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginTop: '1rem' }}>
            Comparative risk levels across different simulated configurations.
          </p>
        </div>

        <div className="card shadow-sm" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          <h3 className="section-title">Critical Takeaways</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5' }}>
            <CheckCircle color="#2a9d8f" size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#2a9d8f', marginBottom: '0.25rem' }}>Optimized Path Found</div>
              <div style={{ fontSize: '0.9rem', color: '#2d3748' }}>The "{best_decision.name}" scenario offers the best risk-to-resource ratio.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: '#fffaf0', borderRadius: '8px', border: '1px solid #feebc8' }}>
            <ShieldAlert color="#f4a261" size={24} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#f4a261', marginBottom: '0.25rem' }}>Constraint Awareness</div>
              <div style={{ fontSize: '0.9rem', color: '#2d3748' }}>The current baseline risk is {risk_score}%, which requires immediate mitigation.</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowExportModal(true)}>
              Export Intelligence Report
            </button>
          </div>

          {/* Export Modal */}
          {showExportModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease' }}>
              <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px', position: 'relative', animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
                <button onClick={() => setShowExportModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#5e6c84' }}>
                  <X size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: '#172b4d' }}>
                  <Share2 size={24} color="#0052cc" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Share & Export</h3>
                </div>
                <p style={{ color: '#5e6c84', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select how you would like to share the {domain} strategic insights report.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={() => handleExport('Email')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                    <Mail size={18} color="#0052cc" /> Send via Email
                  </button>
                  <button className="btn-secondary" onClick={() => handleExport('WhatsApp')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                    <MessageCircle size={18} color="#25D366" /> Share to WhatsApp
                  </button>
                  <button className="btn-secondary" onClick={() => handleExport('LinkedIn')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                    <Share2 size={18} color="#0077b5" /> Post to LinkedIn
                  </button>
                  <button className="btn-secondary" onClick={() => handleExport('PDF')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', background: 'white', border: '1px solid #dfe1e6', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
                    <Download size={18} color="#172b4d" /> Download as PDF
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DecisionInsightsPage;


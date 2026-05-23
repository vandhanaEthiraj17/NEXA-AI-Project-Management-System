import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AppContext } from '../context/AppContext';
import { Send, CheckCircle, FileText, ArrowRight, User, Briefcase, DollarSign, Clock, History, Layout, Search } from 'lucide-react';

const ClientPortal = () => {
  const { submitBrief, generateProposal, approveProposal, fetchBriefs } = useContext(DataContext);
  const { user } = useContext(AppContext);
  
  const [view, setView] = useState('new'); // 'new' or 'history'
  const [briefData, setBriefData] = useState({
    client_name: '',
    project_description: '',
    budget: '',
    timeline_weeks: ''
  });
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setBriefData({ ...briefData, [e.target.name]: e.target.value });
  };

  const handleSubmitBrief = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await submitBrief(briefData);
    if (res && res.status === 'success') {
      setStep(2);
      // Simulate AI Scoping Delay
      setTimeout(async () => {
        const propRes = await generateProposal(res.brief_id, briefData.project_description);
        if (propRes && propRes.status === 'success') {
          setProposal(propRes);
          setStep(3);
        }
        setLoading(false);
      }, 3000);
    } else {
      setLoading(false);
      alert('Submission failed');
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveProposal(proposal.proposal_id, proposal.tasks, briefData.client_name);
    if (res && res.status === 'success') {
      setStep(4);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', padding: '4rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#172b4d', marginBottom: '1.25rem' }}>
            Enterprise Project Portal
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button 
              onClick={() => setView('new')}
              style={{ 
                padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
                background: view === 'new' ? '#0052cc' : 'white',
                color: view === 'new' ? 'white' : '#172b4d',
                fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Send size={16} /> New Engagement
            </button>
            <button 
              onClick={() => setView('history')}
              style={{ 
                padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
                background: view === 'history' ? '#0052cc' : 'white',
                color: view === 'history' ? 'white' : '#172b4d',
                fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <History size={16} /> Active Projects
            </button>
          </div>
        </div>

        {/* Step Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', height: '2px', background: '#dfe1e6', zIndex: 0 }}></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step >= s ? '#0052cc' : '#f4f5f7', 
              border: `2px solid ${step >= s ? '#0052cc' : '#dfe1e6'}`,
              color: step >= s ? 'white' : '#5e6c84',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, zIndex: 1, position: 'relative'
            }}>
              {step > s ? <CheckCircle size={18} /> : s}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="card" style={{ padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(9, 30, 66, 0.08)' }}>
          
          {view === 'new' && step === 1 && (
            <form onSubmit={handleSubmitBrief} className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#172b4d' }}>Project Brief</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#42526e' }}>Company / Client Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#a5adba' }} />
                  <input 
                    type="text" name="client_name" required
                    placeholder="Enter your name"
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '2px solid #dfe1e6' }}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#42526e' }}>Project Description</label>
                <textarea 
                  name="project_description" required
                  placeholder="Describe your project goals (e.g., 'A web platform for real estate management with a database backend')"
                  style={{ width: '100%', height: '120px', padding: '0.75rem', borderRadius: '6px', border: '2px solid #dfe1e6', resize: 'none' }}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#42526e' }}>Target Budget ($)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#a5adba' }} />
                    <input 
                      type="number" name="budget" placeholder="5000"
                      style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '2px solid #dfe1e6' }}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#42526e' }}>Expected Timeline (Weeks)</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#a5adba' }} />
                    <input 
                      type="number" name="timeline_weeks" placeholder="4"
                      style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '2px solid #dfe1e6' }}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }} disabled={loading}>
                {loading ? <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <Send size={20} />}
                Generate AI Proposal
              </button>
            </form>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }} className="animate-fade-in">
              <div width="80" height="80" style={{ margin: '0 auto 2rem' }}>
                <div className="animate-bounce" style={{ background: '#0052cc', width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText color="white" size={32} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: '#172b4d' }}>Architecting Your Vision...</h2>
              <p style={{ color: '#5e6c84', fontSize: '1.1rem' }}>Our AI is scanning your requirements to generate a granular task breakdown and cost estimation.</p>
              <div style={{ width: '100%', height: '8px', background: '#ebecf0', borderRadius: '4px', overflow: 'hidden', marginTop: '2.5rem' }}>
                <div className="animate-slide-in" style={{ height: '100%', background: '#0052cc', width: '70%', borderRadius: '4px' }}></div>
              </div>
            </div>
          )}

          {step === 3 && proposal && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#172b4d' }}>AI Proposal V1.0</h2>
                <div style={{ background: '#e3fcef', color: '#006644', padding: '0.5rem 1rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.85rem' }}>READY FOR REVIEW</div>
              </div>

              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600, textTransform: 'uppercase' }}>ESTIMATED COST</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172b4d' }}>${proposal.cost.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600, textTransform: 'uppercase' }}>ESTIMATED DELIVERY</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172b4d' }}>{proposal.days} Days</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#42526e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} /> Proposed Project Scope
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
                {proposal.tasks.map((task, i) => (
                  <div key={i} style={{ padding: '1rem', background: '#ffffff', border: '1px solid #dfe1e6', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#172b4d' }}>{task.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#5e6c84' }}>Complexity: {task.complexity}/10</div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0052cc' }}>{task.deadline_days}d</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '1rem', borderRadius: '6px', border: '2px solid #dfe1e6', background: 'white', fontWeight: 700, color: '#42526e', cursor: 'pointer' }}
                >
                  Edit Brief
                </button>
                <button 
                  onClick={handleApprove}
                  className="btn-primary" 
                  style={{ flex: 2, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
                >
                  {loading ? <div className="animate-spin" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div> : <CheckCircle size={20} />}
                  Approve and Start Project
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }} className="animate-fade-in">
              <div style={{ width: '80px', height: '80px', background: '#e3fcef', borderRadius: '50%', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle color="#00875a" size={48} />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#172b4d' }}>Project Confirmed!</h2>
              <p style={{ color: '#5e6c84', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                Your project has been successfully funneled into the AI Resource Matcher.
              </p>
              <button 
                onClick={() => setView('history')} 
                className="btn-primary" 
                style={{ padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
              >
                Track Progress in Dashboard <ArrowRight size={20} />
              </button>
            </div>
          )}

          {view === 'history' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#172b4d' }}>Your Active Engagements</h2>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#a5adba' }} />
                  <input type="text" placeholder="Search projects..." style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', borderRadius: '6px', border: '1px solid #dfe1e6', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  { name: "Global Supply Chain AI", status: "In Execution", progress: 65, manager: "Alice Chen" },
                  { name: "Enterprise Auth Migration", status: "Scoping", progress: 15, manager: "System AI" }
                ].map((proj, i) => (
                  <div key={i} className="card" style={{ padding: '1.5rem', border: '1px solid #dfe1e6', borderRadius: '12px', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#172b4d' }}>{proj.name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#5e6c84' }}>Managed by: {proj.manager}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ padding: '0.2rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, background: '#ebf5ff', color: '#0052cc' }}>{proj.status}</span>
                            <div style={{ fontSize: '0.8rem', color: '#00875a', fontWeight: 700, marginTop: '0.25rem' }}>On Track</div>
                        </div>
                    </div>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#5e6c84', fontWeight: 600 }}>Implementation Progress</span>
                        <span style={{ color: '#172b4d', fontWeight: 700 }}>{proj.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f4f5f7', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${proj.progress}%`, height: '100%', background: '#0052cc', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.9rem', color: '#a5adba' }}>
          Real-time AI Scoping Engine v2.4 | Powered by VDS Machine Learning
        </div>

      </div>
    </div>
  );
};

export default ClientPortal;

import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { AppContext } from '../context/AppContext';
import { 
  Send, CheckCircle, FileText, ArrowRight, User, Briefcase, 
  DollarSign, Clock, History, Layout, Search, Sparkles, 
  ChevronRight, RefreshCw, Cpu, Award, MessageSquareCode
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const ClientPortal = () => {
  const { submitBrief, generateProposal, approveProposal, fetchBriefs } = useContext(DataContext);
  const { user } = useContext(AppContext);
  
  const [view, setView] = useState('new'); // 'new' or 'history'
  const [step, setStep] = useState(1);
  const [briefData, setBriefData] = useState({
    client_name: '',
    project_description: '',
    budget: '',
    timeline_weeks: ''
  });
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyBriefs, setHistoryBriefs] = useState([]);

  const loadHistoryBriefs = async () => {
    try {
      const res = await fetchBriefs();
      if (res && res.status === 'success') {
        setHistoryBriefs(res.briefs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistoryBriefs();
  }, []);

  const handleInputChange = (e) => {
    setBriefData({ ...briefData, [e.target.name]: e.target.value });
  };

  const handleSubmitBrief = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await submitBrief(briefData);
    if (res && res.status === 'success') {
      setStep(2);
      // Simulate highly advanced Generative AI Scoping delay
      setTimeout(async () => {
        const propRes = await generateProposal(res.brief_id, briefData.project_description);
        if (propRes && propRes.status === 'success') {
          setProposal(propRes);
          setStep(3);
        } else {
          alert('AI Scoping Core encountered an estimation parameter error.');
          setStep(1);
        }
        setLoading(false);
      }, 2500);
    } else {
      setLoading(false);
      alert('Failed to transmit specifications to NEXA core.');
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveProposal(proposal.proposal_id, proposal.tasks, briefData.client_name);
    if (res && res.status === 'success') {
      setStep(4);
      loadHistoryBriefs();
    } else {
      alert('Handshake failed.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-8 select-none py-6">
      {/* Header Info */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2 tracking-tight">
          <Briefcase className="text-neon-cyan animate-pulse" size={24} />
          NEXA Client Engagement Portal
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          Submit specifications to initialize autonomous AI scoping, cost estimations, and skill-role matching.
        </p>

        {/* View Selection Toggle */}
        <div className="flex justify-center gap-2 pt-2">
          <button 
            onClick={() => { setView('new'); setStep(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 font-mono ${
              view === 'new'
                ? 'bg-neon-cyan/15 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.02] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Send size={14} /> NEW ENGAGEMENT
          </button>
          <button 
            onClick={() => { setView('history'); loadHistoryBriefs(); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 font-mono ${
              view === 'history'
                ? 'bg-neon-cyan/15 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.02] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <History size={14} /> ENGAGEMENTS REGISTRY
          </button>
        </div>
      </div>

      {/* Step Progress Indicators */}
      {view === 'new' && (
        <div className="flex justify-between items-center relative max-w-sm mx-auto py-2">
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/5 z-0 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs z-10 transition-all duration-500 ${
              step >= s 
                ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.25)] font-bold' 
                : 'bg-black border-white/5 text-slate-600'
            }`}>
              {step > s ? <CheckCircle size={14} className="text-neon-cyan" /> : s}
            </div>
          ))}
        </div>
      )}

      {/* Main Workspace Card */}
      <GlassCard className="p-6 md:p-8 border border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>

        {/* View 1: New Submission */}
        {view === 'new' && step === 1 && (
          <form onSubmit={handleSubmitBrief} className="space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono mb-6">Initialize Specs Scan</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">Client / Company Identity</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input 
                  type="text" 
                  name="client_name" 
                  required
                  placeholder="Enter client company name"
                  onChange={handleInputChange}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">Functional Description Scope</label>
              <textarea 
                name="project_description" 
                required
                placeholder="Describe your design specifications (e.g. 'A cross-platform mobile application with push notification support and an SQLite database')"
                onChange={handleInputChange}
                className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-none h-32 leading-relaxed"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">Target Financial Budget ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <DollarSign size={14} />
                  </span>
                  <input 
                    type="number" 
                    name="budget" 
                    placeholder="12000"
                    onChange={handleInputChange}
                    className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block font-mono">Target Timeline (Weeks)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Clock size={14} />
                  </span>
                  <input 
                    type="number" 
                    name="timeline_weeks" 
                    placeholder="4"
                    onChange={handleInputChange}
                    className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-neon-cyan hover:bg-neon-cyan/85 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 uppercase font-mono tracking-wider pt-3"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Initialize Proposal Generation
            </button>
          </form>
        )}

        {/* View 2: Scoping Processing */}
        {step === 2 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Cpu className="text-neon-cyan animate-spin [animation-duration:8s]" size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">AI NEURAL SCOPING ENGINE RUNNING...</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
                Decomposing brief parameters, compiling User Story logic blocks, mapping developer availabilities, and projecting timeline burn curves.
              </p>
            </div>
            <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-neon-cyan animate-pulse" style={{ width: '80%' }}></div>
            </div>
          </div>
        )}

        {/* View 3: Proposal Review (Upgraded with detailed stories, techs, complexity) */}
        {step === 3 && proposal && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide">NEXA Scoping Proposal</h2>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5 block">AI engine source: {proposal.source || 'NEXA Heuristic Engine'}</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                SCANS COMPLETE
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 bg-black/45 border border-white/5 p-4 rounded-xl">
              <div>
                <span className="text-[9px] text-slate-500 font-mono block mb-0.5 uppercase">AI ESTIMATED BUDGET COST</span>
                <span className="text-xl font-extrabold text-white font-mono text-emerald-400">${proposal.cost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono block mb-0.5 uppercase">AI ESTIMATED TIMELINE</span>
                <span className="text-xl font-extrabold text-white font-mono text-neon-cyan">{proposal.days} Days</span>
              </div>
            </div>

            {/* Generative user stories list */}
            {proposal.user_stories && proposal.user_stories.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <MessageSquareCode size={14} className="text-neon-purple" />
                  Synthesized User Stories
                </h3>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {proposal.user_stories.map((story, i) => (
                    <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl font-sans text-xs">
                      <strong className="text-white block mb-1 font-mono text-[11px]">{story.title}</strong>
                      <p className="text-slate-400 leading-relaxed font-sans text-[11px]">{story.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technology tags and architectural complexity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposal.technology_recommendations && proposal.technology_recommendations.length > 0 && (
                <div className="space-y-2.5 bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Award size={12} className="text-neon-cyan" /> Tech stack recommendations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {proposal.technology_recommendations.map(tech => (
                      <span key={tech} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-slate-300">
                        {tech.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {proposal.complexity_analysis && (
                <div className="space-y-2.5 bg-black/20 p-4 rounded-xl border border-white/5">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Cpu size={12} className="text-neon-purple" /> Complexity evaluation
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {proposal.complexity_analysis}
                  </p>
                </div>
              )}
            </div>

            {/* Task Decomposition List */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Briefcase size={14} className="text-neon-cyan" />
                Granular Task backlogs ({proposal.tasks.length} items)
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 divide-y divide-white/5">
                {proposal.tasks.map((task, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-xs text-white leading-none font-sans">{task.title}</div>
                      <div className="text-[9px] text-slate-500 font-mono">COMPLEXITY VECTOR: {task.complexity}/10</div>
                    </div>
                    <span className="text-xs font-mono font-bold text-neon-cyan shrink-0">{task.deadline_days}d</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors font-mono uppercase tracking-wider"
              >
                Refine Specs
              </button>
              <button 
                onClick={handleApprove}
                className="flex-[2] bg-neon-cyan hover:bg-neon-cyan/85 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={14} />}
                Confirm Scope & Deploy BACKLOGS
              </button>
            </div>
          </div>
        )}

        {/* View 4: Completed Confirmation */}
        {step === 4 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Specs Deployed Successfully!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-sans">
                Project scoping metrics have been parsed. Backlog logs are generated and mapped to available developers dynamically based on direct skill matrices.
              </p>
            </div>
            <button 
              onClick={() => setView('history')} 
              className="bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-xl transition-all duration-200 uppercase tracking-wider font-mono inline-flex items-center gap-1.5"
            >
              Access Backlog Tracker <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* View 5: History List */}
        {view === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide">Registered Client Briefings ({historyBriefs.length})</h2>
              <div className="relative w-full sm:w-52 font-sans">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter briefings..." 
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {historyBriefs.length > 0 ? (
                historyBriefs.map((proj, i) => (
                  <div key={i} className="bg-black/35 border border-white/5 p-4 rounded-xl hover:bg-black/55 transition-colors">
                    <div className="flex justify-between items-start mb-4 font-mono text-[10px]">
                        <div>
                            <h4 className="font-bold text-white text-xs leading-none mb-1 font-sans">{proj.client_name}</h4>
                            <span className="text-[10px] text-slate-500 font-sans leading-relaxed block mt-1.5 max-w-md">{proj.project_description}</span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-[9px] font-mono font-bold bg-neon-cyan/15 border border-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full uppercase">{proj.status || 'PENDING'}</span>
                            <span className="text-[9px] text-emerald-400 font-mono block mt-1.5">✓ STABLE STREAM</span>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-3 border-t border-white/5 text-[9px] font-mono text-slate-500 uppercase">
                      <span>Target Budget: <span className="text-white">${proj.budget?.toLocaleString() || '12,000'}</span></span>
                      <span>Target Weeks: <span className="text-white">{proj.timeline_weeks || '4'} Weeks</span></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs font-mono uppercase tracking-widest">
                  NO ACTIVE SPECIFICATION BRIEFS FOUND.
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      {/* Footer Info */}
      <div className="text-center font-mono text-[9px] text-slate-600 uppercase tracking-widest">
        Autonomous Decisive Node Router v3.0
      </div>
    </div>
  );
};

export default ClientPortal;

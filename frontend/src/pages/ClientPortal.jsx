import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { AppContext } from '../context/AppContext';
import { Send, CheckCircle, FileText, ArrowRight, User, Briefcase, DollarSign, Clock, History, Layout, Search, Sparkles, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const ClientPortal = () => {
  const { submitBrief, generateProposal, approveProposal, fetchBriefs } = useContext(DataContext);
  const { user } = useContext(AppContext);
  
  const [view, setView] = useState('new'); // 'new' or 'history'
  const [step, setStep] = useState(1); // Added missing step state
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
    <div className="max-w-[800px] mx-auto space-y-8 select-none py-6">
      {/* Header Info */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2 tracking-tight">
          <Briefcase className="text-neon-cyan" size={24} />
          Enterprise Project Portal
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Submit specifications to initialize autonomous AI scoping, cost estimation, and developer mapping.
        </p>

        {/* View Selection Toggle */}
        <div className="flex justify-center gap-2 pt-2">
          <button 
            onClick={() => { setView('new'); setStep(1); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              view === 'new'
                ? 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.02] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Send size={14} /> New Engagement
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              view === 'history'
                ? 'bg-neon-cyan/10 border border-neon-cyan text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.02] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <History size={14} /> Active Engagements
          </button>
        </div>
      </div>

      {/* Step Progress Indicators */}
      {view === 'new' && (
        <div className="flex justify-between items-center relative max-w-md mx-auto py-2">
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-white/5 z-0 -translate-y-1/2"></div>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono font-bold text-xs z-10 transition-all duration-500 ${
              step >= s 
                ? 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.25)]' 
                : 'bg-black border-white/5 text-slate-600'
            }`}>
              {step > s ? <CheckCircle size={14} /> : s}
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
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono mb-6">Initialize Brief Scan</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Company / Client Identity</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User size={14} />
                </span>
                <input 
                  type="text" 
                  name="client_name" 
                  required
                  placeholder="Enter company or operator name"
                  onChange={handleInputChange}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Functional Description</label>
              <textarea 
                name="project_description" 
                required
                placeholder="Describe your design specifications (e.g., 'A cross-platform mobile application with push notification support and an SQLite database')"
                onChange={handleInputChange}
                className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-none h-32"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Financial Budget ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <DollarSign size={14} />
                  </span>
                  <input 
                    type="number" 
                    name="budget" 
                    placeholder="10000"
                    onChange={handleInputChange}
                    className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Expected Timeline Target (Weeks)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Clock size={14} />
                  </span>
                  <input 
                    type="number" 
                    name="timeline_weeks" 
                    placeholder="6"
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
                <Loader2 size={16} className="animate-spin" />
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
            <div className="w-16 h-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center mx-auto animate-pulse-glow">
              <FileText className="text-neon-cyan" size={28} />
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Compiling Project Parameters...</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                The neural scoping core is decomposing your requirements into task logs and evaluating resource availability structures.
              </p>
            </div>
            <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="h-full bg-neon-cyan animate-pulse" style={{ width: '80%' }}></div>
            </div>
          </div>
        )}

        {/* View 3: Proposal Review */}
        {step === 3 && proposal && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide">Autonomous Scoping Proposal</h2>
              <span className="text-[9px] font-mono font-bold bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                COMPILATION READY
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 bg-black/45 border border-white/5 p-4 rounded-xl">
              <div>
                <span className="text-[9px] text-slate-500 font-mono block mb-1">PROPOSED BUDGET PLAN</span>
                <span className="text-xl font-extrabold text-white font-mono">${proposal.cost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono block mb-1">CALCULATED TIMELINE</span>
                <span className="text-xl font-extrabold text-white font-mono">{proposal.days} Days</span>
              </div>
            </div>

            {/* Task Decomposition List */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase size={14} className="text-neon-cyan" />
                Task Breakdown
              </h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 divide-y divide-white/5">
                {proposal.tasks.map((task, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5">
                    <div>
                      <div className="font-semibold text-xs text-white leading-none">{task.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">COMPLEXITY: {task.complexity}/10</div>
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
                className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
              >
                Refine Specs
              </button>
              <button 
                onClick={handleApprove}
                className="flex-[2] bg-neon-cyan hover:bg-neon-cyan/85 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 font-mono uppercase"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={14} />}
                Confirm Scope & Launch Node
              </button>
            </div>
          </div>
        )}

        {/* View 4: Completed Confirmation */}
        {step === 4 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-900/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle className="text-emerald-400" size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider">Handshake Complete!</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Project parameters have been validated. Backlog metrics have been routed to the active sprint scheduler.
              </p>
            </div>
            <button 
              onClick={() => setView('history')} 
              className="bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer shadow-xl transition-all duration-200 uppercase tracking-wider font-mono inline-flex items-center gap-1.5"
            >
              Access Engagements Tracker <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* View 5: History List */}
        {view === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-white/5">
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide">Active Operational Engagements</h2>
              <div className="relative w-full sm:w-52">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter nodes..." 
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-cyan/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              {[
                { name: "Global Supply Chain AI Overlay", status: "Active Execution", progress: 65, manager: "Alice Chen" },
                { name: "Enterprise Authentication Migration", status: "Scoping Calibrations", progress: 15, manager: "System AI Core" }
              ].map((proj, i) => (
                <div key={i} className="bg-black/35 border border-white/5 p-4 rounded-xl hover:bg-black/55 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="font-bold text-white text-xs leading-none mb-1">{proj.name}</h4>
                          <span className="text-[10px] text-slate-500">Node Operator: {proj.manager}</span>
                      </div>
                      <div className="text-right shrink-0">
                          <span className="text-[9px] font-mono font-bold bg-neon-cyan/15 border border-neon-cyan/20 text-neon-cyan px-2 py-0.5 rounded-full">{proj.status.toUpperCase()}</span>
                          <span className="text-[9px] text-emerald-400 font-mono block mt-1">✓ CONTINUITY STABLE</span>
                      </div>
                  </div>
                  <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>EXECUTION PATH PROGRESS</span>
                          <span>{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                          <div className="h-full bg-neon-cyan rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                  </div>
                </div>
              ))}
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

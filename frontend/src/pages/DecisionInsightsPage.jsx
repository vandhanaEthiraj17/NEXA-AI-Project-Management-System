import React, { useContext, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { Info, CheckCircle, ShieldAlert, X, Mail, MessageCircle, Download, Share2, Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const TrendyTooltip = ({ active, payload, label, best_decision }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel-heavy p-3 rounded-lg border border-white/10 text-xs">
        <p className="font-mono font-bold text-white mb-1 uppercase tracking-wider">{label}</p>
        <p className={`font-mono font-semibold ${payload[0].payload.name === best_decision.name ? 'text-emerald-400' : 'text-neon-cyan'}`}>
          Risk Exposure: {payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const DecisionInsightsPage = () => {
  const { domain } = useContext(AppContext);
  const { projectData: data } = useContext(DataContext);
  const [showExportModal, setShowExportModal] = useState(false);

  if (!data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
          <AlertCircle size={44} className="text-neon-purple mx-auto mb-4 animate-bounce" />
          <h2 className="font-mono text-lg font-bold text-white uppercase tracking-wider mb-2">No Strategic Analytics</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Execute a project scoping simulation first to compile active strategic pathways and decision insights.
          </p>
        </motion.div>
      </div>
    );
  }

  const { risk_score } = data.metrics;
  const { best_decision, explanation } = data;
  const scenarios = data.scenarios;

  const handleExport = (type) => {
    alert(`Generating ${type} export...`);
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <header className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Lightbulb className="text-neon-cyan" size={24} />
          {domain} Scenario Analysis
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deep analysis of operational parameters and comparative simulated outcomes.</p>
      </header>

      {/* Why this decision Explanation */}
      <GlassCard className="border-l-4 border-l-neon-cyan p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={80} className="text-neon-cyan" />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded bg-neon-cyan-dim text-neon-cyan">
            <Info size={18} />
          </div>
          <h2 className="font-bold text-xs text-white uppercase tracking-wider">AI Executive Inference Summary</h2>
        </div>
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
          {explanation}
        </p>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Efficacy Chart */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Scenario Exposure Calibration</h3>
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="optGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="defGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                  <Tooltip content={<TrendyTooltip best_decision={best_decision} />} />
                  <Bar dataKey="risk" radius={[8, 8, 0, 0]} barSize={40}>
                    {scenarios.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === best_decision.name ? 'url(#optGradient)' : 'url(#defGradient)'} 
                        stroke={entry.name === best_decision.name ? '#10b981' : '#06b6d4'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 font-mono text-center mt-4">
              COMPARATIVE EXPOSURE RATIOS SCANNED ACROSS PROPOSALS
            </p>
          </div>
        </GlassCard>

        {/* Takeaways Card */}
        <GlassCard className="p-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Key Directives</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200">
                <CheckCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-0.5">Optimized Path Determined</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    The strategy "{best_decision.name}" delivers the highest resource efficiency.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-200">
                <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-0.5">Exposure Warning</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Baseline risk parameters evaluate to {risk_score}%, necessitating proactive mitigation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowExportModal(true)}
            className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 font-mono uppercase tracking-wider mt-6"
          >
            Export Strategy Ledger
          </button>
        </GlassCard>
      </div>

      {/* Share / Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[360px] p-6 border border-white/10 shadow-2xl relative"
            >
              <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Share2 size={18} className="text-neon-cyan" />
                <h3 className="font-bold text-white text-xs tracking-wide uppercase font-mono">Dispatch & Export</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-5 font-sans">
                Select export protocol for the {domain} Decision Strategy ledger.
              </p>
              
              <div className="space-y-1.5 font-mono">
                <button onClick={() => handleExport('Email')} className="w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-colors text-xs font-semibold">
                  <Mail size={16} className="text-neon-cyan shrink-0" /> EMAIL PROTOCOL
                </button>
                <button onClick={() => handleExport('WhatsApp')} className="w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-colors text-xs font-semibold">
                  <MessageCircle size={16} className="text-emerald-400 shrink-0" /> WHATSAPP DIRECT
                </button>
                <button onClick={() => handleExport('LinkedIn')} className="w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-colors text-xs font-semibold">
                  <Share2 size={16} className="text-blue-400 shrink-0" /> LINKEDIN POST
                </button>
                <button onClick={() => handleExport('PDF')} className="w-full flex items-center gap-3 p-2.5 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-colors text-xs font-semibold">
                  <Download size={16} className="text-white shrink-0" /> PDF REPORT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DecisionInsightsPage;

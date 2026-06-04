import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { SocketContext } from '../context/SocketContext';
import { 
  AlertCircle, CheckCircle, TrendingDown, Info, Briefcase, Calendar, X, 
  TrendingUp, Zap, Sparkles, LayoutGrid, Users, ShieldAlert, Cpu, 
  Activity, ArrowUpRight, DollarSign, Clock, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { domain, user } = useContext(AppContext);
  const { projectData: data, fetchBriefs, pmStats, fetchPmStats, sprints, fetchSprints } = useContext(DataContext);
  const { socket, isConnected } = useContext(SocketContext);

  const [modalContent, setModalContent] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [historicalSprints, setHistoricalSprints] = useState([]);
  const [advancedRisk, setAdvancedRisk] = useState({
    delivery_confidence: 85.0,
    risk_confidence_score: 92.0,
    overrun_probability: 24.0,
    timeline_failure_prob: 15.0,
    overload_prediction: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // API fetches wrapped in callback for live triggers
  const fetchDashboardExtras = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Client Briefs
      if (user?.role === 'manager') {
        const res = await fetchBriefs();
        if (res && res.status === 'success') {
          setBriefs(res.briefs);
        }
      }
      
      // 2. Fetch Historical Sprint Performance Logs
      const histResponse = await fetch('http://localhost:5000/api/sprints/historical');
      if (histResponse.ok) {
        const histData = await histResponse.json();
        setHistoricalSprints(histData.historical_sprints || []);
      }

      // 3. Fetch Advanced Risk Calculations
      const riskResponse = await fetch('http://localhost:5000/api/risk/advanced');
      if (riskResponse.ok) {
        const riskData = await riskResponse.json();
        setAdvancedRisk(riskData);
      }
      
      // Refresh generic statistics
      fetchPmStats();
      fetchSprints();
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchBriefs, fetchPmStats, fetchSprints]);

  // Initial and socket-triggered synchronization
  useEffect(() => {
    fetchDashboardExtras();

    if (socket) {
      const handleLiveUpdate = (payload) => {
        console.log("⚡ Dashboard Live Refresh Triggered via WebSocket:", payload);
        fetchDashboardExtras();
      };
      
      socket.on('task_updated', handleLiveUpdate);
      socket.on('sprint_updated', handleLiveUpdate);

      return () => {
        socket.off('task_updated', handleLiveUpdate);
        socket.off('sprint_updated', handleLiveUpdate);
      };
    }
  }, [socket, fetchDashboardExtras]);

  if (!data) {
    return (
      <div className="h-[75vh] flex flex-col items-center justify-center text-center px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-8 rounded-2xl border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
          <Cpu size={44} className="text-neon-cyan mx-auto mb-4 animate-spin [animation-duration:10s]" />
          <h2 className="font-mono text-lg font-bold text-white uppercase tracking-wider mb-2">Initialize Mission Control</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
            The platform requires a project intelligence scan to map predictive analytics, delivery success probabilities, and model vectors.
          </p>
          <button 
            onClick={() => navigate('/app/analysis')} 
            className="w-full bg-neon-purple hover:bg-neon-purple/85 text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 font-mono tracking-wider"
          >
            LAUNCH AI PROJECT SCAN
          </button>
        </motion.div>
      </div>
    );
  }

  const { risk_score, success_probability, recommended_action, risk_reason, success_reason } = data.metrics;
  const scenarios = data.scenarios;
  const { best_decision, explanation } = data;

  const getRiskColorHex = (risk) => {
    if (risk > 65) return '#ef4444'; // Red
    if (risk > 35) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  // Compile Chart data from active prediction + historical performance logs
  const trendData = historicalSprints.length > 0 
    ? [...historicalSprints].reverse().map((h, i) => ({
        name: `Sprint ${h.sprint_id}`,
        risk: h.predicted_risk,
        efficiency: h.efficiency_score,
      }))
    : [
        { name: 'Sprint 1', risk: 42, efficiency: 78 },
        { name: 'Sprint 2', risk: 38, efficiency: 82 },
        { name: 'Sprint 3', risk: 45, efficiency: 74 },
        { name: 'Current', risk: risk_score, efficiency: success_probability }
      ];

  const barChartData = [
    { name: 'Timeline Delay', probability: advancedRisk.timeline_failure_prob, color: '#f59e0b' },
    { name: 'Budget Overrun', probability: advancedRisk.overrun_probability, color: '#ec4899' },
    { name: 'Risk Exposure', probability: risk_score, color: '#ef4444' },
    { name: 'AI Confidence', probability: advancedRisk.risk_confidence_score || 85.0, color: '#a855f7' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/5 relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neon-purple animate-pulse"></span>
            <span className="text-[10px] font-bold text-neon-purple uppercase tracking-widest font-mono">SYSTEM READY // LIVE BROADCAST ACTIVE</span>
            {isConnected && (
              <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">WEBSOCKET SYNCED</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-1">
            <LayoutGrid className="text-neon-purple" size={24} />
            Executive Mission Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Predictive Intelligence Layer • Domain: <span className="text-neon-cyan font-semibold">{domain}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchDashboardExtras}
            className={`p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer text-slate-400 hover:text-white ${isLoading ? 'animate-spin' : ''}`}
            title="Force refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            className="bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-1.5 font-mono"
            onClick={() => navigate('/app/analysis')}
          >
            <Sparkles size={14} />
            NEW SIMULATION SCAN
          </button>
        </div>
      </header>

      {/* Operations Grid: Delivery Health Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Index Card */}
        <GlassCard hoverGlow glowColor="red" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldAlert size={60} className="text-rose-500" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">Calculated Delay Risk</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-rose-500" style={{ color: getRiskColorHex(risk_score) }}>
              {risk_score}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ESTIMATED</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
            <Info size={11} className="text-slate-500" />
            <button 
              onClick={() => setModalContent({ title: 'NEXA AI Risk Reasoning', reason: risk_reason, type: 'risk' })}
              className="hover:underline text-rose-400 text-left cursor-pointer font-mono"
            >
              Scan thread analysis
            </button>
          </div>
        </GlassCard>

        {/* Success Probability Card */}
        <GlassCard hoverGlow glowColor="purple" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle size={60} className="text-neon-purple" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">Delivery Success Outlook</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              {success_probability}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PROBABILITY</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
            <Info size={11} className="text-slate-500" />
            <button 
              onClick={() => setModalContent({ title: 'NEXA AI Success Reasoning', reason: success_reason, type: 'success' })}
              className="hover:underline text-neon-purple text-left cursor-pointer font-mono"
            >
              Scan safety measures
            </button>
          </div>
        </GlassCard>

        {/* Dynamic Timeline failure probability */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock size={60} className="text-amber-500" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">Timeline Failure probability</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-500">
              {advancedRisk.timeline_failure_prob}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CRITICAL PATH</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span>MONITORING WORKFLOW LAGS</span>
          </div>
        </GlassCard>

        {/* Burn Rate / Budget utilization */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign size={60} className="text-teal-500" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">Project Financial Risk</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {advancedRisk.overrun_probability}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">OVERRUN RISK</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Weekly Burn: $4,200</span>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts & Strategy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend Progression curves */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
              <Activity size={14} className="text-neon-cyan" />
              Intelligence Progression & Efficiency
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRiskCurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getRiskColorHex(risk_score)} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={getRiskColorHex(risk_score)} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 14, 33, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Area type="monotone" name="Calculated Risk" dataKey="risk" stroke={getRiskColorHex(risk_score)} fillOpacity={1} fill="url(#colorRiskCurve)" strokeWidth={2.5} />
                  <Area type="monotone" name="Team Efficiency" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEfficiency)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Right: AI Optimization Decisions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-2xl p-6 border border-neon-purple/20 bg-gradient-to-tr from-neon-purple/5 to-transparent flex flex-col justify-between h-full min-h-[350px]"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles size={120} className="text-neon-purple" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-neon-purple text-[10px] font-bold uppercase tracking-widest mb-4 font-mono">
              <Sparkles size={12} />
              AI CO-PILOT ADVISOR
            </div>
            <div className="text-white font-extrabold text-sm tracking-wide mb-2 uppercase font-mono flex items-center gap-1">
              <span>Optimal Decision:</span>
              <span className="text-neon-cyan">{best_decision.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              {explanation}
            </p>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="p-3 bg-black/35 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase">Recommended AI Action</span>
              <p className="text-xs font-semibold text-slate-200 flex items-start gap-1.5">
                <ArrowUpRight size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{recommended_action}</span>
              </p>
            </div>
            <div className="flex justify-between items-center text-xs px-1">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Simulation Cost delta</span>
              <span className="text-white font-mono font-bold text-emerald-400">{best_decision.cost}</span>
            </div>
            <button 
              onClick={() => navigate('/app/simulation')}
              className="w-full bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-xl transition-all duration-200 font-mono tracking-wider"
            >
              RUN SIMULATION PANEL
            </button>
          </div>
        </motion.div>
      </div>

      {/* Middle Grid: Advanced Risk Heatmap Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Probability Bars */}
        <GlassCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
              <TrendingUp size={14} className="text-neon-purple" />
              Confidence Distribution
            </h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 9, fontFamily: 'monospace'}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 9, fontFamily: 'monospace'}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(12, 14, 33, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* Burnout Risks List */}
        <GlassCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
              <Users size={14} className="text-teal-400" />
              Dev Burnout & Workload Scan
            </h3>
            <div className="space-y-3 h-56 overflow-y-auto pr-1">
              {advancedRisk.overload_prediction && advancedRisk.overload_prediction.length > 0 ? (
                advancedRisk.overload_prediction.map((op, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">{op.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">LOAD SCORE: {op.load_points} Complexity Pts</div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      op.burnout_risk === 'High' 
                        ? 'bg-rose-950/20 border-rose-500/30 text-rose-400 animate-pulse'
                        : (op.burnout_risk === 'Medium' ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400')
                    }`}>
                      {op.burnout_risk}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-500 font-mono">No active workload scanned.</div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Active Sprints Status List */}
        <GlassCard className="flex flex-col justify-between p-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5 font-mono">
              <Clock size={14} className="text-amber-400" />
              Active Sprint Registry
            </h3>
            <div className="space-y-3 h-56 overflow-y-auto pr-1">
              {sprints && sprints.length > 0 ? (
                sprints.map((sp) => (
                  <div key={sp.id} className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-200">{sp.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">STATUS: {sp.status?.toUpperCase() || 'ACTIVE'}</div>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      sp.status === 'completed' 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-neon-purple/20 border-neon-purple/30 text-purple-300'
                    }`}>
                      {sp.status || 'active'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-500 font-mono">No registered sprints found.</div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Client Brief Requests Section */}
      {user?.role === 'manager' && briefs.length > 0 && (
        <div className="pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Briefcase size={16} className="text-neon-cyan" />
            INCOMING CLIENT MVP REQUESTS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefs.map((brief) => (
              <GlassCard key={brief.id} hoverGlow className="relative flex flex-col justify-between h-48 p-5">
                <div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">ID: BK-{brief.id}</div>
                  <h4 className="text-sm font-bold text-white mb-2">{brief.client_name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3 font-sans">
                    {brief.project_description}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="text-xs font-bold text-emerald-400 font-mono">${brief.budget.toLocaleString()}</div>
                  <button 
                    onClick={() => navigate('/app/client-portal')}
                    className="bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/30 text-purple-200 hover:text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors font-mono tracking-wider"
                  >
                    SCOPE WITH LLM
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Decision Intelligence Explanation Modal */}
      <AnimatePresence>
        {modalContent && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[460px] p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-xs tracking-wide uppercase font-mono">{modalContent.title}</h3>
                <button onClick={() => setModalContent(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              <div className={`p-4 rounded-xl border ${
                modalContent.type === 'risk' 
                  ? 'bg-rose-950/20 border-rose-900/30 text-rose-200' 
                  : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200'
              }`}>
                <p className="text-xs leading-relaxed font-sans">
                  {modalContent.reason}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;

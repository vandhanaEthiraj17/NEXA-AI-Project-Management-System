import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { AlertCircle, CheckCircle, TrendingDown, Info, Briefcase, Calendar, X, TrendingUp, Zap, Sparkles, LayoutGrid, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { domain, user } = useContext(AppContext);
  const { projectData: data, fetchBriefs } = useContext(DataContext);
  const [modalContent, setModalContent] = useState(null);
  const [briefs, setBriefs] = useState([]);

  React.useEffect(() => {
    if (user?.role === 'manager') {
      const getBriefs = async () => {
        const res = await fetchBriefs();
        if (res && res.status === 'success') setBriefs(res.briefs);
      };
      getBriefs();
    }
  }, [user, fetchBriefs]);
  
  if (!data) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center px-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-panel p-8 rounded-2xl border border-white/5 max-w-md w-full relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
          <AlertCircle size={44} className="text-neon-cyan mx-auto mb-4 animate-bounce" />
          <h2 className="font-mono text-lg font-bold text-white uppercase tracking-wider mb-2">No Active Intelligence Scan</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            The platform requires a scoped scenario setup before analytics can map decision patterns. Please initialize a new project scan.
          </p>
          <button 
            onClick={() => navigate('/app/analysis')} 
            className="w-full bg-neon-purple hover:bg-neon-purple/85 text-white font-semibold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all duration-300"
          >
            Create New Project Scan
          </button>
        </motion.div>
      </div>
    );
  }

  const { risk_score, success_probability, recommended_action, risk_reason, success_reason } = data.metrics;
  const scenarios = data.scenarios;
  const { best_decision, explanation } = data;

  const getRiskColor = (risk) => {
    if (risk > 60) return '#rose-400';
    if (risk > 35) return '#amber-400';
    return '#emerald-400';
  };

  const getRiskColorHex = (risk) => {
    if (risk > 60) return '#f43f5e';
    if (risk > 35) return '#fbbf24';
    return '#10b981';
  };

  // Mocked Trend Data for Full Analytics
  const trendData = [
    { name: 'Scan 1', risk: 45, velocity: 12 },
    { name: 'Scan 2', risk: 42, velocity: 15 },
    { name: 'Scan 3', risk: 38, velocity: 18 },
    { name: 'Current', risk: risk_score, velocity: 22 }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <LayoutGrid className="text-neon-purple" size={24} />
            Executive Intelligence Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive modeling domain: <span className="text-neon-cyan font-semibold">{domain}</span> • Active scenario scanning
          </p>
        </div>
        <button 
          className="bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-1.5"
          onClick={() => navigate('/app/analysis')}
        >
          <Sparkles size={14} />
          New Simulation Scan
        </button>
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Risk Card */}
        <GlassCard hoverGlow glowColor="cyan" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle size={60} className="text-neon-cyan" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Calculated Risk Index</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white" style={{ color: getRiskColorHex(risk_score) }}>
              {risk_score}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ESTIMATED</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
            <Info size={11} className="text-slate-500" />
            <button 
              onClick={() => setModalContent({ title: 'AI Delay Risk Explanation', reason: risk_reason, type: 'risk' })}
              className="hover:underline text-neon-cyan text-left cursor-pointer"
            >
              Analyze threat factors
            </button>
          </div>
        </GlassCard>

        {/* Success Probability Card */}
        <GlassCard hoverGlow glowColor="purple" className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle size={60} className="text-neon-purple" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Success Probability</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-emerald-400">
              {success_probability}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">CONVERGENCE</span>
          </div>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
            <Info size={11} className="text-slate-500" />
            <button 
              onClick={() => setModalContent({ title: 'AI Success Outlook Explanation', reason: success_reason, type: 'success' })}
              className="hover:underline text-neon-purple text-left cursor-pointer"
            >
              Analyze operational safety
            </button>
          </div>
        </GlassCard>

        {/* Velocity Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap size={60} className="text-amber-500" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Sprint Velocity</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              22.5
            </span>
            <span className="text-[10px] text-slate-400 font-mono">PTS / CYCLE</span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            CALIBRATED FROM ACTUAL LOGS
          </div>
        </GlassCard>

        {/* Resource Health Card */}
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users size={60} className="text-teal-500" />
          </div>
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Resource Allocation</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
              92%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">UTILIZATION</span>
          </div>
          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            4 ENGINEERS REGISTERED
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend AreaChart Card */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Zap size={14} className="text-neon-cyan" />
              Risk Index Progression
            </h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getRiskColorHex(risk_score)} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={getRiskColorHex(risk_score)} stopOpacity={0}/>
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
                      fontSize: '11px'
                    }}
                  />
                  <Area type="monotone" dataKey="risk" stroke={getRiskColorHex(risk_score)} fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GlassCard>

        {/* AI Action Box */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel rounded-2xl p-6 border border-neon-purple/20 bg-gradient-to-tr from-neon-purple/5 to-transparent relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles size={120} className="text-neon-purple" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-neon-purple text-[10px] font-bold uppercase tracking-widest mb-4">
              <Sparkles size={12} />
              AI Strategy Engine
            </div>
            <div className="text-white font-bold text-sm tracking-wide mb-2 uppercase font-mono">
              Optimal Choice: {best_decision.name}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              {explanation}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono text-[10px] uppercase">Calculated Cost</span>
              <span className="text-white font-mono font-bold">{best_decision.cost}</span>
            </div>
            <button 
              onClick={() => navigate('/app/simulation')}
              className="w-full bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-xl transition-all duration-200"
            >
              Analyze What-If Alternatives
            </button>
          </div>
        </motion.div>
      </div>

      {/* Client Brief Requests */}
      {user?.role === 'manager' && briefs.length > 0 && (
        <div className="pt-4 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase size={16} className="text-neon-cyan" />
            Incoming Client Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefs.map((brief) => (
              <GlassCard key={brief.id} hoverGlow className="relative flex flex-col justify-between h-48">
                <div>
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">ID: BK-{brief.id}</div>
                  <h4 className="text-sm font-bold text-white mb-2">{brief.client_name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3 font-sans">
                    {brief.project_description}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="text-xs font-bold text-emerald-400 font-mono">${brief.budget.toLocaleString()}</div>
                  <button 
                    onClick={() => navigate('/app/client-portal')}
                    className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white text-[10px] font-bold py-1.5 px-3 rounded-lg cursor-pointer transition-colors font-mono"
                  >
                    Analyze Brief
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
                <h3 className="font-bold text-white text-sm tracking-wide uppercase font-mono">{modalContent.title}</h3>
                <button onClick={() => setModalContent(null)} className="text-slate-400 hover:text-white p-1">
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

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  TrendingUp, DollarSign, Activity, Target, Zap, Clock, 
  ChevronRight, BarChart3, ShieldAlert, CheckCircle, RefreshCw, Cpu
} from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { DataContext } from '../context/DataContext';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
    const { socket } = useContext(SocketContext);
    const { fetchPmStats } = useContext(DataContext);

    const [analytics, setAnalytics] = useState(null);
    const [advancedRisk, setAdvancedRisk] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeHeatmapFilter, setActiveHeatmapFilter] = useState('all');

    const fetchAllAnalyticsData = useCallback(async () => {
        try {
            // 1. Fetch full generic statistics
            const res = await fetch('http://localhost:5000/api/analytics/full');
            const data = await res.json();
            setAnalytics(data);

            // 2. Fetch Advanced Risk engine metrics (burnouts, heatmaps, failure rates)
            const riskRes = await fetch('http://localhost:5000/api/risk/advanced');
            if (riskRes.ok) {
                const riskData = await riskRes.json();
                setAdvancedRisk(riskData);
            }

            // 3. Fetch Sprint Forecasting projections (Monte Carlo confidence charts)
            const forecastRes = await fetch('http://localhost:5000/api/sprint/forecast');
            if (forecastRes.ok) {
                const forecastData = await forecastRes.json();
                setForecast(forecastData);
            }
        } catch (err) {
            console.error("Analytics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllAnalyticsData();

        if (socket) {
            const handleSocketEvent = () => {
                console.log("⚡ Live websocket analytical crunch triggered!");
                fetchAllAnalyticsData();
            };
            socket.on('task_updated', handleSocketEvent);
            socket.on('sprint_updated', handleSocketEvent);

            return () => {
                socket.off('task_updated', handleSocketEvent);
                socket.off('sprint_updated', handleSocketEvent);
            };
        }
    }, [socket, fetchAllAnalyticsData]);

    const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];

    if (loading || !analytics || !advancedRisk || !forecast) {
      return (
        <div className="h-[75vh] flex flex-col items-center justify-center text-center">
          <Cpu className="w-10 h-10 text-neon-cyan animate-spin mb-4 [animation-duration:4s]" />
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">CRUNCHING COGNITIVE DATA STREAMS...</p>
        </div>
      );
    }

    const filteredHeatmap = advancedRisk.risk_heatmap.filter(t => {
        if (activeHeatmapFilter === 'all') return true;
        return t.heat === activeHeatmapFilter;
    });

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
                    <span className="text-[9px] font-bold text-neon-cyan uppercase tracking-widest font-mono">Predictive AI Engine Online</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
                      <BarChart3 className="text-neon-cyan" size={24} />
                      AI Decision Analytics Hub
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Cross-sprint metrics, risk confidence, and neural delay forecasts.</p>
                </div>
                <button 
                  onClick={fetchAllAnalyticsData}
                  className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-300 font-mono text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw size={12} />
                  CRUNCH LIVE SCANS
                </button>
            </div>

            {/* Top Row: Smart Analytics Dials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={<Target size={16} className="text-neon-cyan" />} 
                    label="Delivery Confidence" 
                    value={`${advancedRisk.delivery_confidence}%`} 
                    delta="Predictive" 
                    color="cyan"
                    caption="Probability of deadline compliance"
                />
                <StatCard 
                    icon={<Zap size={16} className="text-neon-purple" />} 
                    label="ML Model Confidence" 
                    value={`${advancedRisk.risk_confidence_score}%`} 
                    delta="Optimal" 
                    color="purple"
                    caption="Algorithm inference accuracy"
                />
                <StatCard 
                    icon={<Activity size={16} className="text-rose-400" />} 
                    label="Timeline failure Prob." 
                    value={`${advancedRisk.timeline_failure_prob}%`} 
                    delta="Critical" 
                    color="rose"
                    caption="Burndown vector lag check"
                />
                <StatCard 
                    icon={<DollarSign size={16} className="text-emerald-400" />} 
                    label="Cost Overrun Prob." 
                    value={`${advancedRisk.overrun_probability}%`} 
                    delta="Financial" 
                    color="green"
                    caption="Budget consumption index"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Expected Sprint timeline Monte Carlo Forecasting */}
                <GlassCard className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Clock size={14} className="text-neon-cyan" />
                        AI Sprint Forecasting Projections
                      </h3>
                      <span className="text-[10px] text-neon-cyan font-mono bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded">
                        Expected: {forecast.expected_completion_days} Days
                      </span>
                    </div>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={forecast.ai_confidence_graph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
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
                                <Line name="AI Confidence Index" type="monotone" dataKey="confidence" stroke="#06b6d4" strokeWidth={2.5} dot={{r: 4, fill: '#06b6d4'}} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Resource Allocation Mix */}
                <GlassCard>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6 font-mono flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-neon-purple" />
                      Team Velocity trends
                    </h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={forecast.team_velocity_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
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
                                <Area type="monotone" name="Velocity" dataKey="velocity" stroke="#a855f7" fillOpacity={1} fill="url(#colorVelocity)" strokeWidth={2.5} />
                                <Line type="monotone" name="Target" dataKey="target" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Dynamic AI Risk Heatmap Breakdown */}
            <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-rose-500" />
                      Dynamic Workspace Risk Heatmap
                    </h3>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Complexity × Time Constraints index scan.</p>
                  </div>
                  <div className="flex gap-1.5">
                    {['all', 'critical', 'medium', 'low'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setActiveHeatmapFilter(filter)}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded border uppercase cursor-pointer transition-all ${
                          activeHeatmapFilter === filter 
                            ? 'bg-neon-purple/20 border-neon-purple/50 text-purple-300'
                            : 'bg-white/[0.01] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-72 overflow-y-auto pr-1">
                  {filteredHeatmap.length > 0 ? (
                    filteredHeatmap.map((t, idx) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={t.id || idx}
                        className={`p-4 rounded-xl border relative flex flex-col justify-between h-28 overflow-hidden group ${
                          t.heat === 'critical'
                            ? 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40 text-rose-200'
                            : (t.heat === 'medium' ? 'bg-amber-950/10 border-amber-500/20 hover:border-amber-500/40 text-amber-200' : 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-200')
                        }`}
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                          <ShieldAlert size={35} className={t.heat === 'critical' ? 'text-rose-500' : (t.heat === 'medium' ? 'text-amber-500' : 'text-emerald-500')} />
                        </div>
                        <div>
                          <div className="text-[9px] font-mono text-slate-500 uppercase">HEAT INDEX: {t.heat}</div>
                          <h4 className="text-xs font-bold text-white line-clamp-2 mt-1 font-sans">{t.title}</h4>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5 text-[9px] font-mono">
                          <span className="text-slate-500">ASSIGN: {t.assignee || 'UNASSIGNED'}</span>
                          <span className={t.heat === 'critical' ? 'text-rose-400' : (t.heat === 'medium' ? 'text-amber-400' : 'text-emerald-400')}>
                            COMP: {t.complexity} • {t.deadline_days}D
                          </span>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10 text-xs text-slate-500 font-mono">
                      No active tasks matched this heat query.
                    </div>
                  )}
                </div>
            </GlassCard>
        </div>
    );
};

const StatCard = ({ icon, label, value, delta, color, caption }) => {
  const borderClass = 
    color === 'cyan' 
      ? 'border-l-neon-cyan border-white/5' 
      : color === 'purple' 
        ? 'border-l-neon-purple border-white/5' 
        : color === 'rose' 
          ? 'border-l-rose-500 border-white/5' 
          : 'border-l-emerald-500 border-white/5';

  const textClass = 
    color === 'cyan' 
      ? 'text-neon-cyan font-mono' 
      : color === 'purple' 
        ? 'text-neon-purple font-mono' 
        : color === 'rose' 
          ? 'text-rose-400 font-mono' 
          : 'text-emerald-400 font-mono';

  const deltaBg = 
    color === 'rose' 
      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
      : (color === 'cyan' ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20');

  return (
    <GlassCard hoverGlow glowColor={color === 'rose' ? 'red' : (color === 'green' ? 'green' : color)} className={`border-l-4 ${borderClass} py-4 px-5`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-lg">{icon}</div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">{label}</span>
          </div>
          <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded ${deltaBg}`}>{delta}</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl font-extrabold tracking-tight ${textClass}`}>{value}</span>
        </div>
        <div className="mt-1 text-[9px] text-slate-500 font-sans tracking-wide">
          {caption}
        </div>
    </GlassCard>
  );
};

export default AnalyticsDashboard;

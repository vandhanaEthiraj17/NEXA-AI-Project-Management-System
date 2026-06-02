import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Line
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Target, Zap, Clock, ChevronRight, BarChart3 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/analytics/full');
                const data = await res.json();
                setAnalytics(data);
            } catch (err) {
                console.error("Analytics fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#f43f5e', '#10b981'];

    if (loading) {
      return (
        <div className="h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-neon-purple border-t-transparent animate-spin mb-4"></div>
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Crunching Enterprise Data Streams...</p>
        </div>
      );
    }

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <BarChart3 className="text-neon-cyan" size={24} />
                        Enterprise Intelligence
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Cross-project operational metrics and predictive resource analytics.</p>
                </div>
                <div className="text-neon-cyan font-bold text-xs flex items-center gap-1 cursor-pointer hover:text-neon-cyan/80 transition-colors">
                    View Full Executive Report <ChevronRight size={16} />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={<TrendingUp size={16} className="text-neon-cyan" />} 
                    label="Avg. Efficiency" 
                    value={`${analytics.trends[analytics.trends.length-1].efficiency}%`} 
                    delta="+4.2%" 
                    color="cyan"
                />
                <StatCard 
                    icon={<DollarSign size={16} className="text-neon-purple" />} 
                    label="Monthly Revenue" 
                    value={`$${analytics.trends[analytics.trends.length-1].revenue.toLocaleString()}`} 
                    delta="+12%" 
                    color="purple"
                />
                <StatCard 
                    icon={<Activity size={16} className="text-neon-magenta" />} 
                    label="Weekly Burn Rate" 
                    value={analytics.burn_rate} 
                    delta="Stable" 
                    color="magenta"
                />
                <StatCard 
                    icon={<Target size={16} className="text-emerald-400" />} 
                    label="Project Health" 
                    value="Healthy" 
                    delta="Optimum" 
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue & Efficiency Chart */}
                <GlassCard className="lg:col-span-2">
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Growth & Efficiency Projections</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.trends} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontFamily: 'monospace'}} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(12, 14, 33, 0.95)', 
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '11px'
                                  }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#a855f7" strokeWidth={2.5} dot={{r: 4, fill: '#a855f7'}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Resource Allocation Mix */}
                <GlassCard>
                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6">Resource Allocation Load</h3>
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.resource_usage} layout="vertical" margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} width={80} />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'rgba(12, 14, 33, 0.95)', 
                                    borderColor: 'rgba(255, 255, 255, 0.08)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '11px'
                                  }}
                                />
                                <Bar dataKey="utilization" radius={[0, 6, 6, 0]} barSize={16}>
                                    {analytics.resource_usage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard 
                    icon={<Zap size={18} className="text-neon-cyan" />} 
                    title="Velocity Optimization" 
                    desc="Sprint velocity is up 12% following AI-suggested task reassignments in March."
                    borderColor="border-l-neon-cyan"
                />
                <InsightCard 
                    icon={<Clock size={18} className="text-neon-purple" />} 
                    title="Estimated Arrival" 
                    desc="Projected Q3 2026 delivery for NexaAI platform remains stable at 94% confidence."
                    borderColor="border-l-neon-purple"
                />
                <InsightCard 
                    icon={<Activity size={18} className="text-neon-magenta" />} 
                    title="Risk Mitigation" 
                    desc="Aggressive bottleneck detection saved approx. 14 developer hours this week."
                    borderColor="border-l-neon-magenta"
                />
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, delta, color }) => {
  const glowBorderClass = 
    color === 'cyan' 
      ? 'border-l-neon-cyan' 
      : color === 'purple' 
        ? 'border-l-neon-purple' 
        : color === 'magenta' 
          ? 'border-l-neon-magenta' 
          : 'border-l-emerald-500';

  const textClass = 
    color === 'cyan' 
      ? 'text-neon-cyan font-mono' 
      : color === 'purple' 
        ? 'text-neon-purple font-mono' 
        : color === 'magenta' 
          ? 'text-neon-magenta font-mono' 
          : 'text-emerald-400 font-mono';

  return (
    <GlassCard hoverGlow glowColor={color} className={`border-l-4 ${glowBorderClass} py-4 px-5`}>
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white/[0.02] border border-white/5 rounded-lg">{icon}</div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-baseline justify-between">
            <span className={`text-xl font-extrabold text-white tracking-tight ${textClass}`}>{value}</span>
            <span className="text-[10px] font-bold text-emerald-400">{delta}</span>
        </div>
    </GlassCard>
  );
};

const InsightCard = ({ icon, title, desc, borderColor }) => (
    <GlassCard hoverGlow className={`border-l-4 ${borderColor} p-4`}>
        <div className="flex items-center gap-2 mb-2">
            {icon}
            <span className="font-bold text-xs text-white uppercase tracking-wider">{title}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">{desc}</p>
    </GlassCard>
);

export default AnalyticsDashboard;

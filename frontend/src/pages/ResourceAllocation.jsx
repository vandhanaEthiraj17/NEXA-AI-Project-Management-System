import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import { Users, Briefcase, Star, Clock, CheckCircle, AlertTriangle, ShieldCheck, User2, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion } from 'framer-motion';

const ResourceAllocation = () => {
    const [developers, setDevelopers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { pmStats } = useContext(DataContext);

    useEffect(() => {
        const fetchDevs = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/developers');
                const data = await res.json();
                if (data.status === 'success') {
                    setDevelopers(data.developers);
                }
            } catch (err) {
                console.error("Failed to fetch developers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDevs();
    }, []);

    const getUtilizationColor = (util) => {
        if (util > 85) return 'text-rose-400';
        if (util > 60) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const getUtilizationBarColor = (util) => {
        if (util > 85) return 'bg-rose-500';
        if (util > 60) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-white/5">
                <div>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                        <Users className="text-neon-purple" size={24} />
                        Talent Allocation Map
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Optimize and balance workload distribution through AI skill-tag matching.</p>
                </div>
                <GlassCard className="py-2.5 px-4 flex items-center gap-3">
                    <Users size={18} className="text-neon-purple" />
                    <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-none">Total Resources</div>
                        <div className="text-sm font-bold text-white font-mono mt-1">{developers.length} OPERATORS</div>
                    </div>
                </GlassCard>
            </div>

            {/* Developer Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full border-2 border-neon-purple border-t-transparent animate-spin mb-4"></div>
                        <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Querying Operator Registry...</p>
                    </div>
                ) : developers.map((dev, index) => {
                    const mockUtilization = 60 + (dev.id * 7) % 35;
                    const initials = dev.name.split(' ').map(n => n[0]).join('');
                    
                    return (
                        <motion.div
                          key={dev.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.08 }}
                        >
                            <GlassCard hoverGlow glowColor={dev.availability ? 'cyan' : 'purple'} className="flex flex-col justify-between h-72">
                                {/* Dev Info Header */}
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-mono font-bold flex items-center justify-center text-xs">
                                                {initials}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-white tracking-wide">{dev.name}</h4>
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                                                    <Star size={10} className="text-neon-cyan" /> SENIOR ASSIGNED
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                            dev.availability 
                                              ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                                              : 'bg-rose-950/20 border-rose-900/30 text-rose-400'
                                        }`}>
                                            {dev.availability ? 'AVAILABLE' : 'ALLOCATED'}
                                        </span>
                                    </div>

                                    {/* Skills Stack */}
                                    <div className="mb-4">
                                        <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase mb-2">Primary Directives</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dev.skills.split(',').map(skill => (
                                                <span key={skill} className="text-[9px] font-mono px-2 py-1 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                                                    {skill.trim().toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Workload Index */}
                                <div className="space-y-4">
                                    <div className="bg-black/35 border border-white/5 p-3 rounded-xl">
                                        <div className="flex justify-between items-center mb-1 text-[10px]">
                                            <span className="text-slate-500 font-mono">UTILIZATION MATRIX</span>
                                            <span className={`font-mono font-bold ${getUtilizationColor(mockUtilization)}`}>{mockUtilization}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${getUtilizationBarColor(mockUtilization)}`} style={{ width: `${mockUtilization}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px]">
                                            <Clock size={12} className="text-slate-500" />
                                            <span>2 Active Tasks</span>
                                        </div>
                                        <button className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-slate-200 text-[10px] font-semibold py-1.5 px-3 rounded-lg cursor-pointer transition-colors font-mono uppercase tracking-wider">
                                            Assign Task
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Auto-Optimization Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel rounded-2xl p-5 border border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/5 to-transparent flex flex-col md:flex-row gap-4 items-center justify-between relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Sparkles size={80} className="text-neon-cyan" />
                </div>
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse-glow">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1">
                            Autonomous Matching Core Active
                        </h3>
                        <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
                            The matching algorithm is actively scanning developer workloads. Click optimize to automatically distribute tasks and balance developer allocation metrics.
                        </p>
                    </div>
                </div>
                <button className="w-full md:w-auto bg-neon-cyan hover:bg-neon-cyan/80 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 whitespace-nowrap uppercase tracking-wider font-mono">
                    Auto-Optimize Core
                </button>
            </motion.div>
        </div>
    );
};

export default ResourceAllocation;

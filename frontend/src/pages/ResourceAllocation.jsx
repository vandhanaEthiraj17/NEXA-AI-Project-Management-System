import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { SocketContext } from '../context/SocketContext';
import { 
  Users, Star, Clock, CheckCircle, AlertTriangle, ShieldCheck, 
  User2, Sparkles, RefreshCw, Cpu, Award, TrendingUp, Check
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const ResourceAllocation = () => {
    const { socket } = useContext(SocketContext);
    const { pmStats, fetchPmStats } = useContext(DataContext);

    const [developers, setDevelopers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [optimizationData, setOptimizationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const fetchTalentMapData = useCallback(async () => {
        try {
            // 1. Fetch Developers list
            const devRes = await fetch('http://localhost:5000/api/developers');
            const devData = await devRes.json();
            if (devData.status === 'success') {
                setDevelopers(devData.developers);
            }

            // 2. Fetch Tasks list to compute dynamic loads
            const taskRes = await fetch('http://localhost:5000/api/tasks');
            if (taskRes.ok) {
                const taskData = await taskRes.json();
                setTasks(taskData);
            }

            // 3. Fetch smart AI reassignment recommendations
            const optRes = await fetch('http://localhost:5000/api/resources/optimization');
            if (optRes.ok) {
                const optData = await optRes.json();
                setOptimizationData(optData);
            }
            
            fetchPmStats();
        } catch (err) {
            console.error("Failed to load talent data:", err);
        } finally {
            setLoading(false);
        }
    }, [fetchPmStats]);

    useEffect(() => {
        fetchTalentMapData();

        if (socket) {
            const handleSync = () => {
                console.log("⚡ Talent Map syncing via socket...");
                fetchTalentMapData();
            };
            socket.on('task_updated', handleSync);
            return () => {
                socket.off('task_updated', handleSync);
            };
        }
    }, [socket, fetchTalentMapData]);

    const handleApplyRecommendation = async (rec) => {
        setIsOptimizing(true);
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${rec.task_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignee: rec.recommended_assignee })
            });
            if (res.ok) {
                // Refresh data
                await fetchTalentMapData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleOptimizeAll = async () => {
        if (!optimizationData || optimizationData.recommendations.length === 0) return;
        setIsOptimizing(true);
        
        try {
            // Apply all recommendations in sequence
            for (const rec of optimizationData.recommendations) {
                await fetch(`http://localhost:5000/api/tasks/${rec.task_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assignee: rec.recommended_assignee })
                });
            }
            await fetchTalentMapData();
        } catch (err) {
            console.error("Auto optimize failed:", err);
        } finally {
            setIsOptimizing(false);
        }
    };

    const getUtilizationColor = (load) => {
        if (load > 12) return 'text-rose-400';
        if (load > 8) return 'text-amber-400';
        return 'text-emerald-400';
    };

    const getUtilizationBarColor = (load) => {
        if (load > 12) return 'bg-rose-500 shadow-[0_0_8px_#ef4444]';
        if (load > 8) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="space-y-6 select-none">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-purple animate-pulse"></span>
                    <span className="text-[9px] font-bold text-neon-purple uppercase tracking-widest font-mono">Resource Balancer Online</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-1">
                      <Users className="text-neon-purple" size={24} />
                      NEXA Talent Allocation Map
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">Optimize task loading and mitigate burnout risks autonomously.</p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                      onClick={fetchTalentMapData}
                      className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white cursor-pointer hover:bg-white/[0.04]"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <GlassCard className="py-2 px-4 flex items-center gap-3">
                        <Users size={16} className="text-neon-purple" />
                        <div>
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Registry count</div>
                            <div className="text-xs font-bold text-white font-mono mt-0.5">{developers.length} ACTIVE OPERATORS</div>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* AI Optimization Alert Banner */}
            {optimizationData && optimizationData.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel rounded-2xl p-5 border border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/5 to-transparent flex flex-col md:flex-row gap-4 items-center justify-between relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Sparkles size={80} className="text-neon-cyan" />
                  </div>
                  <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0 animate-pulse">
                          <Cpu size={24} />
                      </div>
                      <div>
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                              Autonomous Workload Balancer Active
                          </h3>
                          <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed font-sans">
                              NEXA AI detected **{optimizationData.overloaded_count || 0} overloaded** resources. We have generated **{optimizationData.recommendations.length} optimization pathways** to balance your team's velocity.
                          </p>
                      </div>
                  </div>
                  <button 
                    onClick={handleOptimizeAll}
                    disabled={isOptimizing}
                    className="w-full md:w-auto bg-neon-cyan hover:bg-neon-cyan/80 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 whitespace-nowrap uppercase tracking-wider font-mono"
                  >
                      {isOptimizing ? 'Balancing workloads...' : 'AUTO-BALANCE SPRINT CAPACITY'}
                  </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Developers Deck */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Active Resource Registry</h3>
                  <div className="flex gap-1.5">
                    {['all', 'active', 'overloaded'].map(t => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase cursor-pointer transition-all ${
                          activeTab === t
                            ? 'bg-neon-purple/20 border-neon-purple/40 text-purple-300'
                            : 'bg-white/[0.01] border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                      <div className="col-span-full py-20 text-center flex flex-col items-center">
                          <Cpu className="w-8 h-8 text-neon-purple animate-spin mb-4" />
                          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">Querying Operator Registry...</p>
                      </div>
                  ) : developers.filter(dev => {
                      const assigneeTasks = tasks.filter(t => t.assignee === dev.name && t.status !== 'Done');
                      const loadPts = assigneeTasks.reduce((sum, t) => sum + intComplexity(t.complexity), 0);
                      
                      if (activeTab === 'active') return loadPts > 0;
                      if (activeTab === 'overloaded') return loadPts > 10;
                      return true;
                  }).map((dev, index) => {
                      // Dynamically compute load metrics
                      const assigneeTasks = tasks.filter(t => t.assignee === dev.name && t.status !== 'Done');
                      const loadPts = assigneeTasks.reduce((sum, t) => sum + intComplexity(t.complexity), 0);
                      const utilizationPercentage = Math.min(Math.round((loadPts / 14) * 100), 100);
                      const initials = dev.name.split(' ').map(n => n[0]).join('');
                      
                      return (
                          <motion.div
                            key={dev.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                              <GlassCard 
                                hoverGlow 
                                glowColor={loadPts > 12 ? 'red' : (dev.availability ? 'cyan' : 'purple')} 
                                className={`flex flex-col justify-between h-76 p-5 transition-all duration-300 relative border ${
                                  loadPts > 12 ? 'border-rose-500/20' : 'border-white/5'
                                }`}
                              >
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
                                                      <Award size={10} className="text-neon-cyan" /> {dev.skills.split(',')[0].toUpperCase()} LEAD
                                                  </span>
                                              </div>
                                          </div>
                                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                              loadPts > 12 
                                                ? 'bg-rose-950/20 border-rose-900/30 text-rose-400 animate-pulse'
                                                : (dev.availability ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-rose-950/20 border-rose-900/30 text-rose-400')
                                          }`}>
                                              {loadPts > 12 ? 'OVERLOADED' : (dev.availability ? 'AVAILABLE' : 'ALLOCATED')}
                                          </span>
                                      </div>

                                      {/* Skills Stack */}
                                      <div className="mb-4">
                                          <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase mb-1.5 font-mono">Skills Directive</div>
                                          <div className="flex flex-wrap gap-1.5 max-h-12 overflow-hidden pr-1">
                                              {dev.skills.split(',').map(skill => (
                                                  <span key={skill} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.02] border border-white/5 text-slate-400">
                                                      {skill.trim().toUpperCase()}
                                                  </span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>

                                  {/* Workload Index */}
                                  <div className="space-y-3.5">
                                      <div className="bg-black/35 border border-white/5 p-3 rounded-xl">
                                          <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                                              <span className="text-slate-500">UTILIZATION INDEX</span>
                                              <span className={`font-bold ${getUtilizationColor(loadPts)}`}>{utilizationPercentage}%</span>
                                          </div>
                                          <div className="w-full h-1 bg-white/[0.04] rounded-full overflow-hidden">
                                              <div className={`h-full rounded-full transition-all duration-500 ${getUtilizationBarColor(loadPts)}`} style={{ width: `${utilizationPercentage}%` }}></div>
                                          </div>
                                      </div>

                                      <div className="flex justify-between items-center text-xs">
                                          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono">
                                              <Clock size={12} className="text-slate-500" />
                                              <span>{assigneeTasks.length} Pending Tasks ({loadPts} pts)</span>
                                          </div>
                                          <span className="text-[10px] text-slate-500 font-mono">CAPACITY: 14 PTS</span>
                                      </div>
                                  </div>
                              </GlassCard>
                          </motion.div>
                      );
                  })}
                </div>
              </div>

              {/* Right Column: AI Optimization Pipeline recommendations list */}
              <div className="space-y-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Reassignment Pathways</h3>
                <div className="space-y-4">
                  {optimizationData && optimizationData.recommendations.length > 0 ? (
                    optimizationData.recommendations.map((rec, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        key={idx}
                        className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-tr from-white/[0.01] to-transparent space-y-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-neon-cyan uppercase">OP-{idx+1} // TASK ALLOCATION MATCH</span>
                          <h4 className="text-xs font-bold text-white font-mono leading-tight">{rec.task_title}</h4>
                        </div>
                        <div className="p-2.5 bg-black/45 border border-white/5 rounded-lg text-[10px] text-slate-400 leading-relaxed font-sans">
                          {rec.reason}
                        </div>
                        <div className="flex items-center justify-between pt-1 font-mono text-[10px]">
                          <div className="space-y-0.5">
                            <span className="text-slate-500 block">CURRENT: {rec.current_assignee}</span>
                            <span className="text-emerald-400 block">PROPOSED: {rec.recommended_assignee}</span>
                          </div>
                          <button
                            onClick={() => handleApplyRecommendation(rec)}
                            disabled={isOptimizing}
                            className="bg-neon-cyan hover:bg-neon-cyan/80 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-lg shadow-neon-cyan/10"
                          >
                            <Check size={10} />
                            APPLY
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <GlassCard className="py-12 text-center flex flex-col items-center border border-white/5">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
                      <h4 className="text-xs font-bold text-white font-mono uppercase">Talent Allocation Ideal</h4>
                      <p className="text-[10px] text-slate-500 font-sans max-w-[200px] leading-relaxed mt-1">
                        Developer task points are perfectly distributed. No reassignments needed at this scan interval.
                      </p>
                    </GlassCard>
                  )}
                </div>
              </div>
            </div>
        </div>
    );
};

// Heuristic complexity points parse
const intComplexity = (val) => {
  const parsed = parseInt(val);
  return isNaN(parsed) ? 5 : parsed;
};

export default ResourceAllocation;

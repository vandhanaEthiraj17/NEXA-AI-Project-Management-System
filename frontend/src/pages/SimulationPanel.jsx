import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { SlidersHorizontal, AlertCircle, PlusCircle, Sparkles, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const SimulationPanel = () => {
  const { projectData: data } = useContext(DataContext);

  // Extract base values or use defaults
  const baseRisk = data?.metrics?.risk_score || 50;
  const baseTeamSize = 5; 

  const [simTeamSize, setSimTeamSize] = useState(baseTeamSize);
  const [simResources, setSimResources] = useState(5);
  const [simRisk, setSimRisk] = useState(baseRisk);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    // Basic simulation logic: more team members and resources reduce risk
    const teamDiff = simTeamSize - baseTeamSize;
    const resDiff = simResources - 5;
    
    let newRisk = baseRisk - (teamDiff * 3) - (resDiff * 2);
    newRisk = Math.max(5, Math.min(99, Math.round(newRisk * 10) / 10));
    setSimRisk(newRisk);
  }, [simTeamSize, simResources, baseTeamSize, baseRisk]);

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
          <h2 className="font-mono text-lg font-bold text-white uppercase tracking-wider mb-2">Simulation Engine Locked</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            Run an analysis model first to calibrate baseline parameters and enable interactive scenario calculations.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleSaveSnapshot = () => {
    // Calculate Efficiency Score (Lower risk + Lower resources = Higher score)
    const efficiency = (100 - simRisk) / (simTeamSize + simResources);
    
    const newSnapshot = {
      id: Date.now(),
      teamSize: simTeamSize,
      resources: simResources,
      risk: simRisk,
      efficiency: efficiency.toFixed(2),
      timestamp: new Date().toLocaleTimeString()
    };
    
    setSnapshots(prev => [newSnapshot, ...prev].slice(0, 3)); // Keep top 3
  };

  const getRiskColor = (risk) => {
    if (risk > 60) return '#f43f5e'; // rose-500
    if (risk > 35) return '#fbbf24'; // amber-400
    return '#06b6d4'; // neon-cyan
  };

  const getRiskColorClass = (risk) => {
    if (risk > 60) return 'text-rose-400';
    if (risk > 35) return 'text-amber-400';
    return 'text-cyan-400';
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <header className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <SlidersHorizontal className="text-neon-purple" size={24} />
          Simulation Control Core
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust pipeline parameters to run risk-to-resource optimizations.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: Interactive Sliders Card */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-1.5">
              <Sparkles size={14} className="text-neon-cyan" />
              Adjust Simulation Parameters
            </h3>
            
            <div className="space-y-6">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">Team Allocation Capacity</span>
                  <span className="bg-neon-cyan/15 border border-neon-cyan/20 text-neon-cyan font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                    {simTeamSize} Personnel
                  </span>
                </div>
                <input 
                  type="range" min="1" max="30" value={simTeamSize} 
                  onChange={(e) => setSimTeamSize(parseInt(e.target.value))}
                  className="w-full accent-neon-cyan h-1 bg-white/[0.04] rounded-lg appearance-none cursor-pointer focus:outline-none"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400">Resource Integration Load</span>
                  <span className="bg-neon-purple/15 border border-neon-purple/20 text-neon-purple font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                    Level {simResources}/10
                  </span>
                </div>
                <input 
                  type="range" min="1" max="10" value={simResources} 
                  onChange={(e) => setSimResources(parseInt(e.target.value))}
                  className="w-full accent-neon-purple h-1 bg-white/[0.04] rounded-lg appearance-none cursor-pointer focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            className="w-full bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-3 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider mt-8" 
            onClick={handleSaveSnapshot}
          >
            <PlusCircle size={14} />
            Lock Pathway Matrix
          </button>
        </GlassCard>

        {/* Right: Radial Progress Risk Map */}
        <GlassCard className="flex flex-col items-center justify-center py-6 text-center border-t-2" style={{ borderTopColor: getRiskColor(simRisk) }}>
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="2.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={getRiskColor(simRisk)} strokeWidth="2.5" strokeDasharray={`${simRisk}, 100`} style={{ transition: 'stroke-dasharray 0.5s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none" style={{ color: getRiskColor(simRisk) }}>{simRisk}%</div>
              <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1.5">Projected Risk</div>
            </div>
          </div>
          
          <div className="mt-6 w-full pt-4 border-t border-white/5">
            <div className="flex justify-center gap-6 text-center font-mono">
              <div>
                <div className="text-slate-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">BASELINE</div>
                <div className="text-xs font-bold text-white">{baseRisk}%</div>
              </div>
              <div className="w-[1px] bg-white/5 h-6"></div>
              <div>
                <div className="text-slate-500 text-[8px] font-bold uppercase tracking-wider mb-0.5">DELTA</div>
                <div className={`text-xs font-bold ${simRisk < baseRisk ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simRisk < baseRisk ? '-' : '+'}{Math.abs(baseRisk - simRisk).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* Decision Ranking System */}
      <div className="pt-4 space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          Decision Path Ranking System
        </h3>
        
        {snapshots.length === 0 ? (
          <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-slate-500 text-xs font-sans">
            No scenarios locked. Calibrate parameters using sliders above, then lock them to evaluate metrics.
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots.sort((a, b) => b.efficiency - a.efficiency).map((snapshot, i) => (
              <div 
                key={snapshot.id} 
                className={`glass-panel p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ${
                  i === 0 
                    ? 'border-neon-cyan bg-neon-cyan/5 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'border-white/5 bg-white/[0.01]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`font-mono font-extrabold text-sm shrink-0 ${i === 0 ? 'text-neon-cyan' : 'text-slate-500'}`}>#{i + 1}</div>
                  <div>
                    <div className="text-[8px] text-slate-500 font-mono uppercase">ALLOCATED SPEC</div>
                    <div className="text-xs font-bold text-white font-sans">{snapshot.teamSize}P / Lvl {snapshot.resources}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[8px] text-slate-500 font-mono uppercase">EXPOSURE RISK</div>
                  <div className={`text-xs font-bold font-mono ${getRiskColorClass(snapshot.risk)}`}>{snapshot.risk}%</div>
                </div>

                <div>
                  <div className="text-[8px] text-slate-500 font-mono uppercase">EFFICIENCY RATIO</div>
                  <div className="text-xs font-bold text-white font-mono">{snapshot.efficiency}</div>
                </div>

                <div className="shrink-0 flex items-center">
                  {i === 0 ? (
                    <span className="bg-neon-cyan/15 border border-neon-cyan/20 text-neon-cyan font-mono font-bold text-[8px] px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={10} /> RECOMMENDED
                    </span>
                  ) : (
                    <span className="text-[8px] text-slate-500 font-mono uppercase">Ranked Strategy</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SimulationPanel;

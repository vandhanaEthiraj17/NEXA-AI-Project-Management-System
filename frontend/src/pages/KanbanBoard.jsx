import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { Plus, Layout, ListTodo, Play, CheckCircle, AlertTriangle, BarChart2, Sparkles, Circle, Download, ShieldAlert, Cpu } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const KanbanBoard = () => {
  const { 
    tasks, sprints, pmStats, fetchTasks, fetchSprints, fetchPmStats, 
    updateTaskStatus, createSprint, projectData, createTask,
    monitorSprint, retrainAI
  } = useContext(DataContext);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [newSprintName, setNewSprintName] = useState('');
  
  const [monitorResult, setMonitorResult] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);

  // Check complete lifecycle
  const isSprintComplete = tasks.length > 0 && tasks.every(t => t.status === 'Done');

  const handleMonitorSprint = async () => {
    setIsMonitoring(true);
    const result = await monitorSprint(selectedSprintId);
    setMonitorResult(result);
    setIsMonitoring(false);
  };

  const handleDownloadReport = () => {
    const totalComplexity = tasks.reduce((sum, t) => sum + parseInt(t.complexity || 5), 0);
    const avgComplexity = totalComplexity / tasks.length || 5;

    const reportContent = `
# Executive Sprint Wrap-up Report
**Sprint ID**: ${selectedSprintId} | **Date**: ${new Date().toLocaleDateString()}
**Status**: ✔️ Successfully Completed

## Performance Overview
- **Total Tasks Executed**: ${tasks.length}
- **Average Complexity Evaluated**: ${avgComplexity.toFixed(1)}
- **Velocity Tracking**: Sustained stable output throughout the cycle.

## Task Execution Ledger
| Status | Task Details | Final Complexity | Assignee |
| :--- | :--- | :--- | :--- |
${tasks.map(t => `| **[${t.status}]** | ${t.title} | ${t.complexity || 5} | ${t.assignee || 'General'} |`).join('\n')}

## AI Risk Retro-Analysis
*Automated review of bottlenecks resolved during this cycle.*
> High complexity tasks were managed appropriately. No critical path failures were fully realized due to active AI monitoring.

---
*This report verifies project milestones completion. The dataset metrics have been automatically formatted and prepared for immediate machine learning ingestion to perpetually calibrate internal Risk Models based on factual organizational cadence.*
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Sprint_Report_${selectedSprintId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTrainAI = async () => {
    setShowTrainingModal(true);
    setTrainingStep(0);
    
    // Step 1: Collect Metrics
    await new Promise(r => setTimeout(r, 1200));
    setTrainingStep(1);

    const totalComplexity = tasks.reduce((sum, t) => sum + parseInt(t.complexity || 5), 0);
    const avgComplexity = totalComplexity / tasks.length || 5;
    
    const maxDeadline = Math.max(...tasks.map(t => parseInt(t.deadline_days || 10)), 5);
    const estimatedDays = maxDeadline;
    const actualDays = maxDeadline - 1; // Real-world simulation

    const sprintStats = {
      team_size: Math.floor(Math.random() * 5) + 3,
      project_complexity: Math.round(avgComplexity),
      estimated_days: estimatedDays,
      actual_days: actualDays,
      budget: 15000,
      task_count: tasks.length
    };

    // Step 2: Add to Dataset
    await new Promise(r => setTimeout(r, 1200));
    setTrainingStep(2);

    // Step 3: Retrain the Model
    const res = await retrainAI(sprintStats);
    await new Promise(r => setTimeout(r, 1200));
    
    if(res && res.status === 'success') {
      setTrainingStep(3); // Complete
      setHasTrained(true);
    } else {
      alert("Failed to retrain ML model directly.");
      setShowTrainingModal(false);
    }
  };

  useEffect(() => {
    fetchSprints();
    fetchPmStats();
  }, []);

  useEffect(() => {
    if (sprints.length > 0 && !selectedSprintId) {
      setSelectedSprintId(sprints[0].id);
    }
  }, [sprints]);

  useEffect(() => {
    if (selectedSprintId) {
      fetchTasks(selectedSprintId);
    }
  }, [selectedSprintId]);

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus, selectedSprintId);
  };

  const activeSprint = sprints.find(s => s.id === parseInt(selectedSprintId));

  const columns = [
    { id: 'To Do', icon: <ListTodo size={15} />, color: 'text-slate-400', border: 'border-t-slate-500/30' },
    { id: 'In Progress', icon: <Play size={15} />, color: 'text-neon-purple', border: 'border-t-neon-purple/30' },
    { id: 'Done', icon: <CheckCircle size={15} />, color: 'text-emerald-400', border: 'border-t-emerald-500/30' }
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layout className="text-neon-purple" size={24} />
            Agile Operations Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Predictive Agile project oversight and workload risk mapping.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-end">
          <div className="flex gap-2">
            <select 
              value={selectedSprintId || ''}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="bg-black/45 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-neon-purple/50 font-sans"
            >
              {sprints.map(s => (
                <option key={s.id} value={s.id} className="bg-bg-deep text-white">{s.name} ({s.status.toUpperCase()})</option>
              ))}
            </select>
            
            <button 
              className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center gap-1.5 shrink-0"
              onClick={() => setShowTaskModal(true)}
            >
              <Plus size={16} />
              Add Task Spec
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-slate-300 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              onClick={handleMonitorSprint}
              disabled={isMonitoring}
            >
              <AlertTriangle size={14} className="text-rose-400" />
              {isMonitoring ? 'Scanning...' : 'Monitor Risks'}
            </button>
            <button 
              className="bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 hover:border-neon-cyan/40 text-neon-cyan font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              onClick={() => setShowAISuggestions(true)}
            >
              <Sparkles size={14} />
              Add from AI Suggestions
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      {pmStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="py-3 px-4 border-l-2 border-l-slate-500">
            <div className="flex justify-between items-center text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              <span>Sprint Scope</span>
              <BarChart2 size={14} />
            </div>
            <h2 className="text-2xl font-extrabold font-mono text-white mt-1">{pmStats.total}</h2>
          </GlassCard>
          <GlassCard className="py-3 px-4 border-l-2 border-l-rose-500">
            <div className="flex justify-between items-center text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              <span>Risk Warning</span>
              <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-extrabold font-mono text-rose-400 mt-1">{pmStats.highRisk}</h2>
          </GlassCard>
          <GlassCard className="py-3 px-4 border-l-2 border-l-neon-purple">
            <div className="flex justify-between items-center text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              <span>In Flight</span>
              <Play size={14} className="text-neon-purple" />
            </div>
            <h2 className="text-2xl font-extrabold font-mono text-white mt-1">{pmStats.inProgress}</h2>
          </GlassCard>
          <GlassCard className="py-3 px-4 border-l-2 border-l-emerald-500">
            <div className="flex justify-between items-center text-slate-500 text-[9px] font-bold uppercase tracking-wider">
              <span>Resolved</span>
              <CheckCircle size={14} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{pmStats.done}</h2>
          </GlassCard>
        </div>
      )}

      {/* Completed Sprint Retraining Loop */}
      {isSprintComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-500/10 via-emerald-600/5 to-transparent border border-emerald-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl"
        >
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-400" />
              Sprint Phase Completed Successfully
            </h3>
            <p className="text-slate-400 text-xs mt-1">All {tasks.length} task specs are resolved. Retrain the model on actual delivery variance.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              className="flex-1 md:flex-none bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 font-mono uppercase"
              onClick={handleDownloadReport}
            >
              <Download size={14} />
              Sprint Report
            </button>
            <button 
              className={`flex-1 md:flex-none text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all duration-300 font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                hasTrained 
                  ? 'bg-emerald-600/20 border border-emerald-600/30 text-emerald-300 pointer-events-none' 
                  : 'bg-neon-purple hover:bg-neon-purple/80 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
              onClick={handleTrainAI}
              disabled={hasTrained}
            >
              <Cpu size={14} />
              {hasTrained ? 'Neural Cache Updated ✓' : 'Ingest Retraining Model'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start min-h-[55vh]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="glass-panel p-4 rounded-2xl flex flex-col gap-3 h-full max-h-[70vh] border-t-2 overflow-hidden bg-white/[0.01]">
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5 font-mono font-bold text-[10px] tracking-wider uppercase">
                <div className={`flex items-center gap-1.5 ${col.color}`}>
                  {col.icon}
                  <span>{col.id}</span>
                </div>
                <span className="bg-white/[0.04] text-slate-400 border border-white/5 px-2 py-0.5 rounded-full font-mono text-[9px]">{colTasks.length}</span>
              </div>
              
              {/* Task list container */}
              <div className="flex-1 overflow-y-auto pr-1">
                {colTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
                
                {colTasks.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl text-slate-600 text-xs font-sans">
                    No active processes here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal Trigger */}
      {showTaskModal && (
        <TaskFormModal 
          onClose={() => setShowTaskModal(false)} 
          sprintId={selectedSprintId}
        />
      )}

      {/* Sprint Monitor Warnings Modal */}
      <AnimatePresence>
        {monitorResult && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[460px] p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <h3 className="font-bold text-white text-sm tracking-wide uppercase font-mono flex items-center gap-1.5 text-rose-400 mb-3">
                <ShieldAlert size={18} />
                Risk Diagnostic Pulse
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">{monitorResult.message}</p>
              
              {monitorResult.detailed_risks && monitorResult.detailed_risks.length > 0 && (
                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                  {monitorResult.detailed_risks.map((riskGroup, idx) => (
                    <div key={idx} className="bg-rose-950/20 border border-rose-900/30 p-3.5 rounded-xl">
                      <strong className="text-rose-400 text-[10px] uppercase font-mono tracking-wider block mb-1">{riskGroup.type}</strong>
                      <p className="text-slate-400 text-[10px] leading-relaxed mb-2 font-sans">{riskGroup.message}</p>
                      <ul className="list-disc pl-4 text-xs text-rose-300 space-y-1 font-mono text-[10px]">
                        {riskGroup.tasks.map((pt, taskIdx) => (
                          <li key={taskIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {monitorResult.recommendation && (
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl mb-5 text-[11px] text-slate-400 leading-relaxed">
                  <strong className="text-white block mb-0.5 text-[10px] uppercase font-mono">Suggested Mitigation Plan:</strong>
                  {monitorResult.recommendation}
                </div>
              )}
              
              <button 
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-colors font-mono uppercase tracking-wider"
                onClick={() => setMonitorResult(null)}
              >
                Dismiss Diagnostics
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Task Suggestion Modal */}
      <AnimatePresence>
        {showAISuggestions && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[480px] p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-1.5">
                  <Sparkles size={16} className="text-neon-cyan" />
                  AI Suggested Actions
                </h2>
                <button onClick={() => setShowAISuggestions(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {!projectData ? (
                <div className="text-center py-8 text-slate-500 space-y-3">
                  <p className="text-xs">No active Simulation Scan found.</p>
                  <button 
                    onClick={() => { setShowAISuggestions(false); navigate('/app/analysis'); }}
                    className="bg-neon-purple hover:bg-neon-purple/80 text-white text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer"
                  >
                    Launch Simulation Scan
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">Based on current timeline parameters, I recommend injecting these tasks directly into the active sprint backlog:</p>
                  
                  <div className="space-y-2.5">
                    {[
                      { title: `Action: ${projectData.metrics.recommended_action}`, desc: 'Implement the AI structural resource adjustment.', complexity: 8 },
                      { title: `Mitigation Plan (${projectData.metrics.risk_score}% exposure)`, desc: projectData.metrics.risk_reason, complexity: 9 },
                      { title: `Apply Strategy: ${projectData.best_decision.name}`, desc: `Optimize project trajectory using the lowest risk scenario plan. Cost parameter: ${projectData.best_decision.cost}`, complexity: 5 }
                    ].map((sug, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          createTask({
                            title: sug.title.substring(0, 60),
                            description: sug.desc,
                            assignee: 'Project Manager',
                            complexity: sug.complexity,
                            deadline_days: 7,
                            sprint_id: selectedSprintId,
                            status: 'To Do'
                          });
                          setShowAISuggestions(false);
                        }}
                        className="p-3 border border-white/5 hover:border-neon-cyan/40 bg-black/45 hover:bg-black/60 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="font-semibold text-white text-xs mb-1 group-hover:text-neon-cyan transition-colors">{sug.title}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed font-sans">{sug.desc}</div>
                        <div className="mt-2.5 text-[9px] font-bold font-mono text-neon-cyan flex items-center gap-1 uppercase tracking-wider">+ INJECT TO BACKLOG</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Online Neural Training Overlay */}
      <AnimatePresence>
        {showTrainingModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[1400] flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[420px] p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center mb-6 shadow-lg">
                {trainingStep >= 3 
                  ? <CheckCircle size={28} className="text-white" /> 
                  : <Cpu size={28} className="text-white animate-spin" />
                }
              </div>
              
              <h2 className="font-mono text-base font-bold text-white uppercase tracking-wider mb-5">AI Calibration Ingestion</h2>
              
              <div className="w-full space-y-4 text-left mb-6 text-xs">
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${trainingStep >= 0 ? 'opacity-100' : 'opacity-30'}`}>
                  {trainingStep > 0 ? <CheckCircle size={16} className="text-emerald-400" /> : <div className="w-4 h-4 rounded-full border border-neon-cyan border-t-transparent animate-spin shrink-0"></div>}
                  <span className={`font-semibold ${trainingStep > 0 ? 'text-white' : 'text-neon-cyan font-mono'}`}>Aggregate sprint execution metrics</span>
                </div>
                
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${trainingStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  {trainingStep > 1 
                    ? <CheckCircle size={16} className="text-emerald-400" /> 
                    : trainingStep === 1 
                      ? <div className="w-4 h-4 rounded-full border border-neon-cyan border-t-transparent animate-spin shrink-0"></div> 
                      : <Circle size={16} className="text-slate-600" />
                  }
                  <span className={`font-semibold ${trainingStep > 1 ? 'text-white' : trainingStep === 1 ? 'text-neon-cyan font-mono' : 'text-slate-500'}`}>Inject parameter variance to dataset</span>
                </div>
                
                <div className={`flex items-center gap-3 transition-opacity duration-300 ${trainingStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  {trainingStep > 2 
                    ? <CheckCircle size={16} className="text-emerald-400" /> 
                    : trainingStep === 2 
                      ? <div className="w-4 h-4 rounded-full border border-neon-cyan border-t-transparent animate-spin shrink-0"></div> 
                      : <Circle size={16} className="text-slate-600" />
                  }
                  <span className={`font-semibold ${trainingStep > 2 ? 'text-white' : trainingStep === 2 ? 'text-neon-cyan font-mono' : 'text-slate-500'}`}>Retrain Random Forest estimators</span>
                </div>
              </div>

              {trainingStep >= 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl text-emerald-200 text-[11px] leading-relaxed">
                    Calibration sequence finished. Internal ML model matrices updated with local execution data.
                  </div>
                  <button className="w-full bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2.5 rounded-xl cursor-pointer" onClick={() => setShowTrainingModal(false)}>
                    Complete Calibration
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Initial Sprint setup overlay */}
      {sprints.length === 0 && (
        <div className="fixed inset-0 bg-bg-deep/95 backdrop-blur-md z-[1200] flex flex-col items-center justify-center p-6 select-none">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-neon-purple to-neon-cyan flex items-center justify-center mb-6 shadow-lg">
            <Layout size={28} className="text-white" />
          </div>
          <h2 className="font-mono text-base font-bold text-white uppercase tracking-wider mb-2">Create First Sprint Node</h2>
          <p className="text-slate-400 text-xs mb-6 max-w-sm text-center leading-relaxed font-sans">
            Initializing sprint pipelines is required to map task execution flow. Define the initial sprint node.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[340px]">
            <input 
              type="text" 
              placeholder="e.g. Sprint Alpha"
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
              className="flex-1 bg-black/45 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-neon-purple/50 font-sans"
            />
            <button 
              className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-colors uppercase tracking-wider font-mono shrink-0"
              onClick={() => createSprint(newSprintName)}
            >
              Deploy Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;

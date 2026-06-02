import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, FileText, Layers, ChevronRight, Search, Cpu, Sparkles, X, LayoutGrid } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

const NewAnalysisPage = () => {
  const { domain } = useContext(AppContext);
  const { analyzeData, isAnalyzing, error, tasks, sprints, fetchSprints, fetchTasks } = useContext(DataContext);
  const navigate = useNavigate();

  const [showSprintModal, setShowSprintModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    fetchSprints();
    fetchTasks();
  }, [fetchSprints, fetchTasks]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    // Software
    team_size: 5,
    deadline: 30,
    resources: 5,
    // Business
    budget: 10000,
    demand: 5,
    // Hardware
    machines: 2,
    manpower: 5,
    production_time: 30
  });

  const [files, setFiles] = useState([]);
  const [teamFiles, setTeamFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleTeamFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setTeamFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleSelectTask = (task) => {
    setFormData({
      ...formData,
      title: task.title || '',
      description: task.description || '',
      team_size: 5, 
      deadline: task.deadline_days || 30,
      resources: task.complexity || 5, 
      budget: 10000, 
      demand: 5,
      machines: 2,
      manpower: 5,
      production_time: task.deadline_days || 30
    });
    setShowSprintModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await analyzeData(formData, domain);
    if (success) {
      navigate('/app/dashboard');
    }
  };

  const renderFormFields = () => {
    switch (domain) {
      case 'Software':
        return (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full col-span-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Team Size</label>
              <input type="number" name="team_size" value={formData.team_size} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Deadline Target (Days)</label>
              <input type="number" name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Required Resource Allocation (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
          </div>
        );
      case 'Business':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full col-span-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Budget ($)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Market Demand Weight (1-10)</label>
              <input type="number" name="demand" min="1" max="10" value={formData.demand} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Available Resources (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
          </div>
        );
      case 'Hardware':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full col-span-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Active Machinery Count</label>
              <input type="number" name="machines" value={formData.machines} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Personnel Count</label>
              <input type="number" name="manpower" value={formData.manpower} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Manufacturing Timeline (Days)</label>
              <input type="number" name="production_time" value={formData.production_time} onChange={handleChange} className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono" />
            </div>
          </div>
        );
      default:
        return <p className="text-slate-400 text-xs col-span-2">Please initialize domain routing settings.</p>;
    }
  };

  return (
    <div className="space-y-6 select-none max-w-4xl mx-auto">
      {/* Header */}
      <header className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Cpu className="text-neon-purple animate-pulse" size={24} />
          {domain} Simulation Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure project variables to run AI complexity and risk calculations.</p>
      </header>

      {/* Main Form Glass Card */}
      <GlassCard className="p-6 md:p-8 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>

        {error && (
          <div className="bg-rose-950/20 border border-rose-900/30 text-rose-200 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6">
            <AlertCircle size={16} className="text-rose-400" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Project Spec Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Platform Migration Core"
                className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
            
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Detailed Scope Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Describe project details. The AI parsing model will automatically calculate complexity parameters based on keywords."
                className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-none h-32"
              />
              <span className="text-[9px] text-slate-500 font-mono block mt-1 uppercase">AI-based automatic complexity extraction is active</span>
            </div>

            {renderFormFields()}
          </div>

          {/* Files dropzone deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            {/* Team details dropzone */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Workforce Performance Registry</label>
              <div className="space-y-3">
                <div 
                  onClick={() => document.getElementById('team-file-upload').click()}
                  className="border-2 border-dashed border-white/5 hover:border-neon-purple/40 bg-white/[0.01] hover:bg-white/[0.03] p-5 rounded-2xl text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center"
                >
                  <Upload size={20} className="text-neon-purple mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Sync Team File</span>
                  <span className="text-[9px] text-slate-500 font-sans mt-0.5">XLSX, CSV registry formats</span>
                  <input id="team-file-upload" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" hidden onChange={handleTeamFileChange} />
                </div>

                {teamFiles.length > 0 && (
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl max-h-24 overflow-y-auto space-y-1">
                    <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">TELEMETRY SYNC READY ({teamFiles.length})</div>
                    {teamFiles.map((f, i) => (
                      <div key={i} className="text-[10px] text-slate-300 font-sans flex items-center gap-1.5 truncate">
                        <FileText size={12} className="text-neon-purple shrink-0" /> {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reference files dropzone */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Reference Scope Documents</label>
              <div className="space-y-3">
                <div 
                  onClick={() => document.getElementById('file-upload').click()}
                  className="border-2 border-dashed border-white/5 hover:border-neon-cyan/40 bg-white/[0.01] hover:bg-white/[0.03] p-5 rounded-2xl text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center"
                >
                  <Upload size={20} className="text-neon-cyan mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Sync Reference Files</span>
                  <span className="text-[9px] text-slate-500 font-sans mt-0.5">PDF, DOCX configurations</span>
                  <input id="file-upload" type="file" multiple hidden onChange={handleFileChange} />
                </div>

                {files.length > 0 && (
                  <div className="bg-black/40 border border-white/5 p-3 rounded-xl max-h-24 overflow-y-auto space-y-1">
                    <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">SYNCED SPEC SHEETS ({files.length})</div>
                    {files.map((f, i) => (
                      <div key={i} className="text-[10px] text-slate-300 font-sans flex items-center gap-1.5 truncate">
                        <FileText size={12} className="text-neon-cyan shrink-0" /> {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-center border-t border-white/5">
            <button 
              type="submit" 
              disabled={isAnalyzing} 
              className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold text-xs py-3 px-8 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={14} />
              )}
              Initialize Intelligence Scans
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Kanban Sprints import triggers */}
      <GlassCard className="border border-neon-cyan/20 bg-gradient-to-r from-neon-cyan/5 to-transparent flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">Evaluate from Sprint Backlog</h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Scan existing project tasks directly from active Kanban lists for quick calibration.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowSprintModal(true)}
          className="bg-white hover:bg-slate-100 text-bg-deep font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all whitespace-nowrap uppercase tracking-wider font-mono flex items-center gap-1"
        >
          Browse Backlog Nodes <ChevronRight size={14} />
        </button>
      </GlassCard>

      {/* Sprints selection Modal */}
      <AnimatePresence>
        {showSprintModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[1300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel-heavy rounded-2xl w-full max-w-[500px] max-h-[80vh] flex flex-col p-6 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  Select Backlog Node
                </h2>
                <button onClick={() => setShowSprintModal(false)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Filter tasks..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 divide-y divide-white/5">
                {tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                  tasks
                    .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => handleSelectTask(task)}
                        className="p-3 border border-white/5 hover:border-neon-cyan/40 bg-black/45 hover:bg-black/60 rounded-xl cursor-pointer transition-all group flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white mb-1 group-hover:text-neon-cyan transition-colors">{task.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">COMPLEXITY: {task.complexity} | TIMELINE: {task.deadline_days}d</div>
                        </div>
                        <span className="text-[9px] font-mono font-bold bg-white/[0.04] text-slate-400 border border-white/5 px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ml-2">
                          {task.status}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No matching task logs located.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewAnalysisPage;

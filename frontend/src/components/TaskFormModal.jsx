import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { X, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const TaskFormModal = ({ onClose, sprintId }) => {
  const { createTask } = useContext(DataContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    complexity: 5,
    deadline_days: 7,
    sprint_id: sprintId
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createTask(formData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1300] flex items-center justify-center p-4 select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel-heavy rounded-2xl w-full max-w-[480px] p-6 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-purple to-neon-cyan"></div>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">Create New Task Spec</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Task Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Implement Auth Logic"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Description Details</label>
            <textarea 
              rows="3" 
              placeholder="Provide scope context for execution..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors font-sans resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Assignee</label>
              <input 
                type="text" 
                placeholder="Name"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Complexity (1-10)</label>
              <input 
                type="number" 
                min="1" max="10"
                value={formData.complexity}
                onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Deadline (Days Remaining)</label>
            <input 
              type="number" 
              value={formData.deadline_days}
              onChange={(e) => setFormData({...formData, deadline_days: e.target.value})}
              className="w-full bg-black/45 border border-white/5 focus:border-neon-purple/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-colors font-mono"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 text-slate-400 hover:text-white font-semibold text-xs py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-neon-purple hover:bg-neon-purple/85 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all duration-300 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider"
            >
              <PlusCircle size={14} />
              Add Task Spec
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskFormModal;

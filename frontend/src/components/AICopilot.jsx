import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AppContext } from '../context/AppContext';
import { SocketContext } from '../context/SocketContext';
import { 
  Sparkles, Send, AlertTriangle, CheckCircle, Brain, Terminal, 
  ShieldAlert, Minimize2, Maximize2, Cpu, HelpCircle, Activity, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AICopilot = () => {
  const { tasks, pmStats, projectData, sprints } = useContext(DataContext);
  const { domain } = useContext(AppContext);
  const { liveAlerts, clearAlert } = useContext(SocketContext);

  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Greetings. I am NEXA AI, your Project Intelligence Copilot. I am monitoring your sprint pipelines, ML estimators, and active talent allocations. Ask me any optimization query.", 
      sender: 'ai',
      source: 'NEXA Core' 
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Generate active contextual alerts from tasks state locally
    const newAlerts = [];
    const highComplexityUnassigned = tasks.filter(t => t.status !== 'Done' && parseInt(t.complexity || 5) >= 7 && (!t.assignee || t.assignee === 'Unassigned'));
    if (highComplexityUnassigned.length > 0) {
      newAlerts.push({
        type: 'danger',
        msg: `Staffing Risk: ${highComplexityUnassigned.length} high-complexity tasks are unallocated.`
      });
    }

    const stuckTasks = tasks.filter(t => t.status === 'In Progress' && parseInt(t.complexity || 5) >= 6);
    if (stuckTasks.length > 0) {
      newAlerts.push({
        type: 'warning',
        msg: `WIP Alert: ${stuckTasks.length} high-complexity features are stuck in 'In Progress'.`
      });
    }

    if (projectData && parseFloat(projectData.metrics?.risk_score) > 50) {
      newAlerts.push({
        type: 'danger',
        msg: `High Project Risk Level: ${projectData.metrics.risk_score}% exposure detected.`
      });
    }

    setAlerts(newAlerts);
  }, [tasks, projectData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const messageText = textOverride || inputVal;
    if (!messageText.trim()) return;

    const userMsg = { id: Date.now(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageText })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: data.reply, 
          sender: 'ai',
          source: data.source || 'NEXA Model Engine'
        }]);
      } else {
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          text: "System Error: Could not resolve prompt from NEXA server.", 
          sender: 'ai',
          source: 'System Fallback'
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Network Connection Timeout. Check if the Flask API server is active on port 5000.", 
        sender: 'ai',
        source: 'Network Error'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuery = (queryText) => {
    handleSend(null, queryText);
  };

  return (
    <aside className="w-80 border-l border-white/5 bg-bg-glass-heavy backdrop-blur-xl flex flex-col h-full overflow-hidden text-sm relative select-none">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-neon-purple-dim text-neon-purple shrink-0">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-white tracking-wider uppercase text-[11px] font-mono">NEXA AI Copilot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">COGNITIVE FEED</span>
        </div>
      </div>

      {/* Main scrolling panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] leading-relaxed">
        {/* Live Broadcast Feeds from socket Context */}
        {liveAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase mb-1 flex items-center gap-1">
              <Activity size={10} className="text-neon-cyan animate-pulse" />
              Live WebSocket Broadcast Feed
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              <AnimatePresence>
                {liveAlerts.map((alt) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={alt.id}
                    className="p-2.5 rounded-lg border bg-black/45 border-white/5 text-slate-300 relative group"
                  >
                    <button 
                      onClick={() => clearAlert(alt.id)}
                      className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                    <div className="font-bold text-white text-[10px] flex items-center gap-1">
                      <span className="h-1 w-1 bg-neon-cyan rounded-full"></span>
                      {alt.title.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{alt.message}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Dynamic Static Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase mb-1">Active Pipeline Warnings</div>
            {alerts.map((alt, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`p-2.5 rounded-lg border flex gap-2 items-start ${
                  alt.type === 'danger'
                    ? 'bg-rose-950/15 border-rose-900/30 text-rose-300'
                    : 'bg-amber-950/15 border-amber-900/30 text-amber-300'
                }`}
              >
                <ShieldAlert size={14} className={`shrink-0 mt-0.5 ${alt.type === 'danger' ? 'text-rose-400' : 'text-amber-400'}`} />
                <div className="text-[10px] leading-relaxed font-sans">{alt.msg}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* AI Optimization suggest quick links */}
        <div className="space-y-2">
          <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase">Quick Diagnostic Targets</div>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              "Why is sprint risk increasing?",
              "Which developer is overloaded?",
              "Suggest optimized team allocation."
            ].map((qText, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(qText)}
                className="w-full text-left p-2 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-between text-[10px] font-sans group"
              >
                <span className="truncate">{qText}</span>
                <HelpCircle size={10} className="text-slate-500 group-hover:text-neon-purple transition-colors shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Chat Conversation Console */}
        <div className="border-t border-white/5 pt-4 space-y-2 flex-1 flex flex-col min-h-0">
          <div className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase">Copilot Console</div>
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex-1 min-h-[160px] overflow-y-auto space-y-3 flex flex-col font-sans">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-[90%] rounded-xl p-2.5 text-[11px] leading-relaxed relative flex flex-col ${
                  msg.sender === 'ai'
                    ? 'bg-white/[0.02] text-slate-300 border border-white/5 self-start'
                    : 'bg-neon-purple/20 text-purple-100 self-end border border-neon-purple/30'
                }`}
              >
                {msg.sender === 'ai' && (
                  <span className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest mb-1 select-none font-bold">
                    [{msg.source}]
                  </span>
                )}
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="bg-white/[0.02] text-slate-400 border border-white/5 max-w-[90%] rounded-xl p-2.5 text-[11px] flex items-center gap-1.5 self-start">
                <span className="text-[8px] font-mono text-neon-cyan animate-pulse uppercase tracking-widest font-bold">COMPUTING</span>
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form Panel */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask NEXA AI for diagnostics..."
          className="flex-1 bg-black/45 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple/50 transition-colors font-sans"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-neon-purple text-white hover:bg-neon-purple/80 transition-colors cursor-pointer shrink-0 shadow-lg shadow-neon-purple/15"
        >
          <Send size={12} />
        </button>
      </form>
    </aside>
  );
};

export default AICopilot;

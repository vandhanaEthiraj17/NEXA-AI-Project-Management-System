import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import { AppContext } from '../context/AppContext';
import { Sparkles, Send, AlertTriangle, CheckCircle, Brain, Terminal, ShieldAlert, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AICopilot = () => {
  const { tasks, pmStats, projectData, monitorSprint, sprints } = useContext(DataContext);
  const { domain } = useContext(AppContext);
  const [messages, setMessages] = useState([
    { id: 1, text: "System initialized. I am your NexaAI Copilot. How can I optimize this sprint?", sender: 'ai' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Generate active contextual alerts from tasks state
    const newAlerts = [];
    const highComplexityUnassigned = tasks.filter(t => t.status !== 'Done' && parseInt(t.complexity || 5) >= 7 && (!t.assignee || t.assignee === 'Unassigned'));
    if (highComplexityUnassigned.length > 0) {
      newAlerts.push({
        type: 'danger',
        msg: `Bottleneck risk: ${highComplexityUnassigned.length} high-complexity task(s) are unassigned.`
      });
    }

    const stuckTasks = tasks.filter(t => t.status === 'In Progress' && parseInt(t.complexity || 5) >= 6);
    if (stuckTasks.length > 0) {
      newAlerts.push({
        type: 'warning',
        msg: `Velocity issue: ${stuckTasks.length} task(s) with high complexity are stuck in execution.`
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), text: inputVal, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 1200));

    let reply = "I analyzed your query relative to the active sprint model. The operational variance is stable, but standard velocity checks apply.";
    const query = inputVal.toLowerCase();

    if (query.includes('risk') || query.includes('delay') || query.includes('status')) {
      if (projectData) {
        reply = `The current project risk is ${projectData.metrics.risk_score}%, with a success probability of ${projectData.metrics.success_probability}%. Recommendation: ${projectData.metrics.recommended_action}.`;
      } else {
        const highRiskCount = pmStats?.highRisk || 0;
        reply = `Active sprint metrics report ${highRiskCount} tasks at high operational risk. Running risk monitor scans will yield refined parameters.`;
      }
    } else if (query.includes('dev') || query.includes('assignee') || query.includes('resource')) {
      const unassigned = tasks.filter(t => !t.assignee || t.assignee === 'Unassigned');
      if (unassigned.length > 0) {
        reply = `Resource allocation check: Found ${unassigned.length} unassigned task(s). I recommend assigning "${unassigned[0].title}" to Bob Smith (Backend) or Alice Chen (Frontend) based on matching skills.`;
      } else {
        reply = "All active tasks are allocated. Resource utilization is currently balanced at an average of 78%.";
      }
    } else if (query.includes('sprint') || query.includes('tasks')) {
      const todo = tasks.filter(t => t.status === 'To Do').length;
      const progress = tasks.filter(t => t.status === 'In Progress').length;
      reply = `Active sprint state breakdown: ${todo} tasks in To Do, ${progress} in Progress, and ${tasks.filter(t => t.status === 'Done').length} completed.`;
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      reply = "Greetings. I am monitoring the active project pipelines. You can ask me about sprint status, risk calculations, or team allocations.";
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, sender: 'ai' }]);
    setLoading(false);
  };

  return (
    <aside className="w-80 border-l border-white/5 bg-bg-glass-heavy backdrop-blur-xl flex flex-col h-full overflow-hidden text-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-neon-purple-dim text-neon-purple">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-white tracking-wide uppercase text-xs">AI Copilot Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-400 font-mono">LIVE SCANS</span>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Dynamic Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-1">Critical Path Alerts</div>
            {alerts.map((alt, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`p-3 rounded-lg border flex gap-2.5 items-start ${
                  alt.type === 'danger'
                    ? 'bg-rose-950/20 border-rose-900/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-900/30 text-amber-200'
                }`}
              >
                <ShieldAlert size={16} className={`shrink-0 mt-0.5 ${alt.type === 'danger' ? 'text-rose-400' : 'text-amber-400'}`} />
                <div className="text-[11px] leading-relaxed">{alt.msg}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Predictive Suggestions */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mb-1">Optimizations</div>
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Brain size={40} className="text-neon-cyan" />
            </div>
            <h4 className="font-semibold text-xs text-white mb-1 flex items-center gap-1.5">
              <Sparkles size={12} className="text-neon-cyan" />
              Scenario Recommendation
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {projectData 
                ? `Mitigate current ${projectData.metrics.risk_score}% risk by applying the recommendation: "${projectData.metrics.recommended_action}".`
                : "Run a timeline and resource simulation to calculate the lowest risk project strategy path."}
            </p>
          </div>
        </div>

        {/* Chat History */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">Copilot Console</div>
          <div className="bg-black/30 rounded-xl p-3 border border-white/5 h-48 overflow-y-auto space-y-3 flex flex-col font-sans">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-lg p-2.5 text-[11px] leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-white/[0.04] text-slate-300 border border-white/5'
                    : 'bg-neon-purple/20 text-purple-100 self-end border border-neon-purple/30'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white/[0.04] text-slate-400 border border-white/5 max-w-[85%] rounded-lg p-2.5 text-[11px] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-white/[0.01] flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask NexaAI for optimizations..."
          className="flex-1 bg-black/45 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-purple/50 transition-colors"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-neon-purple text-white hover:bg-neon-purple/80 transition-colors cursor-pointer"
        >
          <Send size={12} />
        </button>
      </form>
    </aside>
  );
};

export default AICopilot;

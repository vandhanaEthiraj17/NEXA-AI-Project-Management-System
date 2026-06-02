import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Code2, Landmark, Settings, Brain, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const domains = [
  {
    id: 'Software',
    title: 'Software Development',
    description: 'Optimize sprints, allocate engineers based on skills, and predict development delay risk using Random Forest classifiers.',
    icon: <Code2 size={24} />,
    color: 'cyan',
    glow: 'rgba(6, 182, 212, 0.15)',
    border: 'border-neon-cyan/20 group-hover:border-neon-cyan/60'
  },
  {
    id: 'Business',
    title: 'Business Strategy',
    description: 'Analyze budget constraints, operational velocity, and scale resources dynamically to model expansion initiatives.',
    icon: <Landmark size={24} />,
    color: 'purple',
    glow: 'rgba(168, 85, 247, 0.15)',
    border: 'border-neon-purple/20 group-hover:border-neon-purple/60'
  },
  {
    id: 'Hardware',
    title: 'Hardware & Systems',
    description: 'Track production timelines, manufacturing dependencies, and hardware development pipeline constraints.',
    icon: <Settings size={24} />,
    color: 'magenta',
    glow: 'rgba(236, 72, 153, 0.15)',
    border: 'border-neon-magenta/20 group-hover:border-neon-magenta/60'
  }
];

const DomainSelectionPage = () => {
  const { selectDomain, user } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSelect = (domainId) => {
    selectDomain(domainId);
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-bg-deep cyber-grid px-6 relative select-none">
      {/* Abstract glows */}
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-neon-purple/5 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-neon-cyan/5 blur-[100px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-xl mb-12 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-4">
          <Activity size={12} className="text-neon-purple animate-pulse" />
          Intelligence Matrix Connected
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-4">
          Welcome, <span className="custom-gradient-text">{user?.username ? user.username.split('@')[0] : 'Operator'}</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Select an active analysis model domain below. The system will adjust algorithms, data matrices, and predictive parameters accordingly.
        </p>
      </motion.div>

      {/* Domain Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10">
        {domains.map((d, index) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => handleSelect(d.id)}
            className="group"
          >
            <div className={`h-full flex flex-col justify-between glass-panel p-6 rounded-2xl border transition-all duration-500 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${d.border}`}
                 style={{
                   '--glow-color': d.glow
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 10px 30px var(--glow-color)`}
                 onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white border transition-colors ${
                  d.color === 'cyan' 
                    ? 'bg-neon-cyan/10 border-neon-cyan/20 group-hover:bg-neon-cyan/20 group-hover:border-neon-cyan' 
                    : d.color === 'purple' 
                      ? 'bg-neon-purple/10 border-neon-purple/20 group-hover:bg-neon-purple/20 group-hover:border-neon-purple' 
                      : 'bg-neon-magenta/10 border-neon-magenta/20 group-hover:bg-neon-magenta/20 group-hover:border-neon-magenta'
                }`}>
                  {d.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-glow transition-all">{d.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{d.description}</p>
              </div>

              <div className={`mt-8 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                d.color === 'cyan' 
                  ? 'text-neon-cyan group-hover:text-neon-cyan/80' 
                  : d.color === 'purple' 
                    ? 'text-neon-purple group-hover:text-neon-purple/80' 
                    : 'text-neon-magenta group-hover:text-neon-magenta/80'
              }`}>
                Initialize Model
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-6 font-mono text-[10px] text-slate-600 uppercase tracking-widest z-10">
        Secure Handshake Confirmed
      </div>
    </div>
  );
};

export default DomainSelectionPage;

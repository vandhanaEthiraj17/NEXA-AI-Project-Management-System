import React, { useState } from 'react';
import { Clock, User, AlertCircle, X } from 'lucide-react';

const TaskCard = ({ task, onStatusChange }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getRiskColor = (score) => {
    if (score > 70) return '#de350b'; // High Risk
    if (score > 40) return '#ffab00'; // Medium Risk
    return '#00875a'; // Low Risk
  };

  const riskColor = getRiskColor(task.risk_score);

  return (
    <>
    <div className="card task-card" style={{ 
      padding: '1rem', 
      marginBottom: '0.75rem', 
      borderLeft: `4px solid ${riskColor}`,
      cursor: 'grab' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#172b4d' }}>{task.title}</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem', 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          color: riskColor,
          textTransform: 'uppercase',
          background: `${riskColor}15`,
          padding: '2px 6px',
          borderRadius: '3px'
        }}>
          <AlertCircle size={10} />
          {task.risk_score > 70 ? 'High Risk' : task.risk_score > 40 ? 'Med Risk' : 'Low Risk'}
        </div>
      </div>
      
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <p style={{ 
          fontSize: '0.85rem', 
          color: '#5e6c84', 
          margin: 0, 
          lineBreak: 'anywhere',
          display: '-webkit-box', 
          WebkitLineClamp: 3, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden'
        }}>
          {task.description || 'No description provided.'}
        </p>
        {task.description && task.description.length > 80 && (
          <span 
            onClick={() => setShowDetails(true)} 
            style={{ fontSize: '0.75rem', color: '#0052cc', cursor: 'pointer', fontWeight: 600, marginTop: '0.25rem', display: 'inline-block' }}
          >
            Show more
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5e6c84' }}>
          <User size={14} />
          <span>{task.assignee || 'Unassigned'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5e6c84' }}>
          <Clock size={14} />
          <span>{task.deadline_days}d</span>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {task.status !== 'To Do' && (
          <button onClick={() => onStatusChange(task.id, 'To Do')} style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '3px', cursor: 'pointer' }}>To Do</button>
        )}
        {task.status !== 'In Progress' && (
          <button onClick={() => onStatusChange(task.id, 'In Progress')} style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '3px', cursor: 'pointer' }}>In Progress</button>
        )}
        {task.status !== 'Done' && (
          <button onClick={() => onStatusChange(task.id, 'Done')} style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f4f5f7', border: '1px solid #dfe1e6', borderRadius: '3px', cursor: 'pointer' }}>Done</button>
        )}
      </div>
    </div>

    {/* Detailed Task Modal */}
    {showDetails && (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172b4d', margin: 0 }}>{task.title}</h2>
            <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e6c84' }}><X size={20} /></button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5e6c84', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Description</h4>
            <div style={{ fontSize: '0.9rem', color: '#172b4d', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: '#f4f5f7', padding: '1rem', borderRadius: '8px' }}>
              {task.description}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#5e6c84', marginBottom: '1rem', textTransform: 'uppercase' }}>Team Progress & Allocation</h4>
            
            {/* Derived/Mocked Team Progress Data */}
            {[
              { name: task.assignee && task.assignee !== 'Unassigned' ? task.assignee : 'Alex Mercer', role: 'Lead Developer', progress: 75, color: '#0052cc' },
              { name: 'Sarah Chen', role: 'UI/UX Designer', progress: 100, color: '#00875a' },
              { name: 'Marcus Johnson', role: 'Backend Engineer', progress: 40, color: '#ffab00' }
            ].map((member, i) => (
              <div key={i} style={{ marginBottom: '0.75rem', padding: '1rem', border: '1px solid #dfe1e6', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${member.color}20`, color: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#172b4d' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#5e6c84' }}>{member.role}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: member.color }}>{member.progress}%</div>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#ebecf0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                  <div style={{ width: `${member.progress}%`, height: '100%', background: member.color, borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    )}
    </>
  );
};

export default TaskCard;

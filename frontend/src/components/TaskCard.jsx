import React from 'react';
import { Clock, User, AlertCircle } from 'lucide-react';

const TaskCard = ({ task, onStatusChange }) => {
  const getRiskColor = (score) => {
    if (score > 70) return '#de350b'; // High Risk
    if (score > 40) return '#ffab00'; // Medium Risk
    return '#00875a'; // Low Risk
  };

  const riskColor = getRiskColor(task.risk_score);

  return (
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
      
      <p style={{ fontSize: '0.85rem', color: '#5e6c84', marginBottom: '1rem', lineBreak: 'anywhere' }}>
        {task.description}
      </p>

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
  );
};

export default TaskCard;

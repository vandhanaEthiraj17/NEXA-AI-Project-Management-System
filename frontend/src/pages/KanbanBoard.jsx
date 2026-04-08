import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { Plus, Layout, ListTodo, Play, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';

const KanbanBoard = () => {
  const { 
    tasks, sprints, pmStats, fetchTasks, fetchSprints, fetchPmStats, 
    updateTaskStatus, createSprint 
  } = useContext(DataContext);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [newSprintName, setNewSprintName] = useState('');

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
    { id: 'To Do', icon: <ListTodo size={18} />, color: '#5e6c84' },
    { id: 'In Progress', icon: <Play size={18} />, color: '#0052cc' },
    { id: 'Done', icon: <CheckCircle size={18} />, color: '#00875a' }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0.5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">AI Project Management</h1>
          <p className="page-subtitle">Real-time risk tracking and agile task management powered by Machine Learning.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="form-control" 
            style={{ width: '200px' }}
            value={selectedSprintId || ''}
            onChange={(e) => setSelectedSprintId(e.target.value)}
          >
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      {pmStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0052cc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600 }}>Total Tasks</span>
              <BarChart2 size={18} color="#0052cc" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', fontWeight: 700 }}>{pmStats.total}</h2>
          </div>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #de350b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600 }}>High Risk</span>
              <AlertTriangle size={18} color="#de350b" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', fontWeight: 700 }}>{pmStats.highRisk}</h2>
          </div>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #ffab00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600 }}>In Progress</span>
              <Play size={18} color="#ffab00" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', fontWeight: 700 }}>{pmStats.inProgress}</h2>
          </div>
          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #00875a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#5e6c84', fontWeight: 600 }}>Done</span>
              <CheckCircle size={18} color="#00875a" />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem', fontWeight: 700 }}>{pmStats.done}</h2>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1.5rem',
        minHeight: '60vh'
      }}>
        {columns.map(col => (
          <div key={col.id} style={{ 
            background: '#ebecf0', 
            borderRadius: '6px', 
            padding: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.5rem', 
              marginBottom: '0.25rem',
              color: col.color,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05rem'
            }}>
              {col.icon}
              {col.id}
              <span style={{ 
                marginLeft: 'auto', 
                background: '#dfe1e6', 
                color: '#172b4d', 
                padding: '2px 8px', 
                borderRadius: '10px',
                fontSize: '0.75rem' 
              }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 400px)'
            }}>
              {tasks.filter(t => t.status === col.id).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={handleStatusChange}
                />
              ))}
              
              {tasks.filter(t => t.status === col.id).length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  border: '2px dashed #dfe1e6', 
                  borderRadius: '6px',
                  color: '#97a0af',
                  fontSize: '0.85rem'
                }}>
                  No tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <TaskFormModal 
          onClose={() => setShowTaskModal(false)} 
          sprintId={selectedSprintId}
        />
      )}

      {sprints.length === 0 && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(255,255,255,0.9)', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 
        }}>
          <Layout size={64} color="#0052cc" />
          <h2 style={{ marginTop: '1.5rem' }}>Create your first Sprint to get started</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '300px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Sprint 1"
              value={newSprintName}
              onChange={(e) => setNewSprintName(e.target.value)}
            />
            <button className="btn-primary" onClick={() => createSprint(newSprintName)}>Create</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;

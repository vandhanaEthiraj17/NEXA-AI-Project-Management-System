import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { X, PlusCircle } from 'lucide-react';

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
    <div style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', animation: 'scaleIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#172b4d' }}>Create New Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e6c84' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Task Title</label>
            <input 
              type="text" 
              className="form-control" 
              required 
              placeholder="e.g. Implement Auth Logic"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="form-control" 
              rows="3" 
              style={{ padding: '0.6rem 1rem', fontFamily: 'inherit' }}
              placeholder="Provide context for the task..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Assignee</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Name"
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Complexity (1-10)</label>
              <input 
                type="number" 
                min="1" max="10"
                className="form-control"
                value={formData.complexity}
                onChange={(e) => setFormData({...formData, complexity: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Deadline (Days from now)</label>
            <input 
              type="number" 
              className="form-control"
              value={formData.deadline_days}
              onChange={(e) => setFormData({...formData, deadline_days: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
              <PlusCircle size={18} />
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;

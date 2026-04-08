import React, { useState } from 'react';

const InputForm = ({ onAnalyze, isLoading }) => {
  const [formData, setFormData] = useState({
    tasks: 20,
    teamSize: 3,
    deadline: 14,
    complexity: 'medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(formData);
  };

  return (
    <div className="glass-card">
      <h2 className="section-title">Project Parameters</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tasks">Number of Tasks</label>
          <input 
            type="number" 
            id="tasks" 
            name="tasks" 
            min="1" 
            value={formData.tasks} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 20"
          />
        </div>

        <div className="form-group">
          <label htmlFor="teamSize">Team Size (Personnel)</label>
          <input 
            type="number" 
            id="teamSize" 
            name="teamSize" 
            min="1" 
            value={formData.teamSize} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Project Deadline (Days)</label>
          <input 
            type="number" 
            id="deadline" 
            name="deadline" 
            min="1" 
            value={formData.deadline} 
            onChange={handleChange} 
            required 
            placeholder="e.g. 14"
          />
        </div>

        <div className="form-group">
          <label htmlFor="complexity">Task Complexity</label>
          <select 
            id="complexity" 
            name="complexity" 
            value={formData.complexity} 
            onChange={handleChange}
          >
            <option value="low">Low (Standard tasks)</option>
            <option value="medium">Medium (Moderate dependencies)</option>
            <option value="high">High (Complex research/impl)</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading}
          style={{marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'}}
        >
          {isLoading ? (
            <>
              <div className="loader" style={{width: '18px', height: '18px', borderWidth: '2px'}}></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Analyze Project</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;

import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, FileText, Layers, ChevronRight, Search } from 'lucide-react';

const NewAnalysisPage = () => {
  const { domain } = useContext(AppContext);
  const { analyzeData, isAnalyzing, error, tasks, sprints, fetchSprints, fetchTasks } = useContext(DataContext);
  const navigate = useNavigate();

  const [showSprintModal, setShowSprintModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initial load
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleSelectTask = (task) => {
    setFormData({
      ...formData,
      title: task.title || '',
      description: task.description || '',
      team_size: 5, // Default for PM logic
      deadline: task.deadline_days || 30,
      resources: task.complexity || 5, // Mapping complexity to resource level
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
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', gridColumn: 'span 2' }}>
            <div className="form-group">
              <label>Team Size</label>
              <input type="number" name="team_size" value={formData.team_size} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Deadline (Days)</label>
              <input type="number" name="deadline" value={formData.deadline} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Resource Level (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="form-control" />
            </div>
          </div>
        );
      case 'Business':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', gridColumn: 'span 2' }}>
            <div className="form-group">
              <label>Budget ($)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Market Demand (1-10)</label>
              <input type="number" name="demand" min="1" max="10" value={formData.demand} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Available Resources (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="form-control" />
            </div>
          </div>
        );
      case 'Hardware':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', width: '100%', gridColumn: 'span 2' }}>
            <div className="form-group">
              <label>Number of Machines</label>
              <input type="number" name="machines" value={formData.machines} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Manpower Count</label>
              <input type="number" name="manpower" value={formData.manpower} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Production Time (Days)</label>
              <input type="number" name="production_time" value={formData.production_time} onChange={handleChange} className="form-control" />
            </div>
          </div>
        );
      default:
        return <p>Please select a domain first.</p>;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{domain} Intelligence Center</h1>
        <p className="page-subtitle">Configure parameters to derive AI-driven decision intelligence for your project.</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card">
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffebe6', color: '#bf2600', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #ffbdad' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="analysis-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Main Info Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Project Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Q3 Growth Strategy" />
                </div>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Detailed Project Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="Provide deep context for AI to derive complexity and risks..."
                    className="form-control"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#5e6c84', marginTop: '0.4rem' }}>AI will automatically determine Complexity based on your description.</p>
                </div>

                {renderFormFields()}
              </div>

              {/* Reference Files Section */}
              <div style={{ borderTop: '1px solid #f4f5f7', paddingTop: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#44546f' }}>Reference Files</label>
                <div style={{ display: 'grid', gridTemplateColumns: files.length > 0 ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => document.getElementById('file-upload').click()}
                    style={{ border: '2px dashed #dfe1e6', padding: '1.5rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: '#f8f9fa' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#0052cc'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#dfe1e6'}
                  >
                    <Upload size={24} style={{ color: '#0052cc', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', color: '#172b4d', fontWeight: 500 }}>Drop files here</div>
                    <div style={{ fontSize: '0.75rem', color: '#5e6c84' }}>PDF, CSV, Excel, Images</div>
                    <input id="file-upload" type="file" multiple hidden onChange={handleFileChange} />
                  </div>

                  {files.length > 0 && (
                    <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid #dfe1e6' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#44546f', marginBottom: '0.75rem' }}>Uploaded ({files.length})</p>
                      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                        {files.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#5e6c84', marginBottom: '0.4rem' }}>
                            <FileText size={12} /> {f.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
              <button type="submit" className="btn-primary" disabled={isAnalyzing} style={{ width: 'auto', padding: '1rem 4rem', borderRadius: '8px', fontSize: '1rem' }}>
                {isAnalyzing ? 'Processing AI Models...' : 'Run Intelligence Analysis'}
              </button>
            </div>
          </form>
        </div>

        {/* Analyze from Sprint Option */}
        <div 
          className="card" 
          style={{ 
            marginTop: '2rem', 
            background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)', 
            border: '1px solid #cce4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0052cc', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#172b4d' }}>Analyze from Active Sprint</h3>
              <p style={{ fontSize: '0.85rem', color: '#5e6c84' }}>Import existing project data from your Kanban board for instant AI evaluation.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSprintModal(true)}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}
          >
            Browse Sprints <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Sprint Selection Modal */}
      {showSprintModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Select Project from Sprint</h2>
              <button onClick={() => setShowSprintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e6c84' }}>Close</button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              {tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? (
                tasks
                  .filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => handleSelectTask(task)}
                      style={{ 
                        padding: '1rem', 
                        border: '1px solid #dfe1e6', 
                        borderRadius: '8px', 
                        marginBottom: '0.75rem', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.borderColor = '#0052cc'}
                      onMouseOut={e => e.currentTarget.style.borderColor = '#dfe1e6'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#172b4d' }}>{task.title}</span>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#f4f5f7', color: '#5e6c84' }}>{task.status}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#5e6c84', margin: 0 }}>Complexity: {task.complexity} | Deadline: {task.deadline_days} days</p>
                    </div>
                  ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#5e6c84' }}>
                  No tasks found. Try a different search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAnalysisPage;


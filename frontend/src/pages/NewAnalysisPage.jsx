import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, FileText, Brain, CheckCircle, Database } from 'lucide-react';

const NewAnalysisPage = () => {
  const { domain } = useContext(AppContext);
  const { analyzeData, isAnalyzing, error } = useContext(DataContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' or 'train'
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
  const [trainingFile, setTrainingFile] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState(null); // { status: 'success', accuracy: 92 }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const handleTrainingFileChange = (e) => {
    setTrainingFile(e.target.files[0]);
  };

  const handleTrainModel = async () => {
    if (!trainingFile) return;
    setTrainingStatus({ status: 'loading' });
    
    const formData = new FormData();
    formData.append('file', trainingFile);
    
    try {
      const response = await fetch('http://localhost:5000/api/ml/train', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setTrainingStatus(result);
    } catch (err) {
      setTrainingStatus({ status: 'error', message: 'Connection failed' });
    }
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
           <>
            <div className="form-group">
              <label>Team Size</label>
              <input type="number" name="team_size" value={formData.team_size} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Deadline (Days)</label>
              <input type="number" name="deadline" value={formData.deadline} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Resource Level (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="form-control" />
            </div>
          </>
        );
      case 'Business':
        return (
          <>
            <div className="form-group">
              <label>Budget ($)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Market Demand (1-10)</label>
              <input type="number" name="demand" min="1" max="10" value={formData.demand} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Available Resources (1-10)</label>
              <input type="number" name="resources" min="1" max="10" value={formData.resources} onChange={handleChange} className="form-control" />
            </div>
          </>
        );
      case 'Hardware':
        return (
          <>
            <div className="form-group">
              <label>Number of Machines</label>
              <input type="number" name="machines" value={formData.machines} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Manpower Count</label>
              <input type="number" name="manpower" value={formData.manpower} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Production Time (Days)</label>
              <input type="number" name="production_time" value={formData.production_time} onChange={handleChange} className="form-control" />
            </div>
          </>
        );
      default:
        return <p>Please select a domain first.</p>;
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{domain} Intelligence Center</h1>
        <p className="page-subtitle">Configure parameters or train the AI engine with your historical data.</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #dfe1e6' }}>
          <button 
            onClick={() => setActiveTab('analysis')}
            style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'analysis' ? '3px solid #0052cc' : '3px solid transparent', color: activeTab === 'analysis' ? '#0052cc' : '#5e6c84', fontWeight: 600, cursor: 'pointer' }}
          >
            New Analysis
          </button>
          <button 
            onClick={() => setActiveTab('train')}
            style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'train' ? '3px solid #0052cc' : '3px solid transparent', color: activeTab === 'train' ? '#0052cc' : '#5e6c84', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Brain size={16} /> AI Engine
          </button>
        </div>
        
        {activeTab === 'analysis' ? (
          <div className="card">
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffebe6', color: '#bf2600', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #ffbdad' }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="analysis-form">
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                  <div className="form-group">
                    <label>Project Title</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required placeholder="e.g. Q3 Growth Strategy" />
                  </div>
                  
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label>Detailed Project Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder="Provide deep context for AI to derive complexity and risks..."
                      style={{ width: '100%', height: '120px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #dfe1e6', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#5e6c84', marginTop: '0.4rem' }}>AI will automatically determine Complexity based on your description.</p>
                  </div>

                  <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.5rem' }}>
                    {renderFormFields()}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid #f4f5f7', paddingLeft: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: '#44546f' }}>Reference Files</label>
                  <div 
                    onClick={() => document.getElementById('file-upload').click()}
                    style={{ border: '2px dashed #dfe1e6', padding: '2rem 1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: '#f8f9fa' }}
                    onMouseOver={e => e.currentTarget.style.borderColor = '#0052cc'}
                    onMouseOut={e => e.currentTarget.style.borderColor = '#dfe1e6'}
                  >
                    <Upload size={24} style={{ color: '#0052cc', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', color: '#172b4d', fontWeight: 500 }}>Drop files here</div>
                    <div style={{ fontSize: '0.75rem', color: '#5e6c84' }}>PDF, CSV, Excel, Images</div>
                    <input id="file-upload" type="file" multiple hidden onChange={handleFileChange} />
                  </div>

                  {files.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#44546f', marginBottom: '0.5rem' }}>Uploaded ({files.length})</p>
                      {files.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#5e6c84', marginBottom: '0.25rem' }}>
                          <FileText size={12} /> {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="btn-primary" disabled={isAnalyzing} style={{ width: 'auto', padding: '0.75rem 3rem' }}>
                  {isAnalyzing ? 'Processing AI Models...' : 'Run Intelligence Analysis'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Database size={48} style={{ color: '#0052cc', marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#172b4d', marginBottom: '0.75rem' }}>Train AI with Real Data</h2>
            <p style={{ color: '#5e6c84', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Upload your historical project datasets (CSV) to transition from synthetic models to data-driven project intelligence.
            </p>

            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div 
                onClick={() => document.getElementById('train-upload').click()}
                style={{ border: '2px dashed #dfe1e6', padding: '2.5rem', borderRadius: '12px', cursor: 'pointer', background: trainingFile ? '#f4f5f7' : '#fff', transition: 'all 0.2s' }}
              >
                {trainingFile ? (
                  <>
                    <FileText size={32} style={{ color: '#0052cc', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600 }}>{trainingFile.name}</div>
                    <div onClick={(e) => { e.stopPropagation(); setTrainingFile(null); }} style={{ color: '#de350b', fontSize: '0.8rem', marginTop: '0.5rem', cursor: 'pointer' }}>Remove</div>
                  </>
                ) : (
                  <>
                    <Upload size={32} style={{ color: '#888', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 500, color: '#172b4d' }}>Click to upload dataset</div>
                    <div style={{ fontSize: '0.8rem', color: '#5e6c84' }}>All supported CSV files</div>
                  </>
                )}
                <input id="train-upload" type="file" accept=".csv" hidden onChange={handleTrainingFileChange} />
              </div>

              <button 
                onClick={handleTrainModel}
                disabled={!trainingFile || trainingStatus?.status === 'loading'}
                style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', background: '#0052cc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: trainingFile ? 'pointer' : 'not-allowed', opacity: trainingFile ? 1 : 0.6 }}
              >
                {trainingStatus?.status === 'loading' ? 'Training Model...' : 'Trigger Model Training'}
              </button>

              {trainingStatus?.status === 'success' && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e3fcef', borderRadius: '6px', color: '#006644', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <CheckCircle size={18} /> Model Trained Successfully
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Accuracy Score: <strong>{trainingStatus.accuracy}%</strong><br />
                    Datasets Processed: <strong>{trainingStatus.samples} rows</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAnalysisPage;


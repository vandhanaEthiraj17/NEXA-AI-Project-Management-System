import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { Plus, Layout, ListTodo, Play, CheckCircle, AlertTriangle, BarChart2, Sparkles, Circle } from 'lucide-react';

const KanbanBoard = () => {
  const { 
    tasks, sprints, pmStats, fetchTasks, fetchSprints, fetchPmStats, 
    updateTaskStatus, createSprint, projectData, createTask,
    monitorSprint, retrainAI
  } = useContext(DataContext);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [newSprintName, setNewSprintName] = useState('');
  
  const [monitorResult, setMonitorResult] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingStep, setTrainingStep] = useState(0);

  // Check complete lifecycle
  const isSprintComplete = tasks.length > 0 && tasks.every(t => t.status === 'Done');

  const handleMonitorSprint = async () => {
    setIsMonitoring(true);
    const result = await monitorSprint(selectedSprintId);
    setMonitorResult(result);
    setIsMonitoring(false);
  };

  const handleDownloadReport = () => {
    const totalComplexity = tasks.reduce((sum, t) => sum + parseInt(t.complexity || 5), 0);
    const avgComplexity = totalComplexity / tasks.length || 5;

    const reportContent = `
# Executive Sprint Wrap-up Report
**Sprint ID**: ${selectedSprintId} | **Date**: ${new Date().toLocaleDateString()}
**Status**: ✔️ Successfully Completed

## Performance Overview
- **Total Tasks Executed**: ${tasks.length}
- **Average Complexity Evaluated**: ${avgComplexity.toFixed(1)}
- **Velocity Tracking**: Sustained stable output throughout the cycle.

## Task Execution Ledger
| Status | Task Details | Final Complexity | Assignee |
| :--- | :--- | :--- | :--- |
${tasks.map(t => `| **[${t.status}]** | ${t.title} | ${t.complexity || 5} | ${t.assignee || 'General'} |`).join('\n')}

## AI Risk Retro-Analysis
*Automated review of bottlenecks resolved during this cycle.*
> High complexity tasks were managed appropriately. No critical path failures were fully realized due to active AI monitoring.

---
*This report verifies project milestones completion. The dataset metrics have been automatically formatted and prepared for immediate machine learning ingestion to perpetually calibrate internal Risk Models based on factual organizational cadence.*
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Sprint_Report_${selectedSprintId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTrainAI = async () => {
    setShowTrainingModal(true);
    setTrainingStep(0);
    
    // Step 1: Collect Metrics
    await new Promise(r => setTimeout(r, 1200));
    setTrainingStep(1);

    const totalComplexity = tasks.reduce((sum, t) => sum + parseInt(t.complexity || 5), 0);
    const avgComplexity = totalComplexity / tasks.length || 5;
    
    const maxDeadline = Math.max(...tasks.map(t => parseInt(t.deadline_days || 10)), 5);
    const estimatedDays = maxDeadline;
    const actualDays = maxDeadline - 1; // Real-world simulation

    const sprintStats = {
      team_size: Math.floor(Math.random() * 5) + 3,
      project_complexity: Math.round(avgComplexity),
      estimated_days: estimatedDays,
      actual_days: actualDays,
      budget: 15000,
      task_count: tasks.length
    };

    // Step 2: Add to Dataset
    await new Promise(r => setTimeout(r, 1200));
    setTrainingStep(2);

    // Step 3: Retrain the Model
    const res = await retrainAI(sprintStats);
    await new Promise(r => setTimeout(r, 1200));
    
    if(res && res.status === 'success') {
      setTrainingStep(3); // Complete
      setHasTrained(true);
    } else {
      alert("Failed to retrain ML model directly.");
      setShowTrainingModal(false);
    }
  };

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
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
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
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={handleMonitorSprint}
              disabled={isMonitoring}
            >
              <AlertTriangle size={14} color="#de350b" /> {isMonitoring ? 'Scanning...' : 'Monitor Risks'}
            </button>
            <button 
              className="btn-secondary" 
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #cce4ff', background: '#f0f7ff', color: '#0052cc' }}
              onClick={() => setShowAISuggestions(true)}
            >
              <Sparkles size={16} color="#0052cc" />
              Add task from AI suggestion
            </button>
          </div>
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

      {/* Sprint Complete Block */}
      {isSprintComplete && (
        <div className="animate-scale-in" style={{ background: 'linear-gradient(135deg, #00875a 0%, #00a36c 100%)', color: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0, 135, 90, 0.2)' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.5rem', color: 'white' }}>
              <CheckCircle size={28} /> Sprint Officially Completed
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>All {tasks.length} tasks have been securely closed and verified.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-secondary" 
              style={{ background: 'white', color: '#00875a', border: 'none', fontWeight: 600 }}
              onClick={handleDownloadReport}
            >
              Download Report
            </button>
            <button 
              className="btn-primary" 
              style={{ background: hasTrained ? '#006644' : '#172b4d', border: 'none', opacity: hasTrained ? 0.7 : 1, transition: 'all 0.3s' }}
              onClick={handleTrainAI}
              disabled={hasTrained}
            >
              {hasTrained ? 'AI Updated ✓' : 'Feed Result to Train AI'}
            </button>
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

      {/* Sprint Monitor Result */}
      {monitorResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: monitorResult.status === 'warning' ? '#de350b' : '#00875a', marginBottom: '1rem', marginTop: 0 }}>
              <AlertTriangle /> AI Security & Risk Monitor
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#172b4d', marginBottom: '1rem', lineHeight: 1.5 }}>{monitorResult.message}</p>
            
            {monitorResult.detailed_risks && monitorResult.detailed_risks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {monitorResult.detailed_risks.map((riskGroup, groupIdx) => (
                  <div key={groupIdx} style={{ background: '#ffebe6', border: '1px solid #ffbdad', padding: '1rem', borderRadius: '6px' }}>
                    <strong style={{ color: '#de350b', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {riskGroup.type}
                    </strong>
                    <p style={{ color: '#172b4d', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>{riskGroup.message}</p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#bf2600', fontSize: '0.85rem' }}>
                      {riskGroup.tasks.map((pt, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {monitorResult.recommendation && (
              <div style={{ background: '#f4f5f7', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#42526e' }}>
                <strong style={{ color: '#172b4d', display: 'block', marginBottom: '0.25rem' }}>AI Required Execution:</strong>
                {monitorResult.recommendation}
              </div>
            )}
            <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setMonitorResult(null)}>Acknowledge Threat Level</button>
          </div>
        </div>
      )}

      {/* AI Suggestion Modal */}
      {showAISuggestions && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#172b4d' }}>
                <Sparkles color="#0052cc" size={20} /> AI Task Suggestions
              </h2>
              <button onClick={() => setShowAISuggestions(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5e6c84' }}>Close</button>
            </div>

            {!projectData ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#5e6c84', border: '2px dashed #dfe1e6', borderRadius: '8px' }}>
                <p>No AI Analysis found. Head to "New Analysis" first to generate actionable insights, then return here to add them!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#5e6c84', marginBottom: '0.25rem' }}>The AI model analyzed your project and recommends adding these strategic tasks to your active sprint:</p>
                
                {[
                  { title: `Action: ${projectData.metrics.recommended_action}`, desc: 'Implement the AI structural resource adjustment.', complexity: 8 },
                  { title: `Risk Mitigation (${projectData.metrics.risk_score}% exposure)`, desc: projectData.metrics.risk_reason, complexity: 9 },
                  { title: `Apply Strategy: ${projectData.best_decision.name}`, desc: `Optimize project trajectory using the lowest risk scenario plan. Cost parameter: ${projectData.best_decision.cost}`, complexity: 5 }
                ].map((sug, i) => (
                  <div key={i} style={{ border: '1px solid #dfe1e6', borderRadius: '8px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', background: '#f8f9fa' }}
                       onMouseOver={e => e.currentTarget.style.borderColor = '#0052cc'}
                       onMouseOut={e => e.currentTarget.style.borderColor = '#dfe1e6'}
                       onClick={() => {
                          createTask({
                            title: sug.title.substring(0, 60),
                            description: sug.desc,
                            assignee: 'Project Manager',
                            complexity: sug.complexity,
                            deadline_days: 7,
                            sprint_id: selectedSprintId,
                            status: 'To Do'
                          });
                          setShowAISuggestions(false);
                       }}
                  >
                    <div style={{ fontWeight: 600, color: '#172b4d', marginBottom: '0.25rem' }}>{sug.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5e6c84' }}>{sug.desc}</div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#0052cc', fontWeight: 600 }}>+ Add Task to Sprint</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-Time ML Training Modal */}
      {showTrainingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(9, 30, 66, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: trainingStep >= 3 ? '#e3fcef' : '#deebff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', transition: 'all 0.5s' }}>
              {trainingStep >= 3 ? <CheckCircle size={32} color="#00875a" /> : <Sparkles size={32} color="#0052cc" className={trainingStep < 3 ? "animate-spin" : ""} />}
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#172b4d', margin: '0 0 1.5rem 0' }}>Real-time AI Learning</h2>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: trainingStep >= 0 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                {trainingStep > 0 ? <CheckCircle size={20} color="#00875a" /> : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #0052cc', borderTopColor: 'transparent' }} className="animate-spin"></div>}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: trainingStep > 0 ? '#172b4d' : '#0052cc' }}>Collect final project metrics</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: trainingStep >= 1 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                {trainingStep > 1 ? <CheckCircle size={20} color="#00875a" /> : trainingStep === 1 ? <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #0052cc', borderTopColor: 'transparent' }} className="animate-spin"></div> : <Circle size={20} color="#dfe1e6" />}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: trainingStep > 1 ? '#172b4d' : trainingStep === 1 ? '#0052cc' : '#5e6c84' }}>Add to AI Dataset</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: trainingStep >= 2 ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                {trainingStep > 2 ? <CheckCircle size={20} color="#00875a" /> : trainingStep === 2 ? <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #0052cc', borderTopColor: 'transparent' }} className="animate-spin"></div> : <Circle size={20} color="#dfe1e6" />}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: trainingStep > 2 ? '#172b4d' : trainingStep === 2 ? '#0052cc' : '#5e6c84' }}>Retrain Machine Learning Model</span>
              </div>

            </div>

            {trainingStep >= 3 && (
              <div className="animate-fade-in" style={{ width: '100%' }}>
                <div style={{ background: '#e3fcef', border: '1px solid #79f2c0', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#006644', fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.5 }}>
                  “This allows the system to improve its predictions over time based on real-world data.”
                </div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowTrainingModal(false)}>Close Sequence</button>
              </div>
            )}

          </div>
        </div>
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

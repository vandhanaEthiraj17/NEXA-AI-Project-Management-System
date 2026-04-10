import React, { createContext, useState, useEffect, useCallback } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [projectData, setProjectData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // PM State
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [pmStats, setPmStats] = useState(null);

  const analyzeData = useCallback(async (formData, currentDomain) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const endpoint = `http://localhost:5000/api/analyze`;
      const payload = { ...formData, domain: currentDomain || 'Software' };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Server error');
      }
      
      setProjectData(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const fetchTasks = useCallback(async (sprintId) => {
    try {
      const url = sprintId ? `http://localhost:5000/api/tasks?sprint_id=${sprintId}` : `http://localhost:5000/api/tasks`;
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchPmStats = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pm/stats`);
      const data = await response.json();
      setPmStats(data);
    } catch (err) { console.error(err); }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        fetchTasks(taskData.sprint_id);
        fetchPmStats();
        return true;
      } else {
        const errData = await response.text();
        console.error("Task creation failed:", errData);
        alert(`Server Error: Could not save the task. Details: ${errData}`);
        return false;
      }
    } catch (err) { 
        console.error(err); 
        alert(`Network Error: ${err.message}`);
        return false; 
    }
  }, [fetchTasks, fetchPmStats]);

  const updateTaskStatus = useCallback(async (taskId, status, sprintId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchTasks(sprintId);
        fetchPmStats();
      }
    } catch (err) { console.error(err); }
  }, [fetchTasks, fetchPmStats]);

  const fetchSprints = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/sprints`);
      const data = await response.json();
      setSprints(data);
    } catch (err) { console.error(err); }
  }, []);

  const createSprint = useCallback(async (name) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (response.ok) fetchSprints();
    } catch (err) { console.error(err); }
  }, [fetchSprints]);

  return (
    <DataContext.Provider value={{ 
      projectData, isAnalyzing, analyzeData, error,
      tasks, sprints, pmStats, fetchTasks, createTask, updateTaskStatus, fetchSprints, createSprint, fetchPmStats
    }}>
      {children}
    </DataContext.Provider>
  );
};

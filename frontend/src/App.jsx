import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import NewAnalysisPage from './pages/NewAnalysisPage';
import SimulationPanel from './pages/SimulationPanel';
import DecisionInsightsPage from './pages/DecisionInsightsPage';
import AuthPage from './pages/AuthPage';
import DomainSelectionPage from './pages/DomainSelectionPage';
import KanbanBoard from './pages/KanbanBoard';
import ProfilePage from './pages/ProfilePage';
import { AppContext } from './context/AppContext';
import { SettingsProvider } from './context/SettingsContext';
import SettingsPage from './pages/SettingsPage';
import ClientPortal from './pages/ClientPortal';
import ResourceAllocation from './pages/ResourceAllocation';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const AppLayout = () => {
  const { domain, user } = useContext(AppContext);
  const location = useLocation();
  
  // Clients don't need a domain for the portal, but Managers do for the analysis dashboards
  const isClientPortal = location.pathname.includes('client-portal');
  
  if (!domain && !isClientPortal && user?.role === 'manager') {
    return <Navigate to="/select-domain" replace />;
  }
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="kanban" element={<KanbanBoard />} />
            <Route path="analysis" element={<NewAnalysisPage />} />
            <Route path="simulation" element={<SimulationPanel />} />
            <Route path="insights" element={<DecisionInsightsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="resource-allocation" element={<ResourceAllocation />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="client-portal" element={<ClientPortal />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { user } = useContext(AppContext);

  return (
    <SettingsProvider>
      <Routes>
        <Route path="/login" element={!user ? <AuthPage /> : (user.role === 'client' ? <Navigate to="/app/client-portal" /> : <Navigate to="/select-domain" />)} />
        <Route path="/select-domain" element={user ? <DomainSelectionPage /> : <Navigate to="/login" />} />
        <Route path="/app/*" element={user ? <AppLayout /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? (user.role === 'client' ? "/app/client-portal" : "/select-domain") : "/login"} replace />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;

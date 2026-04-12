import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const AppLayout = () => {
  const { domain } = useContext(AppContext);
  if (!domain) return <Navigate to="/select-domain" replace />;
  
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
        <Route path="/login" element={!user ? <AuthPage /> : <Navigate to="/select-domain" />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        <Route path="/select-domain" element={user ? <DomainSelectionPage /> : <Navigate to="/login" />} />
        <Route path="/app/*" element={user ? <AppLayout /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/select-domain" : "/login"} replace />} />
      </Routes>
    </SettingsProvider>
  );
}

export default App;

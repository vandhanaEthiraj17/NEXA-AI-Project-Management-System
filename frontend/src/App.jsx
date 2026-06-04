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
import AICopilot from './components/AICopilot';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedRouteWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
};

const AppLayout = () => {
  const { domain, user } = useContext(AppContext);
  const location = useLocation();
  
  // Clients don't need a domain for the portal, but Managers do for the analysis dashboards
  const isClientPortal = location.pathname.includes('client-portal');
  
  if (!domain && !isClientPortal && user?.role === 'manager') {
    return <Navigate to="/select-domain" replace />;
  }
  
  // Hide Copilot panel on specific routes if necessary, but keep it on as requested
  const showCopilot = user?.role === 'manager';
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-deep text-slate-100 cyber-grid select-none">
      {/* LEFT PANEL: Sidebar */}
      <Sidebar />
      
      {/* CENTER PANEL: Main active workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-gradient-to-b from-black/20 to-black/40">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            <Routes key={location.pathname}>
              <Route path="dashboard" element={<AnimatedRouteWrapper><DashboardPage /></AnimatedRouteWrapper>} />
              <Route path="kanban" element={<AnimatedRouteWrapper><KanbanBoard /></AnimatedRouteWrapper>} />
              <Route path="analysis" element={<AnimatedRouteWrapper><NewAnalysisPage /></AnimatedRouteWrapper>} />
              <Route path="simulation" element={<AnimatedRouteWrapper><SimulationPanel /></AnimatedRouteWrapper>} />
              <Route path="insights" element={<AnimatedRouteWrapper><DecisionInsightsPage /></AnimatedRouteWrapper>} />
              <Route path="profile" element={<AnimatedRouteWrapper><ProfilePage /></AnimatedRouteWrapper>} />
              <Route path="settings" element={<AnimatedRouteWrapper><SettingsPage /></AnimatedRouteWrapper>} />
              <Route path="resource-allocation" element={<AnimatedRouteWrapper><ResourceAllocation /></AnimatedRouteWrapper>} />
              <Route path="analytics" element={<AnimatedRouteWrapper><AnalyticsDashboard /></AnimatedRouteWrapper>} />
              <Route path="client-portal" element={<AnimatedRouteWrapper><ClientPortal /></AnimatedRouteWrapper>} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {/* RIGHT PANEL: AI Copilot Assistant */}
      {showCopilot && <AICopilot />}
    </div>
  );
};

function App() {
  const { user } = useContext(AppContext);
  const location = useLocation();

  return (
    <SettingsProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={!user ? <AuthPage /> : (user.role === 'client' ? <Navigate to="/app/client-portal" /> : <Navigate to="/select-domain" />)} />
          <Route path="/select-domain" element={user ? <DomainSelectionPage /> : <Navigate to="/login" />} />
          <Route path="/app/*" element={user ? <AppLayout /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? (user.role === 'client' ? "/app/client-portal" : "/select-domain") : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </SettingsProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PlanSelection from './components/PlanSelection';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import RevenueDashboard from './pages/enterprise/RevenueDashboard';
import ClientOnboard from './pages/enterprise/ClientOnboard';
import CoachOnboard from './pages/enterprise/CoachOnboard';
import ClientList from './pages/enterprise/ClientList';
import CoachList from './pages/enterprise/CoachList';
import CreateTemplate from './pages/enterprise/CreateTemplate';
import Calendar from './pages/enterprise/Calendar';
import RolesManagement from './pages/enterprise/RolesManagement';
import PendingClients from './pages/enterprise/PendingClients';
import ClientDashboard from './pages/enterprise/ClientDashboard';
import WorkoutPlanner from './pages/enterprise/WorkoutPlanner';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, selectedPlan } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated but hasn't selected a plan, redirect to plan selection
  if (!selectedPlan) {
    return <Navigate to="/select-plan" replace />;
  }

  // If user has enterprise plan, redirect to enterprise dashboard
  if (selectedPlan === 'enterprise') {
    return <Navigate to="/enterprise/revenue" replace />;
  }

  return <>{children}</>;
};

// Enterprise Route Component (requires auth and enterprise plan)
const EnterpriseRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, selectedPlan } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!selectedPlan) {
    return <Navigate to="/select-plan" replace />;
  }

  // Only enterprise users can access
  if (selectedPlan !== 'enterprise') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Plan Selection Route (requires auth, but no plan)
const PlanRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, selectedPlan } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user already has a plan, redirect to appropriate dashboard
  if (selectedPlan) {
    if (selectedPlan === 'enterprise') {
      return <Navigate to="/enterprise/revenue" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, selectedPlan } = useAuth();

  if (user && selectedPlan) {
    if (selectedPlan === 'enterprise') {
      return <Navigate to="/enterprise/revenue" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/select-plan"
        element={
          <PlanRoute>
            <PlanSelection />
          </PlanRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Enterprise Routes */}
      <Route
        path="/enterprise"
        element={
          <EnterpriseRoute>
            <EnterpriseLayout />
          </EnterpriseRoute>
        }
      >
        <Route path="revenue" element={<RevenueDashboard />} />
        <Route path="client-onboard" element={<ClientOnboard />} />
        <Route path="pending-clients" element={<PendingClients />} />
        <Route path="coach-onboard" element={<CoachOnboard />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="client-dashboard/:clientId" element={<ClientDashboard />} />
        <Route path="coaches" element={<CoachList />} />
        <Route path="templates" element={<CreateTemplate />} />
        <Route path="workout-planner" element={<WorkoutPlanner />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="roles" element={<RolesManagement />} />
        <Route index element={<Navigate to="revenue" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

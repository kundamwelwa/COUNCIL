import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Unauthorized from './components/auth/Unauthorized';
import EmailVerification from './components/auth/EmailVerification';
import PasswordReset from './components/auth/PasswordReset';
import MainLayout from './components/layout/MainLayout';
import Beneficiaries from './components/beneficiaries/Beneficiaries';
import Programs from './components/programs/Programs';
import Groups from './components/groups/Groups';
import Loans from './components/loans/Loans';
import Reports from './components/reports/Reports';
import Profile from './components/auth/Profile';
import PermissionRequests from './components/admin/PermissionRequests';
import UserManagement from './components/admin/UserManagement';
import AuditLogs from './components/admin/AuditLogs';
import SystemStatus from './components/admin/SystemStatus';
import Notifications from './components/notifications/Notifications';
import Settings from './components/settings/Settings';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If allowedRoles is specified, check user role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => (
  <MainLayout>
    {children}
  </MainLayout>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Dashboard - All authenticated users */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Beneficiaries - DataEntry, Admin, SuperAdmin */}
          <Route 
            path="/beneficiaries" 
            element={
              <ProtectedRoute allowedRoles={['DataEntry', 'Admin', 'SuperAdmin']}>
                <Layout>
                  <Beneficiaries />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Programs - Admin, SuperAdmin */}
          <Route 
            path="/programs" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <Layout>
                  <Programs />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Groups - DataEntry, Admin, SuperAdmin */}
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute allowedRoles={['DataEntry', 'Admin', 'SuperAdmin']}>
                <Layout>
                  <Groups />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Loans - Admin, SuperAdmin */}
          <Route 
            path="/loans" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                <Layout>
                  <Loans />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Reports - All authenticated users */}
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Profile - All authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Settings - All authenticated users */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Notifications - All authenticated users */}
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Permission Requests - SuperAdmin only */}
          <Route 
            path="/admin/permissions" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <Layout>
                  <PermissionRequests />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* User Management - SuperAdmin only */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Audit Logs - SuperAdmin only */}
          <Route 
            path="/admin/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <Layout>
                  <AuditLogs />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* System Status - SuperAdmin only */}
          <Route 
            path="/admin/system-status" 
            element={
              <ProtectedRoute allowedRoles={['SuperAdmin']}>
                <Layout>
                  <SystemStatus />
                </Layout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

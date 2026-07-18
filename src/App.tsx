import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';

// --- Placeholder Components ---
const Unauthorized = () => <div className="flex items-center justify-center h-screen text-2xl font-bold text-red-600">403 - Unauthorized Access</div>;
const Dashboard = () => <div className="p-8 text-xl font-semibold">Dashboard Landing Page</div>;
const Patients = () => <div className="p-8 text-xl">Patient Management Module</div>;
const Cases = () => <div className="p-8 text-xl">Case Management Module</div>;
const Postmortems = () => <div className="p-8 text-xl">Postmortem Management Module</div>;
const Evidence = () => <div className="p-8 text-xl">Evidence / Chain of Custody Module</div>;
const Reports = () => <div className="p-8 text-xl">Court Report Management</div>;
const Staff = () => <div className="p-8 text-xl text-blue-700">Staff Management (Admin Only)</div>;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                <Patients />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/cases" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER', 'POLICE_OFFICER']}>
                <Cases />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/postmortems" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER']}>
                <Postmortems />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/evidence" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER']}>
                <Evidence />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                <Reports />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Staff />
              </ProtectedRoute>
            } 
          />

          {/* Fallback to dashboard which will auto-redirect to login if not authenticated */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import PatientList from './features/patients/PatientList';
import PatientForm from './features/patients/PatientForm';

// --- Placeholder Components ---
const Unauthorized = () => <div className="flex items-center justify-center h-screen text-2xl font-bold text-red-600">403 - Unauthorized Access</div>;
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

          {/* Protected Layout & Nested Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Auto-redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route path="patients">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <PatientList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="new" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <PatientForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":id" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <PatientForm />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route 
              path="cases" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER', 'POLICE_OFFICER']}>
                  <Cases />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="postmortems" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER']}>
                  <Postmortems />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="evidence" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER']}>
                  <Evidence />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="reports" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="staff" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Staff />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

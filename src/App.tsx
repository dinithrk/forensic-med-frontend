import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './features/dashboard/Dashboard';
import PatientList from './features/patients/PatientList';
import PatientForm from './features/patients/PatientForm';
import PatientView from './features/patients/PatientView';
import CaseList from './features/cases/CaseList';
import CaseForm from './features/cases/CaseForm';
import CaseView from './features/cases/CaseView';
import PostmortemList from './features/postmortem/PostmortemList';
import PostmortemForm from './features/postmortem/PostmortemForm';
import DeceasedForm from './features/postmortem/DeceasedForm';
import DeceasedView from './features/postmortem/DeceasedView';
import PostmortemView from './features/postmortem/PostmortemView';
import { EvidenceList } from './features/evidence/EvidenceList';
import { EvidenceForm } from './features/evidence/EvidenceForm';
import { EvidenceView } from './features/evidence/EvidenceView';
import { ReportsPage } from './features/reports/ReportsPage';

import { StaffDashboard } from './features/admin/StaffDashboard';
import { ProfileView } from './features/profile/ProfileView';

// --- Placeholder Components ---
const Unauthorized = () => <div className="flex items-center justify-center h-screen text-2xl font-bold text-red-600">403 - Unauthorized Access</div>;

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
                    <PatientView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <PatientForm />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="cases">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER', 'POLICE_OFFICER']}>
                    <CaseList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="new" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <CaseForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":id" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <CaseView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":id/edit" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MEDICAL_OFFICER', 'JMO', 'CLERICAL_OFFICER']}>
                    <CaseForm />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="postmortems">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <PostmortemList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="new" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER']}>
                    <DeceasedForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":deceasedId" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <DeceasedView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":deceasedId/edit" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <DeceasedForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":deceasedId/exam/new" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <PostmortemForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":deceasedId/exam/:pmId" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <PostmortemView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":deceasedId/exam/:pmId/edit" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                    <PostmortemForm />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route path="evidence">
              <Route 
                index 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER']}>
                    <EvidenceList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="new" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER']}>
                    <EvidenceForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path=":id" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'LABORATORY_STAFF', 'POLICE_OFFICER']}>
                    <EvidenceView />
                  </ProtectedRoute>
                } 
              />
            </Route>

            <Route 
              path="reports" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'JMO', 'MEDICAL_OFFICER', 'CLERICAL_OFFICER']}>
                  <ReportsPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="profile" 
              element={
                <ProtectedRoute>
                  <ProfileView />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="staff" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StaffDashboard />
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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { authService } from './services/auth';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import EmployeeList from './components/employees/EmployeeList';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeDetail from './components/employees/EmployeeDetail';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute>
                  <EmployeeList />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employees/new" 
              element={
                <ProtectedRoute>
                  <EmployeeForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employees/:id" 
              element={
                <ProtectedRoute>
                  <EmployeeDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employees/:id/edit" 
              element={
                <ProtectedRoute>
                  <EmployeeForm />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
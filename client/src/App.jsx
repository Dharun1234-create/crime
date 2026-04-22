import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegisterFIR from './pages/RegisterFIR';
import FIRList from './pages/FIRList';
import FIRDetails from './pages/FIRDetails';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/register" element={
            <PrivateRoute>
              <RegisterFIR />
            </PrivateRoute>
          } />
          
          <Route path="/records" element={
            <PrivateRoute>
              <FIRList />
            </PrivateRoute>
          } />
          
          <Route path="/fir/:id" element={
            <PrivateRoute>
              <FIRDetails />
            </PrivateRoute>
          } />
          
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          
          {/* Catch all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

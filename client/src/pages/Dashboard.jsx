import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import OfficerDashboard from './OfficerDashboard';

const DashboardSummary = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <OfficerDashboard />;
};

export default DashboardSummary;

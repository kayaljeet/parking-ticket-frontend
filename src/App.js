import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/shared/Navbar';

// Admin pages
import AdminMap from './pages/admin/Map';
import AdminActive from './pages/admin/Active';
import AdminHistory from './pages/admin/History';

// Reportee pages
import ReporteeMap from './pages/reportee/Map';
import ReporteeActive from './pages/reportee/Active';
import ReporteeHistory from './pages/reportee/History';

import './App.css';
import axios from 'axios';

// Configure a global Axios interceptor to append authorization tokens based on the current active role
axios.interceptors.request.use(
  (config) => {
    const role = localStorage.getItem('app_role') || 'admin';
    const adminToken = process.env.REACT_APP_DEMO_ADMIN_TOKEN || 'demo-admin-token-default';
    const joeToken = process.env.REACT_APP_DEMO_JOE_TOKEN || 'demo-joe-token-default';
    const token = role === 'admin' ? adminToken : joeToken;
    
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


function DashboardLayout() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-grow p-4 md:p-8 pt-16 md:pt-8 flex flex-col min-w-0 min-h-0">
        <Outlet context={{ isOpen }} />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { role } = useApp();

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Admin routes */}
        <Route path="/admin/map" element={<AdminMap />} />
        <Route path="/admin/active" element={<AdminActive />} />
        <Route path="/admin/history" element={<AdminHistory />} />

        {/* Reportee routes */}
        <Route path="/reportee/map" element={<ReporteeMap />} />
        <Route path="/reportee/active" element={<ReporteeActive />} />
        <Route path="/reportee/history" element={<ReporteeHistory />} />
      </Route>

      {/* Catch-all: redirect to current role's default page */}
      <Route path="*" element={<Navigate replace to={`/${role}/map`} />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router basename={process.env.PUBLIC_URL}>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;

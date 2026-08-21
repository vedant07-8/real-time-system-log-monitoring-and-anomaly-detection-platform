import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LiveLogs from './pages/LiveLogs';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import System from './pages/System';
import Settings from './pages/Settings';
import Login from './pages/Login';
import DetectionRules from './pages/DetectionRules';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="logs" element={<LiveLogs />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="system" element={<System />} />
              <Route path="rules" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <DetectionRules />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

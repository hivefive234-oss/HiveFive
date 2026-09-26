import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import IoTDeviceController from './components/simulator/IoTDeviceController';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PublicVerificationPage from './pages/PublicVerificationPage';
import ConsumerVerificationPage from './pages/ConsumerVerificationPage';
import BeekeeperDashboard from './pages/BeekeeperDashboard';
import HivesPage from './pages/HivesPage';
import HiveDetailPage from './pages/HiveDetailPage';
import ApiariesPage from './pages/ApiariesPage';
import RecoveryTrackingPage from './pages/RecoveryTrackingPage';
import HarvestBatchesPage from './pages/HarvestBatchesPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

/* Protected layout — Navbar + Sidebar + content area */
function ProtectedLayout() {
  const { user } = useAuth();
  const [showIoT, setShowIoT] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar onOpenSimulator={() => setShowIoT(v => !v)} />
      <div className="flex flex-1 w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 w-full min-w-0 max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      {showIoT && <IoTDeviceController onClose={() => setShowIoT(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public consumer routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify" element={<ConsumerVerificationPage />} />
      <Route path="/verify/:batchId" element={<ConsumerVerificationPage />} />
      <Route path="/consumer/verify" element={<ConsumerVerificationPage />} />
      <Route path="/consumer/verify/:batchId" element={<ConsumerVerificationPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<BeekeeperDashboard />} />
        <Route path="/hives" element={<HivesPage />} />
        <Route path="/hives/:id" element={<HiveDetailPage />} />
        <Route path="/apiaries" element={<ApiariesPage />} />
        <Route path="/recovery" element={<RecoveryTrackingPage />} />
        <Route path="/batches" element={<HarvestBatchesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GiveawayPage from './pages/Giveaway/GiveawayPage';
import './styles/customBootstrap.css';
import './styles/index.css';

const GiveawayDetailsPage = lazy(() => import('./pages/GiveawayDetails/GiveawayDetailsPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-root">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<GiveawayPage />} />
              <Route path="/giveaway/:slug" element={<GiveawayDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

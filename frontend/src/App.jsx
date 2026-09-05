import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GiveawayPage from './pages/Giveaway/GiveawayPage';
import './styles/customBootstrap.css';
import './styles/index.css';

const GiveawayDetailsPage = lazy(() => import('./pages/GiveawayDetails/GiveawayDetailsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-root">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<GiveawayPage />} />
            <Route path="/giveaway/:slug" element={<GiveawayDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

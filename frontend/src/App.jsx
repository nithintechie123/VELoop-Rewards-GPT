import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import GiveawayPage from './pages/Giveaway/GiveawayPage';
import GiveawayDetailsPage from './pages/GiveawayDetails/GiveawayDetailsPage';
import GiveawayLoader from './components/GiveawayLoader/GiveawayLoader';
import './styles/customBootstrap.css';
import './styles/index.css';

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));

function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoadingSession } = useAuth();
  const location = useLocation();

  if (isLoadingSession) {
    return <GiveawayLoader fullScreen={true} />;
  }

  if (!isLoggedIn) {
    const redirectParam = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/login?redirect=${redirectParam}`} replace />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { isLoggedIn, isLoadingSession } = useAuth();
  if (isLoadingSession) {
    return <GiveawayLoader fullScreen={true} />;
  }
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-root">
          <Suspense fallback={<GiveawayLoader fullScreen={true} />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <GiveawayPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/giveaway/:slug"
                element={
                  <ProtectedRoute>
                    <GiveawayDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <LoginPage />
                  </PublicAuthRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicAuthRoute>
                    <LoginPage />
                  </PublicAuthRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}


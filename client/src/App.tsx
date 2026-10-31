import React, { useState, useEffect } from 'react';
import { User } from './types';
import { api, getStoredToken, clearStoredToken } from './lib/api';
import { AppShell, PageId } from './components/layout/AppShell';

// Pages
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { AtmNetworkPage } from './pages/AtmNetworkPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { AtmDetailsPage } from './pages/AtmDetailsPage';
import { RefillActionsPage } from './pages/RefillActionsPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cashflow_iq_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedAtmId, setSelectedAtmId] = useState<string>('ATM001');

  useEffect(() => {
    // If we have token, verify with /auth/me
    const token = getStoredToken();
    if (token) {
      api.getMe()
        .then(u => {
          setCurrentUser(u);
          localStorage.setItem('cashflow_iq_user', JSON.stringify(u));
        })
        .catch(() => {
          // Token invalid
          clearStoredToken();
          setCurrentUser(null);
        });
    }

    const handleAuthExpired = () => {
      setCurrentUser(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('overview');
  };

  const handleLogout = () => {
    api.logout().finally(() => {
      clearStoredToken();
      setCurrentUser(null);
      setCurrentPage('overview');
    });
  };

  const handleNavigate = (page: PageId, extraParam?: string) => {
    if (page === 'atm-details' && extraParam) {
      setSelectedAtmId(extraParam);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={handleNavigate}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {currentPage === 'overview' && (
        <OverviewPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'atm-network' && (
        <AtmNetworkPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'predictions' && (
        <PredictionsPage />
      )}

      {currentPage === 'atm-details' && (
        <AtmDetailsPage atmId={selectedAtmId} onNavigate={handleNavigate} />
      )}

      {currentPage === 'refill-actions' && (
        <RefillActionsPage onNavigate={handleNavigate} />
      )}

      {currentPage === 'data-explorer' && (
        <DataExplorerPage />
      )}

      {currentPage === 'analytics' && (
        <AnalyticsPage />
      )}

      {currentPage === 'prediction-history' && (
        <PredictionHistoryPage />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          currentUser={currentUser}
          onUserUpdated={(u) => {
            setCurrentUser(u);
            localStorage.setItem('cashflow_iq_user', JSON.stringify(u));
          }}
        />
      )}
    </AppShell>
  );
}

export default App;

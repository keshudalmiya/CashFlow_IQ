import React from 'react';
import {
  LayoutDashboard,
  Network,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Database,
  History,
  Settings,
  LogOut,
  Landmark,
  Search,
  Bell,
  Calendar
} from 'lucide-react';
import { User } from '../../types';

export type PageId =
  | 'overview'
  | 'atm-network'
  | 'predictions'
  | 'refill-actions'
  | 'analytics'
  | 'data-explorer'
  | 'prediction-history'
  | 'settings'
  | 'atm-details';

interface AppShellProps {
  currentPage: PageId;
  onNavigate: (page: PageId, extraParam?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: PageId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'atm-network', label: 'ATM Network', icon: <Network size={18} /> },
  { id: 'predictions', label: 'Predictions', icon: <TrendingUp size={18} /> },
  { id: 'refill-actions', label: 'Refill Actions', icon: <RefreshCw size={18} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  { id: 'data-explorer', label: 'Data Explorer', icon: <Database size={18} /> },
  { id: 'prediction-history', label: 'Prediction History', icon: <History size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export const AppShell: React.FC<AppShellProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  children
}) => {
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Landmark size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2 }}>
              ATM Cash
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 500 }}>
              Demand Predictor
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '0.85rem 0.65rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const isActive = currentPage === item.id || (item.id === 'atm-network' && currentPage === 'atm-details');
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: isActive ? '#2563EB' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div style={{
          padding: '0.85rem 0.65rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#94A3B8',
              fontWeight: 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'background-color 0.15s ease, color 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#FCA5A5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94A3B8';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}>
          {/* Left: Global Search or Context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '340px' }}>
            <div style={{
              position: 'relative',
              width: '100%'
            }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search ATM ID, location..."
                className="form-input"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onNavigate('atm-network');
                  }
                }}
              />
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            {/* Date Indicator Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              fontSize: '0.75rem',
              color: '#475569',
              fontWeight: 500
            }}>
              <Calendar size={13} color="#64748B" />
              <span>01 Oct 2026 - 15 Oct 2026</span>
            </div>

            {/* Notification Bell */}
            <div style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748B'
            }}>
              <Bell size={17} />
              <div style={{
                position: 'absolute',
                top: '7px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#DC2626'
              }} />
            </div>

            {/* Admin Profile Pill */}
            <div
              onClick={() => onNavigate('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.25rem 0.6rem 0.25rem 0.25rem',
                borderRadius: '9999px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#1E293B',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                AD
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>
                  {currentUser?.name || 'Admin'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                  {currentUser?.role || 'Administrator'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: '1.5rem', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
};

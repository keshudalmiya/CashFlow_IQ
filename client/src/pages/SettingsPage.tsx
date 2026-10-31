import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Activity,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  KeyRound
} from 'lucide-react';
import { api } from '../lib/api';
import { User, SystemStatus } from '../types';

interface SettingsPageProps {
  currentUser: User | null;
  onUserUpdated: (user: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUserUpdated }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system' | 'preferences'>('profile');

  // Profile form state
  const [name, setName] = useState(currentUser?.name || 'Admin Administrator');
  const [email, setEmail] = useState(currentUser?.email || 'admin@bank.com');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // System status state
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    loadSystemStatus();
  }, []);

  const loadSystemStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await api.getSystemStatus();
      setSystemStatus(res);
    } catch {
      // fallback
    } finally {
      setStatusLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await api.updateProfile(name, email);
      onUserUpdated(updated);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          Manage your profile, system credentials and platform configuration
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>
        {[
          { id: 'profile', label: 'Profile', icon: <UserIcon size={15} /> },
          { id: 'security', label: 'Security', icon: <Shield size={15} /> },
          { id: 'system', label: 'System Status', icon: <Activity size={15} /> },
          { id: 'preferences', label: 'Preferences', icon: <Sliders size={15} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: activeTab === tab.id ? 600 : 500,
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Layout: 2 Columns on desktop (Profile / Content Left, System Status Card Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1.1fr',
        gap: '1.5rem'
      }}>
        {/* Left Column: Tab Content */}
        <div>
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.25rem' }}>
                Administrator Profile
              </h3>

              {profileMsg && (
                <div style={{
                  backgroundColor: profileMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  borderColor: profileMsg.type === 'success' ? '#BBF7D0' : '#FECACA',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: profileMsg.type === 'success' ? '#166534' : '#DC2626',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Avatar Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  AD
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    {currentUser?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {currentUser?.role || 'Administrator'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={currentUser?.username || 'admin'}
                    disabled
                    className="form-input"
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Role
                  </label>
                  <input
                    type="text"
                    value={currentUser?.role || 'Administrator'}
                    disabled
                    className="form-input"
                    style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}
                  />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" disabled={profileSaving} className="btn-primary" style={{ minWidth: '130px' }}>
                    {profileSaving ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Security */}
          {activeTab === 'security' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.25rem' }}>
                Change Password
              </h3>

              {passwordMsg && (
                <div style={{
                  backgroundColor: passwordMsg.type === 'success' ? '#F0FDF4' : '#FEF2F2',
                  borderColor: passwordMsg.type === 'success' ? '#BBF7D0' : '#FECACA',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: passwordMsg.type === 'success' ? '#166534' : '#DC2626',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <button type="submit" disabled={passwordSaving} className="btn-primary" style={{ minWidth: '150px' }}>
                    {passwordSaving ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: System Status (Detailed View) */}
          {activeTab === 'system' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
                System Architecture & ML Feature Configuration
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '1.25rem' }}>
                The Random Forest Regressor requires 10 engineered features in the exact saved training order.
              </p>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Features in Saved Order (1-10):
                </h4>
                <ol style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {systemStatus?.feature_names?.map((f, i) => (
                    <li key={f}>
                      <code>{f}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* Tab 4: Preferences */}
          {activeTab === 'preferences' && (
            <div className="card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.25rem' }}>
                Application Preferences
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Display Currency
                  </label>
                  <select className="form-select" defaultValue="INR" style={{ maxWidth: '200px' }}>
                    <option value="INR">Indian Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Default Forecast Horizon
                  </label>
                  <select className="form-select" defaultValue="next_7_days" style={{ maxWidth: '200px' }}>
                    <option value="next_7_days">Next 7 Days</option>
                    <option value="next_14_days">Next 14 Days</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Decision Support Mode
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Academic decision-support prototype. Does not trigger live cash dispatch.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: System Status Card (Matching Screen 10) */}
        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
                System Status
              </h3>
              <span className="badge-status-active">
                Healthy
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>API Server</span>
                <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ● Online
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Database</span>
                <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ● Connected ({systemStatus?.db_type || 'Embedded'})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>ML Model</span>
                <span style={{ color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ● Loaded (Random Forest)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Features</span>
                <span style={{ color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⓘ {systemStatus?.features_count || 10} features
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Last Model update</span>
                <span style={{ color: '#0F172A', fontWeight: 500, fontSize: '0.8rem' }}>
                  {systemStatus?.last_model_update || '25-Sep-2026 14:20'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748B' }}>Platform Version</span>
                <span style={{ color: '#0F172A', fontWeight: 500 }}>
                  v{systemStatus?.version || '1.0.0'}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={loadSystemStatus}
                disabled={statusLoading}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem' }}
              >
                {statusLoading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

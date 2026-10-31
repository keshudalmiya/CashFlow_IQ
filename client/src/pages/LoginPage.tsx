import React, { useState } from 'react';
import { Landmark, TrendingUp, AlertTriangle, RefreshCw, CheckCircle2, Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { api, setStoredToken } from '../lib/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(username.trim(), password);
      setStoredToken(response.access_token);
      localStorage.setItem('cashflow_iq_user', JSON.stringify(response.user));
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#F8FAFC'
    }}>
      {/* Left Navy Branded Panel (45%) */}
      <div style={{
        flex: '0 0 45%',
        backgroundColor: '#101B31',
        color: '#FFFFFF',
        padding: '3.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle geometric circles in background */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Brand Header */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Landmark size={26} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.15 }}>
                ATM Cash
              </h2>
              <span style={{ fontSize: '0.9rem', color: '#93C5FD', fontWeight: 500 }}>
                Demand Predictor
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25, marginBottom: '0.75rem' }}>
            AI-Powered Forecasting for Smarter ATM Replenishment
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2.5rem', maxWidth: '420px' }}>
            Decision-support platform for banking administrators to optimize cash availability, detect cash-out risks, and prioritize refill logistics.
          </p>

          {/* Feature Bullets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <TrendingUp size={18} color="#60A5FA" />, label: 'Predict cash demand' },
              { icon: <AlertTriangle size={18} color="#FBBF24" />, label: 'Identify cash-out risk' },
              { icon: <RefreshCw size={18} color="#34D399" />, label: 'Recommend refills' },
              { icon: <CheckCircle2 size={18} color="#818CF8" />, label: 'Improve cash availability' }
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                {item.icon}
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#E2E8F0' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
          CashFlow IQ v1.0.0 • Academic Decision Support System
        </div>
      </div>

      {/* Right Form Panel (55%) */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E2E8F0'
        }}>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '1.75rem' }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#DC2626',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '42px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  style={{ paddingLeft: '36px', paddingRight: '36px', height: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <span>Remember me</span>
              </label>
              <span style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 500 }} onClick={() => alert('Default demo credentials: username "admin", password "admin123"')}>
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ height: '44px', width: '100%', fontSize: '0.92rem', fontWeight: 600, marginTop: '0.5rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#94A3B8'
          }}>
            Secure access for authorized administrators only.
          </div>
        </div>
      </div>
    </div>
  );
};

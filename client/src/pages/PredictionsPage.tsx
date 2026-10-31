import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../lib/api';
import { ATM, Prediction, TrendPoint } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';

export const PredictionsPage: React.FC = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [selectedAtmId, setSelectedAtmId] = useState<string>('ATM001');
  const [period, setPeriod] = useState<string>('Next 7 Days');
  
  const [predictionResult, setPredictionResult] = useState<Prediction | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  const [loadingAtms, setLoadingAtms] = useState<boolean>(true);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAtmList();
  }, []);

  useEffect(() => {
    if (selectedAtmId) {
      loadAtmHistoricalTrend(selectedAtmId);
    }
  }, [selectedAtmId]);

  const loadAtmList = async () => {
    setLoadingAtms(true);
    try {
      const res = await api.getAtms({ page: 1, page_size: 100 });
      setAtms(res.items);
      if (res.items.length > 0) {
        setSelectedAtmId(res.items[0].atm_id);
      }
    } catch {
      // fallback
    } finally {
      setLoadingAtms(false);
    }
  };

  const loadAtmHistoricalTrend = async (atmId: string) => {
    try {
      const res = await api.getAtmTrend(atmId, 14);
      setTrendData(res);
    } catch {
      // fallback
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAtmId) return;

    setPredicting(true);
    setError(null);
    try {
      const periodParam = period.toLowerCase().replace(/\s+/g, '_');
      const res = await api.createPrediction(selectedAtmId, periodParam);
      setPredictionResult(res);
      // Refresh trend
      loadAtmHistoricalTrend(selectedAtmId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction.');
    } finally {
      setPredicting(false);
    }
  };

  const selectedAtm = atms.find(a => a.atm_id === selectedAtmId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Generate Cash Demand Prediction
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          Predict future cash demand for a specific ATM using trained machine learning
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: '#DC2626',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Top 2 Columns: Form (Left) & Result (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.6fr',
        gap: '1.25rem'
      }}>
        {/* Form Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1.25rem' }}>
              Select ATM and Period
            </h3>

            <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  ATM *
                </label>
                <select
                  value={selectedAtmId}
                  onChange={e => setSelectedAtmId(e.target.value)}
                  className="form-select"
                  disabled={loadingAtms}
                >
                  {atms.map(a => (
                    <option key={a.atm_id} value={a.atm_id}>
                      {a.atm_id} - {a.atm_name} ({a.city})
                    </option>
                  ))}
                </select>
                {selectedAtm && (
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.35rem' }}>
                    Current Known Balance: <strong>{formatINR(selectedAtm.current_balance)}</strong>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Prediction Period *
                </label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="form-select"
                >
                  <option value="Next 7 Days">Next 7 Days</option>
                  <option value="Next 14 Days">Next 14 Days</option>
                  <option value="Next 24 Hours">Next 24 Hours</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={predicting || !selectedAtmId}
                className="btn-primary"
                style={{
                  height: '42px',
                  width: '100%',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginTop: '0.5rem'
                }}
              >
                {predicting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Running ML Model...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Predict Cash Demand
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{
            fontSize: '0.74rem',
            color: '#64748B',
            borderTop: '1px solid #F1F5F9',
            paddingTop: '0.75rem',
            marginTop: '1.25rem'
          }}>
            Uses 10 engineered features (hour, day, weekend, holiday, balance, lag demand, rolling mean) with Random Forest inference.
          </div>
        </div>

        {/* Prediction Result Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
                  Prediction Result
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                  <Calendar size={13} />
                  <span>
                    Prediction Date: {predictionResult ? formatDateTime(predictionResult.prediction_time) : '15 Oct 2026, 10:30 AM'}
                  </span>
                </div>
              </div>
              {predictionResult && (
                <span className="badge-status-active">
                  Model: {predictionResult.model_version}
                </span>
              )}
            </div>

            {/* 4 Metric Tiles in Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.25rem'
            }}>
              {/* Predicted Demand */}
              <div style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '8px',
                padding: '0.85rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Predicted Demand
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1D4ED8' }}>
                  {formatINR(predictionResult ? predictionResult.predicted_demand : 120000)}
                </div>
              </div>

              {/* Current Balance */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.85rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Current Balance
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                  {formatINR(predictionResult ? predictionResult.current_balance : (selectedAtm ? selectedAtm.current_balance : 42000))}
                </div>
              </div>

              {/* Risk Level */}
              <div style={{
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '8px',
                padding: '0.85rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#92400E', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Risk Level
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: (predictionResult?.risk_level === 'HIGH' || (!predictionResult && selectedAtm?.risk_level === 'HIGH')) ? '#DC2626' : '#D97706' }}>
                  {predictionResult ? predictionResult.risk_level : (selectedAtm?.risk_level || 'High')}
                </div>
              </div>

              {/* Recommended Refill */}
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                padding: '0.85rem 0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Recommended Refill
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#16A34A' }}>
                  {formatINR(predictionResult ? predictionResult.recommended_refill : 80000)}
                </div>
              </div>
            </div>

            {/* Risk Banner Alert */}
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#DC2626',
              fontSize: '0.84rem',
              fontWeight: 500
            }}>
              <AlertCircle size={18} />
              <span>
                {(predictionResult?.risk_level === 'HIGH' || (!predictionResult && selectedAtm?.risk_level === 'HIGH'))
                  ? 'Cash-out risk is high. Replenishment recommended.'
                  : (predictionResult?.risk_level === 'MEDIUM'
                    ? 'Cash-out risk is moderate. Monitor levels closely.'
                    : 'Cash balance is adequate for forecasted period.')
                }
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '1rem' }}>
            Decision support output. Refill calculation: <code style={{ backgroundColor: '#F1F5F9', padding: '1px 4px', borderRadius: '4px' }}>max(0, Demand × 1.2 − Balance)</code>
          </div>
        </div>
      </div>

      {/* Bottom Card: Historical Demand (Last 14 Days) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
              Historical Demand (Last 14 Days) — {selectedAtm?.atm_id || 'ATM001'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Side-by-side comparison of actual cash withdrawals vs predicted demand
            </p>
          </div>
          <select className="form-select" style={{ width: '130px', fontSize: '0.78rem' }} defaultValue="Last 14 days">
            <option value="Last 14 days">Last 14 days</option>
            <option value="Last 7 days">Last 7 days</option>
          </select>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis tickFormatter={(val) => formatINR(val, true)} tick={{ fill: '#64748B', fontSize: 11 }} />
              <Tooltip
                formatter={(val: any) => [formatINR(Number(val)), '']}
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              />
              <Legend iconType="rect" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="actual_demand" name="Actual Demand" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted_demand" name="Predicted Demand" fill="#93C5FD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Landmark,
  ShieldAlert,
  Clock,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { api } from '../lib/api';
import { ATMDetail, Transaction, Prediction, TrendPoint } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { PageId } from '../components/layout/AppShell';

interface AtmDetailsPageProps {
  atmId: string;
  onNavigate: (page: PageId) => void;
}

export const AtmDetailsPage: React.FC<AtmDetailsPageProps> = ({ atmId, onNavigate }) => {
  const [atm, setAtm] = useState<ATMDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'trend' | 'transactions' | 'predictions' | 'location'>('trend');
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [atmId]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [atmRes, trendRes, txRes, predRes] = await Promise.all([
        api.getAtmDetails(atmId),
        api.getAtmTrend(atmId, 14),
        api.getAtmTransactions(atmId, 1, 10),
        api.getAtmPredictions(atmId, 1, 10)
      ]);
      setAtm(atmRes);
      setTrendData(trendRes);
      setTransactions(txRes.items);
      setPredictions(predRes.items);
    } catch (err: any) {
      setError(err.message || 'Failed to load ATM details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading ATM details...</div>
      </div>
    );
  }

  if (error || !atm) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => onNavigate('atm-network')} className="btn-secondary" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Network
        </button>
        <div className="card" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#DC2626', padding: '1.5rem' }}>
          <h3>Failed to load ATM: {atmId}</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header with Back Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
            ATM Details - {atm.atm_id}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
            Detailed information, predictions and transaction history
          </p>
        </div>

        <button
          onClick={() => onNavigate('atm-network')}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
        >
          <ArrowLeft size={15} />
          Back to Network
        </button>
      </div>

      {/* ATM Summary Banner Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 2.7fr',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* Left: ATM Info & Thumbnail */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '10px',
              backgroundColor: '#1E293B',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0
            }}>
              <Landmark size={36} color="#60A5FA" />
              <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px' }}>ATM KIOSK</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A' }}>
                  {atm.atm_id}
                </h2>
                <span className={atm.status === 'Active' ? 'badge-status-active' : 'badge-status-pending'}>
                  {atm.status}
                </span>
                <RiskBadge risk={atm.risk_level} />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>
                {atm.atm_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem' }}>
                <MapPin size={13} />
                <span>{atm.atm_address || `${atm.atm_name}, ${atm.city}`}</span>
              </div>
              {atm.latitude && atm.longitude && (
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <Compass size={12} />
                  <span>{atm.latitude}° N, {atm.longitude}° E</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: 4 Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem'
          }}>
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#991B1B', fontWeight: 500 }}>Current Balance</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#DC2626', marginTop: '0.2rem' }}>
                {formatINR(atm.current_balance)}
              </div>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#1E40AF', fontWeight: 500 }}>Predicted Demand</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2563EB', marginTop: '0.2rem' }}>
                {formatINR(atm.predicted_demand)}
              </div>
            </div>

            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 500 }}>Recommended Refill</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16A34A', marginTop: '0.2rem' }}>
                {formatINR(atm.recommended_refill)}
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>Last Prediction</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginTop: '0.35rem' }}>
                {formatDateTime(atm.last_prediction_time)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>
        {[
          { id: 'trend', label: 'Demand Trend' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'predictions', label: 'Prediction History' },
          { id: 'location', label: 'Location Info' }
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
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Demand Trend */}
      {activeTab === 'trend' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.25rem'
        }}>
          {/* Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
                Actual vs Predicted Cash Demand
              </h3>
              <select className="form-select" style={{ width: '120px', fontSize: '0.78rem' }} defaultValue="Last 14 days">
                <option value="Last 14 days">Last 14 days</option>
              </select>
            </div>

            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => formatINR(val, true)} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="actual_demand" name="Actual" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="predicted_demand" name="Predicted" stroke="#38BDF8" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Analysis Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.5rem' }}>
              Risk Analysis
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Risk Level</span>
              <RiskBadge risk={atm.risk_level} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Safety Factor</span>
              <strong style={{ color: '#0F172A' }}>{atm.safety_factor}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Avg. Daily Withdrawal</span>
              <strong style={{ color: '#0F172A' }}>{formatINR(atm.avg_daily_withdrawal)}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Peak Day</span>
              <strong style={{ color: '#0F172A' }}>{atm.peak_day}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#64748B' }}>Volatility</span>
              <strong style={{ color: atm.volatility === 'High' ? '#DC2626' : '#0F172A' }}>
                {atm.volatility}
              </strong>
            </div>

            <div style={{
              marginTop: '0.5rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: '#64748B', display: 'block', marginBottom: '0.2rem' }}>Suggested Action</span>
              <strong style={{ color: atm.risk_level === 'HIGH' ? '#DC2626' : '#1D4ED8' }}>
                {atm.suggested_action}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions */}
      {activeTab === 'transactions' && (
        <div className="card">
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            Recent ATM Transactions
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Outcome Count</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.transaction_id}>
                    <td>{formatDateTime(t.transaction_time)}</td>
                    <td>
                      <span className="badge-status-active">{t.transaction_type}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatINR(t.amount)}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(t.balance_after)}</td>
                    <td>{t.outcome_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Predictions */}
      {activeTab === 'predictions' && (
        <div className="card">
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            Historical Predictions for {atm.atm_id}
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Prediction Time</th>
                  <th>Period</th>
                  <th>Demand</th>
                  <th>Balance Used</th>
                  <th>Risk</th>
                  <th>Recommended Refill</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p.prediction_id}>
                    <td>{formatDateTime(p.prediction_time)}</td>
                    <td>{p.prediction_period}</td>
                    <td style={{ fontWeight: 600, color: '#2563EB' }}>{formatINR(p.predicted_demand)}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(p.current_balance)}</td>
                    <td><RiskBadge risk={p.risk_level} /></td>
                    <td style={{ fontWeight: 600, color: '#DC2626' }}>{formatINR(p.recommended_refill)}</td>
                    <td>
                      <span className={p.review_status === 'Reviewed' ? 'badge-status-reviewed' : 'badge-status-pending'}>
                        {p.review_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Location Info */}
      {activeTab === 'location' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            ATM Location and Hardware Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>ATM Identifier:</span>
              <strong>{atm.atm_id}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Branch / Location:</span>
              <strong>{atm.atm_name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>City:</span>
              <strong>{atm.city}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Address:</span>
              <strong>{atm.atm_address}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Latitude / Longitude:</span>
              <strong>{atm.latitude}° N, {atm.longitude}° E</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Operating Status:</span>
              <strong style={{ color: '#16A34A' }}>{atm.status}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

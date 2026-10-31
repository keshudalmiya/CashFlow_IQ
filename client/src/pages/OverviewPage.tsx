import React, { useEffect, useState } from 'react';
import {
  Landmark,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../lib/api';
import { OverviewData } from '../types';
import { formatINR } from '../lib/formatters';
import { KpiCard } from '../components/ui/KpiCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import { PageId } from '../components/layout/AppShell';

interface OverviewPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

const RISK_COLORS = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#16A34A'
};

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard overview data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748B' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
          <div>Loading overview dashboard...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="card" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', padding: '1.5rem' }}>
          <h3 style={{ color: '#DC2626', marginBottom: '0.5rem' }}>Failed to load dashboard</h3>
          <p style={{ color: '#991B1B', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>
          <button onClick={loadData} className="btn-primary" style={{ backgroundColor: '#DC2626' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, trend, risk_distribution, attention_list } = data;

  const donutData = [
    { name: 'High Risk', value: risk_distribution.high_risk, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: risk_distribution.medium_risk, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: risk_distribution.low_risk, color: RISK_COLORS.low }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          Overview of ATM network, predictions and refill recommendations
        </p>
      </div>

      {/* Top KPI Cards (4 cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <KpiCard
          title="Total ATMs"
          value={kpis.total_atms}
          subtitle="↑ 12% from last month"
          subtitleType="success"
          icon={<Landmark size={20} color="#2563EB" />}
          iconBg="#EFF6FF"
        />
        <KpiCard
          title="High Risk"
          value={kpis.high_risk}
          subtitle={`${kpis.high_risk_pct}% of network`}
          subtitleType="danger"
          icon={<AlertCircle size={20} color="#DC2626" />}
          iconBg="#FEF2F2"
        />
        <KpiCard
          title="Medium Risk"
          value={kpis.medium_risk}
          subtitle={`${kpis.medium_risk_pct}% of network`}
          subtitleType="warning"
          icon={<AlertTriangle size={20} color="#D97706" />}
          iconBg="#FFFBEB"
        />
        <KpiCard
          title="Low Risk"
          value={kpis.low_risk}
          subtitle={`${kpis.low_risk_pct}% of network`}
          subtitleType="success"
          icon={<ShieldCheck size={20} color="#16A34A" />}
          iconBg="#F0FDF4"
        />
      </div>

      {/* Middle Row: Trend Chart & Risk Donut */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.25rem'
      }}>
        {/* Actual vs Predicted Demand Line Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
                Actual vs Predicted Cash Demand (Last 14 Days)
              </h3>
            </div>
            <select className="form-select" style={{ width: '130px', fontSize: '0.78rem', padding: '0.3rem 0.6rem' }} defaultValue="Last 14 days">
              <option value="Last 14 days">Last 14 days</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
            </select>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#CBD5E1' }} />
                <YAxis
                  tickFormatter={(val) => formatINR(val, true)}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="actual_demand"
                  name="Actual Demand"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#1D4ED8' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_demand"
                  name="Predicted Demand"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#38BDF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
              Risk Distribution
            </h3>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '170px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} ATMs`, '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
                {risk_distribution.total}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 500 }}>
                ATMs
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: RISK_COLORS.high }} />
                <span style={{ color: '#475569' }}>High Risk</span>
              </div>
              <strong style={{ color: '#0F172A' }}>{risk_distribution.high_risk} ({kpis.high_risk_pct}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: RISK_COLORS.medium }} />
                <span style={{ color: '#475569' }}>Medium Risk</span>
              </div>
              <strong style={{ color: '#0F172A' }}>{risk_distribution.medium_risk} ({kpis.medium_risk_pct}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: RISK_COLORS.low }} />
                <span style={{ color: '#475569' }}>Low Risk</span>
              </div>
              <strong style={{ color: '#0F172A' }}>{risk_distribution.low_risk} ({kpis.low_risk_pct}%)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: ATMs Requiring Attention */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
              ATMs Requiring Attention
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B' }}>
              High and medium priority ATMs needing cash monitoring or refill
            </p>
          </div>
          <button
            onClick={() => onNavigate('refill-actions')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            View All Refills
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ATM ID</th>
                <th>Location</th>
                <th>Current Balance</th>
                <th>Predicted Demand</th>
                <th>Risk</th>
                <th>Recommended Refill</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attention_list.map((item) => (
                <tr key={item.atm_id}>
                  <td>
                    <strong style={{ color: '#1E293B' }}>{item.atm_id}</strong>
                  </td>
                  <td>{item.location}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(item.current_balance)}</td>
                  <td style={{ fontWeight: 600, color: '#2563EB' }}>{formatINR(item.predicted_demand)}</td>
                  <td>
                    <RiskBadge risk={item.risk} />
                  </td>
                  <td style={{ fontWeight: 600, color: '#DC2626' }}>
                    {formatINR(item.recommended_refill)}
                  </td>
                  <td>
                    <button
                      onClick={() => onNavigate('atm-details', item.atm_id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      View
                      <ExternalLink size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

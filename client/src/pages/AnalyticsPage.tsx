import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Award,
  Target,
  RefreshCw,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { AnalyticsData } from '../types';
import { formatINR } from '../lib/formatters';
import { KpiCard } from '../components/ui/KpiCard';

const RISK_COLORS = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#16A34A'
};

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
        <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 1rem auto' }} />
        <div>Loading analytics & model performance...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="card" style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#DC2626', padding: '1.5rem' }}>
          <h3>Failed to load analytics</h3>
          <p>{error}</p>
          <button onClick={loadAnalytics} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Retry</button>
        </div>
      </div>
    );
  }

  const { metrics, trend, risk_over_time, top_atms, risk_distribution } = data;

  const donutData = [
    { name: 'High', value: risk_distribution.high_risk, color: RISK_COLORS.high },
    { name: 'Medium', value: risk_distribution.medium_risk, color: RISK_COLORS.medium },
    { name: 'Low', value: risk_distribution.low_risk, color: RISK_COLORS.low }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Analytics & Insights
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          Model performance, evaluation benchmarks, and network cash analytics
        </p>
      </div>

      {/* 4 Model Evaluation Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <KpiCard
          title="MAE"
          value={formatINR(metrics.mae)}
          subtitle="Mean Absolute Error"
          subtitleType="neutral"
          icon={<Target size={20} color="#2563EB" />}
          iconBg="#EFF6FF"
        />
        <KpiCard
          title="RMSE"
          value={formatINR(metrics.rmse)}
          subtitle="Root Mean Squared Error"
          subtitleType="neutral"
          icon={<Activity size={20} color="#7C3AED" />}
          iconBg="#F5F3FF"
        />
        <KpiCard
          title="R² Score"
          value={metrics.r2_score.toFixed(2)}
          subtitle="Variance Explained"
          subtitleType="success"
          icon={<Award size={20} color="#16A34A" />}
          iconBg="#F0FDF4"
        />
        <KpiCard
          title="Prediction Accuracy"
          value={`${metrics.accuracy_pct}%`}
          subtitle={`Evaluated on holdout data (${metrics.evaluation_date})`}
          subtitleType="success"
          icon={<TrendingUp size={20} color="#D97706" />}
          iconBg="#FFFBEB"
        />
      </div>

      {/* Middle Row: Actual vs Predicted Demand & Risk Over Time */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.25rem'
      }}>
        {/* Actual vs Predicted Demand */}
        <div className="card">
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            Actual vs Predicted Demand
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tickFormatter={(val) => formatINR(val, true)} tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Line type="monotone" dataKey="actual_demand" name="Actual" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="predicted_demand" name="Predicted" stroke="#38BDF8" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Over Time (Stacked Bars) */}
        <div className="card">
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            Risk Distribution Over Time
          </h3>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={risk_over_time} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
                <Bar dataKey="high" name="High" stackId="a" fill={RISK_COLORS.high} />
                <Bar dataKey="medium" name="Medium" stackId="a" fill={RISK_COLORS.medium} />
                <Bar dataKey="low" name="Low" stackId="a" fill={RISK_COLORS.low} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top 5 High Demand ATMs & Risk Donut */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '1.25rem'
      }}>
        {/* Top 5 High Demand ATMs Horizontal Bars */}
        <div className="card">
          <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A', marginBottom: '1rem' }}>
            Top 5 High Demand ATMs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {top_atms.map((atm) => {
              const maxDemand = 1800000;
              const pct = (atm.demand / maxDemand) * 100;
              return (
                <div key={atm.atm_id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ width: '130px', color: '#334155', fontWeight: 500, flexShrink: 0 }}>
                    {atm.name}
                  </div>
                  <div style={{ flex: 1, height: '10px', backgroundColor: '#EFF6FF', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: '9999px' }} />
                  </div>
                  <div style={{ width: '60px', textAlign: 'right', fontWeight: 600, color: '#0F172A', flexShrink: 0 }}>
                    {formatINR(atm.demand, true)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Distribution Donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#0F172A' }}>
              Risk Distribution
            </h3>
          </div>

          <div style={{ position: 'relative', width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
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
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>
                {risk_distribution.total}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>
                ATMs
              </div>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>■ High</span>
              <strong>{risk_distribution.high_risk} ({((risk_distribution.high_risk / risk_distribution.total) * 100).toFixed(1)}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>■ Medium</span>
              <strong>{risk_distribution.medium_risk} ({((risk_distribution.medium_risk / risk_distribution.total) * 100).toFixed(1)}%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>■ Low</span>
              <strong>{risk_distribution.low_risk} ({((risk_distribution.low_risk / risk_distribution.total) * 100).toFixed(1)}%)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

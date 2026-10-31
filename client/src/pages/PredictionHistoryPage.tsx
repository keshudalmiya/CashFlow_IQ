import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, Eye, RefreshCw, X, Calendar, Landmark, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { Prediction } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';

export const PredictionHistoryPage: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const [search, setSearch] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All Risk Levels');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected prediction detail modal
  const [activeModalPred, setActiveModalPred] = useState<Prediction | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [currentPage, selectedRisk]);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPredictionHistory({
        search: search.trim() || undefined,
        risk_level: selectedRisk !== 'All Risk Levels' ? selectedRisk : undefined,
        page: currentPage,
        page_size: pageSize
      });
      setPredictions(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load prediction history.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPredictions();
  };

  const handleReset = () => {
    setSearch('');
    setSelectedRisk('All Risk Levels');
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Prediction History
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          View past predictions and model execution audit results
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ATM ID, location..."
                className="form-input"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>
          </form>

          {/* Risk Level Filter & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <select
              value={selectedRisk}
              onChange={e => { setSelectedRisk(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: '150px', fontSize: '0.82rem' }}
            >
              <option value="All Risk Levels">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <button
              onClick={handleReset}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading predictions...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <div>{error}</div>
            <button onClick={loadPredictions} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Retry</button>
          </div>
        ) : predictions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <div>No prediction records found.</div>
            <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>ATM ID</th>
                    <th>Predicted Demand</th>
                    <th>Current Balance</th>
                    <th>Risk</th>
                    <th>Recommended Refill</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(p => (
                    <tr key={p.prediction_id}>
                      <td>{formatDateTime(p.prediction_time)}</td>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{p.atm_id}</strong>
                      </td>
                      <td style={{ fontWeight: 600, color: '#2563EB' }}>{formatINR(p.predicted_demand)}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(p.current_balance)}</td>
                      <td>
                        <RiskBadge risk={p.risk_level} />
                      </td>
                      <td style={{ fontWeight: 600, color: p.recommended_refill > 0 ? '#DC2626' : '#16A34A' }}>
                        {formatINR(p.recommended_refill)}
                      </td>
                      <td>
                        <button
                          onClick={() => setActiveModalPred(p)}
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
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              entityName="predictions"
            />
          </>
        )}
      </div>

      {/* Modal: Prediction Detail Snapshot */}
      {activeModalPred && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#2563EB" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A' }}>
                  Prediction Audit Record - {activeModalPred.atm_id}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalPred(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '0.85rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Prediction ID:</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', wordBreak: 'break-all' }}>
                    {activeModalPred.prediction_id}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Timestamp:</span>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
                    {formatDateTime(activeModalPred.prediction_time)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Model Version:</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563EB' }}>
                    {activeModalPred.model_version}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Forecast Horizon:</span>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0F172A' }}>
                    {activeModalPred.prediction_period}
                  </div>
                </div>
              </div>

              {/* 4 Stat Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ backgroundColor: '#EFF6FF', padding: '0.6rem 0.4rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#1E40AF' }}>Predicted</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1D4ED8' }}>
                    {formatINR(activeModalPred.predicted_demand)}
                  </div>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.4rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>Balance Used</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    {formatINR(activeModalPred.current_balance)}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFBEB', padding: '0.6rem 0.4rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#92400E' }}>Risk</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#D97706' }}>
                    {activeModalPred.risk_level}
                  </div>
                </div>
                <div style={{ backgroundColor: '#FEF2F2', padding: '0.6rem 0.4rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#991B1B' }}>Refill</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626' }}>
                    {formatINR(activeModalPred.recommended_refill)}
                  </div>
                </div>
              </div>

              {/* Feature snapshot view */}
              {activeModalPred.feature_snapshot && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Engineered Feature Snapshot (10 Features):
                  </h4>
                  <pre style={{
                    backgroundColor: '#0F172A',
                    color: '#93C5FD',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    overflowX: 'auto',
                    lineHeight: 1.4
                  }}>
                    {JSON.stringify(activeModalPred.feature_snapshot, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #E2E8F0', textAlign: 'right' }}>
              <button onClick={() => setActiveModalPred(null)} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

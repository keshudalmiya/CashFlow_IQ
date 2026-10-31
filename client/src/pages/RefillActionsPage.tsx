import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, CheckCircle, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';
import { RefillRecommendation } from '../types';
import { formatINR } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';
import { PageId } from '../components/layout/AppShell';

interface RefillActionsPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

export const RefillActionsPage: React.FC<RefillActionsPageProps> = ({ onNavigate }) => {
  const [refills, setRefills] = useState<RefillRecommendation[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const [search, setSearch] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All Risk Levels');
  const [selectedStatus, setSelectedStatus] = useState<string>('Pending');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');

  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadRefills();
  }, [currentPage, selectedRisk, selectedStatus, selectedCity]);

  const loadCities = async () => {
    try {
      const res = await api.getCities();
      setCities(res);
    } catch {
      // fallback
    }
  };

  const loadRefills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getRefills({
        risk_level: selectedRisk !== 'All Risk Levels' ? selectedRisk : undefined,
        review_status: selectedStatus !== 'All' ? selectedStatus : undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        search: search.trim() || undefined,
        page: currentPage,
        page_size: pageSize
      });
      setRefills(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load refill recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (predictionId: string) => {
    setUpdatingId(predictionId);
    try {
      await api.updateRefillReview(predictionId, 'Reviewed');
      // Refresh current list
      loadRefills();
    } catch (err: any) {
      alert(`Failed to update review status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRefills();
  };

  const handleReset = () => {
    setSearch('');
    setSelectedRisk('All Risk Levels');
    setSelectedStatus('Pending');
    setSelectedCity('All Cities');
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Refill Recommendations
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          List of ATMs with recommended refill amounts
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
          {/* Dropdown Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

            <select
              value={selectedStatus}
              onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: '130px', fontSize: '0.82rem' }}
            >
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="All">All Status</option>
            </select>

            <select
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: '140px', fontSize: '0.82rem' }}
            >
              <option value="All Cities">All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
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

          {/* Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '250px' }}>
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
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading refill recommendations...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <div>{error}</div>
            <button onClick={loadRefills} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Retry</button>
          </div>
        ) : refills.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <div>No refill recommendations match the selected filters.</div>
            <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Reset Filters</button>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ATM ID</th>
                    <th>Location</th>
                    <th>Current Balance</th>
                    <th>Predicted Demand</th>
                    <th>Recommended Refill</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refills.map(r => (
                    <tr key={r.prediction_id}>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{r.atm_id}</strong>
                      </td>
                      <td>{r.atm_name ? `${r.atm_name}, ${r.city}` : r.atm_id}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(r.current_balance)}</td>
                      <td style={{ fontWeight: 600, color: '#2563EB' }}>{formatINR(r.predicted_demand)}</td>
                      <td style={{ fontWeight: 700, color: '#DC2626' }}>
                        {formatINR(r.recommended_refill)}
                      </td>
                      <td>
                        <RiskBadge risk={r.risk_level} />
                      </td>
                      <td>
                        <span className={r.review_status === 'Reviewed' ? 'badge-status-reviewed' : 'badge-status-pending'}>
                          {r.review_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          {r.review_status === 'Pending' ? (
                            <button
                              onClick={() => handleMarkReviewed(r.prediction_id)}
                              disabled={updatingId === r.prediction_id}
                              style={{
                                background: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                color: '#1D4ED8',
                                padding: '0.25rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {updatingId === r.prediction_id ? 'Saving...' : 'Mark Reviewed'}
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigate('atm-details', r.atm_id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563EB',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              View
                            </button>
                          )}
                        </div>
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
              entityName="recommendations"
            />
          </>
        )}
      </div>
    </div>
  );
};

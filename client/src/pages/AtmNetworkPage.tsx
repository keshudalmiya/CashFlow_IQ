import React, { useEffect, useState } from 'react';
import { Search, Filter, RotateCcw, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { ATM } from '../types';
import { formatINR } from '../lib/formatters';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Pagination } from '../components/ui/Pagination';
import { AtmNetworkMap } from '../components/ui/AtmNetworkMap';
import { PageId } from '../components/layout/AppShell';

interface AtmNetworkPageProps {
  onNavigate: (page: PageId, extraParam?: string) => void;
}

export const AtmNetworkPage: React.FC<AtmNetworkPageProps> = ({ onNavigate }) => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(5);

  const [search, setSearch] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedRisk, setSelectedRisk] = useState<string>('All Risk Levels');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    loadAtms();
  }, [currentPage, selectedCity, selectedRisk, selectedStatus]);

  const loadCities = async () => {
    try {
      const res = await api.getCities();
      setCities(res);
    } catch {
      // fallback
    }
  };

  const loadAtms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAtms({
        search: search.trim() || undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        risk_level: selectedRisk !== 'All Risk Levels' ? selectedRisk : undefined,
        status: selectedStatus !== 'All Status' ? selectedStatus : undefined,
        page: currentPage,
        page_size: pageSize
      });
      setAtms(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load ATM network data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAtms();
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCity('All Cities');
    setSelectedRisk('All Risk Levels');
    setSelectedStatus('All Status');
    setCurrentPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          ATM Network
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          View and manage all ATMs in the network
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
              value={selectedCity}
              onChange={e => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="form-select"
              style={{ width: '150px', fontSize: '0.82rem' }}
            >
              <option value="All Cities">All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

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
              style={{ width: '140px', fontSize: '0.82rem' }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
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

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '260px' }}>
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

      {/* Interactive Map View */}
      <AtmNetworkMap
        atms={atms}
        onSelectAtm={(id) => onNavigate('atm-details', id)}
      />

      {/* ATM Table */}
      <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading ATMs...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <div>{error}</div>
            <button onClick={loadAtms} className="btn-secondary" style={{ marginTop: '0.75rem' }}>Retry</button>
          </div>
        ) : atms.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <div>No ATMs match the selected filters.</div>
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
                    <th>City</th>
                    <th>Current Balance</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {atms.map(atm => (
                    <tr key={atm.atm_id}>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{atm.atm_id}</strong>
                      </td>
                      <td>{atm.atm_name}</td>
                      <td>{atm.city}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(atm.current_balance)}</td>
                      <td>
                        <RiskBadge risk={atm.risk_level} />
                      </td>
                      <td>
                        <span className={atm.status === 'Active' ? 'badge-status-active' : 'badge-status-pending'}>
                          {atm.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => onNavigate('atm-details', atm.atm_id)}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              entityName="ATMs"
            />
          </>
        )}
      </div>
    </div>
  );
};

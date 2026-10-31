import React, { useEffect, useState } from 'react';
import { Search, RotateCcw, Database, Table, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { Transaction, FeatureRecord, ATM } from '../types';
import { formatINR, formatDateTime } from '../lib/formatters';
import { Pagination } from '../components/ui/Pagination';

export const DataExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'features'>('transactions');
  const [atms, setAtms] = useState<ATM[]>([]);
  const [selectedAtm, setSelectedAtm] = useState<string>('All ATMs');
  const [search, setSearch] = useState<string>('');

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState<number>(0);
  const [txTotalPages, setTxTotalPages] = useState<number>(1);
  const [txPage, setTxPage] = useState<number>(1);

  // Features state
  const [features, setFeatures] = useState<FeatureRecord[]>([]);
  const [featTotal, setFeatTotal] = useState<number>(0);
  const [featTotalPages, setFeatTotalPages] = useState<number>(1);
  const [featPage, setFeatPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAtms();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    } else {
      loadFeatures();
    }
  }, [activeTab, txPage, featPage, selectedAtm]);

  const loadAtms = async () => {
    try {
      const res = await api.getAtms({ page: 1, page_size: 100 });
      setAtms(res.items);
    } catch {
      // fallback
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTransactions({
        search: search.trim() || undefined,
        atm_id: selectedAtm !== 'All ATMs' ? selectedAtm : undefined,
        page: txPage,
        page_size: 5
      });
      setTransactions(res.items);
      setTxTotal(res.total);
      setTxTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction data.');
    } finally {
      setLoading(false);
    }
  };

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getEngineeredFeatures({
        atm_id: selectedAtm !== 'All ATMs' ? selectedAtm : undefined,
        page: featPage,
        page_size: 5
      });
      setFeatures(res.items);
      setFeatTotal(res.total);
      setFeatTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load engineered features.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'transactions') {
      setTxPage(1);
      loadTransactions();
    }
  };

  const handleReset = () => {
    setSearch('');
    setSelectedAtm('All ATMs');
    setTxPage(1);
    setFeatPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.2rem' }}>
          Data Explorer
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748B' }}>
          Explore ATM transaction data and engineered features used for ML modeling
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.25rem' }}>
        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'transactions' ? 600 : 500,
            color: activeTab === 'transactions' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'transactions' ? '2px solid #2563EB' : '2px solid transparent',
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
          <Table size={16} />
          Transactions Data
        </button>
        <button
          onClick={() => setActiveTab('features')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'features' ? 600 : 500,
            color: activeTab === 'features' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'features' ? '2px solid #2563EB' : '2px solid transparent',
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
          <Database size={16} />
          Engineered Features
        </button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={selectedAtm}
              onChange={e => { setSelectedAtm(e.target.value); setTxPage(1); setFeatPage(1); }}
              className="form-select"
              style={{ width: '160px', fontSize: '0.82rem' }}
            >
              <option value="All ATMs">All ATMs</option>
              {atms.map(a => (
                <option key={a.atm_id} value={a.atm_id}>{a.atm_id} - {a.atm_name}</option>
              ))}
            </select>

            <select className="form-select" style={{ width: '140px', fontSize: '0.82rem' }} defaultValue="Date Range">
              <option value="Date Range">All Dates</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 14 Days">Last 14 Days</option>
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

          {activeTab === 'transactions' && (
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '250px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="form-input"
                  style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem' }}
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="card" style={{ padding: '0.75rem 1.25rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading data...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <div>{error}</div>
          </div>
        ) : activeTab === 'transactions' ? (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>ATM ID</th>
                    <th>Transaction Type</th>
                    <th>Amount</th>
                    <th>Balance After Txn</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.transaction_id}>
                      <td>{formatDateTime(t.transaction_time)}</td>
                      <td>
                        <strong style={{ color: '#1E293B' }}>{t.atm_id}</strong>
                      </td>
                      <td>
                        <span className={t.transaction_type === 'Withdrawal' ? 'badge-risk-medium' : 'badge-status-active'}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatINR(t.amount)}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(t.balance_after)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={txPage}
              totalPages={txTotalPages}
              totalRecords={txTotal}
              pageSize={5}
              onPageChange={setTxPage}
              entityName="records"
            />
          </>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>ATM</th>
                    <th>Hour</th>
                    <th>DOW</th>
                    <th>Weekend</th>
                    <th>Holiday</th>
                    <th>Total Balance</th>
                    <th>Outcomes</th>
                    <th>Total Tx</th>
                    <th>Prev Demand</th>
                    <th>Prev Tx Count</th>
                    <th>Rolling Mean 3</th>
                    <th>Target Demand</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map(f => (
                    <tr key={f.id}>
                      <td>{f.id}</td>
                      <td><strong>{f.atm_id}</strong></td>
                      <td>{f.hour}</td>
                      <td>{f.day_of_week}</td>
                      <td>{f.is_weekend}</td>
                      <td>{f.is_holiday}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(f.totalBalance)}</td>
                      <td>{f.numberOutcomeTransaction}</td>
                      <td>{f.totalNumberTransaction}</td>
                      <td>{formatINR(f.previous_demand)}</td>
                      <td>{f.previous_transaction_count}</td>
                      <td>{formatINR(f.rolling_mean_3)}</td>
                      <td style={{ fontWeight: 600, color: '#2563EB' }}>{formatINR(f.target_demand)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={featPage}
              totalPages={featTotalPages}
              totalRecords={featTotal}
              pageSize={5}
              onPageChange={setFeatPage}
              entityName="engineered features"
            />
          </>
        )}
      </div>
    </div>
  );
};

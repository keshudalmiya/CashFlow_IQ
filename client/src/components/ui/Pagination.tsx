import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  entityName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  entityName = 'records'
}) => {
  if (totalRecords === 0) return null;

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots-start" style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const isActive = p === currentPage;
      pages.push(
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '6px',
            border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
            backgroundColor: isActive ? '#2563EB' : '#FFFFFF',
            color: isActive ? '#FFFFFF' : '#0F172A',
            fontWeight: isActive ? 600 : 400,
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}
        >
          {p}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            minWidth: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.82rem'
          }}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem 0.25rem',
      fontSize: '0.85rem',
      color: '#64748B',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      <div>
        Showing <strong style={{ color: '#0F172A' }}>{startRecord}-{endRecord}</strong> of <strong style={{ color: '#0F172A' }}>{totalRecords}</strong> {entityName}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.4 : 1
          }}
        >
          <ChevronLeft size={16} />
        </button>
        {renderPageNumbers()}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.4 : 1
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

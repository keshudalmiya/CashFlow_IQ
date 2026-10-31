/**
 * Currency and date formatting utilities for CashFlow IQ
 */

export function formatINR(val?: number | null, compact: boolean = false): string {
  if (val === undefined || val === null || isNaN(val)) return '₹ 0';

  if (compact) {
    if (Math.abs(val) >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(1)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹ ${(val / 100000).toFixed(1)}L`;
    }
    if (Math.abs(val) >= 1000) {
      return `₹ ${(val / 1000).toFixed(0)}k`;
    }
  }

  // Standard Indian comma grouping (en-IN)
  const formatted = Math.round(val).toLocaleString('en-IN');
  return `₹ ${formatted}`;
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
}

export function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

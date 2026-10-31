import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  risk?: RiskLevel | string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md' }) => {
  const normRisk = (risk || 'LOW').toUpperCase();

  if (normRisk === 'HIGH') {
    return (
      <span className="badge-risk-high" style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
        <AlertCircle size={size === 'sm' ? 12 : 14} />
        High
      </span>
    );
  }

  if (normRisk === 'MEDIUM') {
    return (
      <span className="badge-risk-medium" style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
        <AlertTriangle size={size === 'sm' ? 12 : 14} />
        Medium
      </span>
    );
  }

  return (
    <span className="badge-risk-low" style={{ fontSize: size === 'sm' ? '0.7rem' : '0.75rem' }}>
      <ShieldCheck size={size === 'sm' ? 12 : 14} />
      Low
    </span>
  );
};

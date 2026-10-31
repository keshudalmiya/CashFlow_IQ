import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitleType?: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ReactNode;
  iconBg?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  subtitleType = 'neutral',
  icon,
  iconBg = '#EFF6FF'
}) => {
  const getSubColor = () => {
    switch (subtitleType) {
      case 'success':
        return '#16A34A';
      case 'warning':
        return '#D97706';
      case 'danger':
        return '#DC2626';
      default:
        return '#64748B';
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>
          {title}
        </span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8rem', color: getSubColor(), fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

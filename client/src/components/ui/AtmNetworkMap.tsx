import React, { useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ATM } from '../../types';
import { formatINR } from '../../lib/formatters';

interface AtmNetworkMapProps {
  atms: ATM[];
  onSelectAtm?: (atmId: string) => void;
}

export const AtmNetworkMap: React.FC<AtmNetworkMapProps> = ({ atms, onSelectAtm }) => {
  const [selectedAtmId, setSelectedAtmId] = useState<string>('ATM001');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const selectedAtm = atms.find(a => a.atm_id === selectedAtmId) || atms[0];

  // Map representation with plotted coordinate positions
  // Indian metro coordinates normalized to SVG viewBox (0 0 1000 360)
  const getCoordinates = (atm: ATM, index: number) => {
    if (atm.latitude && atm.longitude) {
      // Delhi area ~ 28.5N, 77.2E
      // Normalize to 1000x360 canvas
      const x = ((atm.longitude - 72.0) / (88.5 - 72.0)) * 800 + 100;
      const y = (1.0 - (atm.latitude - 12.0) / (29.0 - 12.0)) * 280 + 40;
      return { x: Math.max(50, Math.min(950, x)), y: Math.max(40, Math.min(320, y)) };
    }
    // Fallback spread
    return {
      x: 100 + (index * 67) % 800,
      y: 60 + (index * 43) % 240
    };
  };

  const getPinColor = (risk: string) => {
    switch (risk.toUpperCase()) {
      case 'HIGH':
        return '#DC2626';
      case 'MEDIUM':
        return '#D97706';
      default:
        return '#16A34A';
    }
  };

  return (
    <div style={{
      position: 'relative',
      height: '320px',
      backgroundColor: '#EBF3FA',
      borderRadius: '0.75rem',
      border: '1px solid #CBD5E1',
      overflow: 'hidden',
      marginBottom: '1.25rem',
      backgroundImage: `
        radial-gradient(#CBD5E1 1px, transparent 1px),
        linear-gradient(to right, rgba(226, 232, 240, 0.4) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(226, 232, 240, 0.4) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px, 48px 48px, 48px 48px'
    }}>
      {/* Decorative Road / River Vectors */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        viewBox="0 0 1000 360"
        preserveAspectRatio="none"
      >
        <path d="M 0 120 Q 250 80 500 160 T 1000 140" fill="none" stroke="#D1E3F8" strokeWidth="6" />
        <path d="M 120 0 Q 300 200 450 360" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M 400 0 Q 600 180 800 360" fill="none" stroke="#FFFFFF" strokeWidth="3" />
        <path d="M 0 280 Q 400 240 700 320 T 1000 220" fill="none" stroke="#E2E8F0" strokeWidth="3" />
      </svg>

      {/* Map Pins */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {atms.slice(0, 25).map((atm, i) => {
          const coords = getCoordinates(atm, i);
          const isSelected = atm.atm_id === selectedAtmId;
          const pinColor = getPinColor(atm.risk_level);

          return (
            <div
              key={atm.atm_id}
              onClick={() => {
                setSelectedAtmId(atm.atm_id);
                if (onSelectAtm) onSelectAtm(atm.atm_id);
              }}
              style={{
                position: 'absolute',
                left: `${coords.x / 10}%`,
                top: `${(coords.y / 360) * 100}%`,
                transform: 'translate(-50%, -100%)',
                cursor: 'pointer',
                zIndex: isSelected ? 30 : 10,
                transition: 'transform 0.15s ease'
              }}
              title={`${atm.atm_id} - ${atm.atm_name}`}
            >
              <div style={{
                width: isSelected ? '28px' : '22px',
                height: isSelected ? '28px' : '22px',
                borderRadius: '50%',
                backgroundColor: pinColor,
                border: '2px solid #FFFFFF',
                boxShadow: isSelected ? '0 0 0 4px rgba(37, 99, 235, 0.3), 0 3px 6px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <MapPin size={isSelected ? 16 : 12} />
              </div>
            </div>
          );
        })}

        {/* Selected ATM Info Popup */}
        {selectedAtm && (
          <div style={{
            position: 'absolute',
            left: '52%',
            top: '26%',
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #CBD5E1',
            padding: '0.65rem 0.9rem',
            zIndex: 40,
            minWidth: '180px',
            fontSize: '0.8rem',
            pointerEvents: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
              <strong style={{ color: '#0F172A', fontSize: '0.85rem' }}>{selectedAtm.atm_id}</strong>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: selectedAtm.risk_level === 'HIGH' ? '#DC2626' : selectedAtm.risk_level === 'MEDIUM' ? '#D97706' : '#16A34A'
              }}>
                Risk: {selectedAtm.risk_level}
              </span>
            </div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              {selectedAtm.atm_name}, {selectedAtm.city}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '0.3rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.72rem' }}>Balance:</span>
              <strong style={{ color: '#0F172A', fontSize: '0.82rem' }}>{formatINR(selectedAtm.current_balance)}</strong>
            </div>
            {/* Pointer arrow */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '12px',
              height: '12px',
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #CBD5E1',
              borderBottom: '1px solid #CBD5E1'
            }} />
          </div>
        )}
      </div>

      {/* Map Control Buttons (Top Right) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 25
      }}>
        <button
          onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          title="Zoom In"
        >
          <ZoomIn size={14} color="#334155" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
          style={{
            width: '28px',
            height: '28px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
          title="Zoom Out"
        >
          <ZoomOut size={14} color="#334155" />
        </button>
      </div>
    </div>
  );
};

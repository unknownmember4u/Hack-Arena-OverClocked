'use client';

/**
 * RouteInfoOverlay — floating card on the map showing route details
 * (distance, duration, transport mode) after the user clicks Navigate.
 */

import { X, Navigation2, Clock, MapPin, Bike, Car, Bus, Route } from 'lucide-react';

export interface RouteInfo {
  propertyName: string;
  distanceKm: number;
  durationMin: number;
  transportMode: string;
  fromLabel: string;
  toArea: string;
}

interface RouteInfoOverlayProps {
  info: RouteInfo;
  onClose: () => void;
}

const transportLabel = (mode: string) => {
  switch (mode) {
    case 'bike': return 'Cycling';
    case 'car': return 'Driving';
    case 'bus': return 'Driving (Bus)';
    default: return 'Driving';
  }
};

const TransportIcon = ({ mode }: { mode: string }) => {
  switch (mode) {
    case 'bike': return <Bike size={14} />;
    case 'car': return <Car size={14} />;
    case 'bus': return <Bus size={14} />;
    default: return <Car size={14} />;
  }
};

export default function RouteInfoOverlay({ info, onClose }: RouteInfoOverlayProps) {
  return (
    <div className="route-info-overlay">
      <button className="route-info-close" onClick={onClose}>
        <X size={14} />
      </button>

      <div className="route-info-header">
        <Route size={16} className="route-info-icon" />
        <span>Route Details</span>
      </div>

      <div className="route-info-property">{info.propertyName}</div>

      <div className="route-info-endpoints">
        <div className="route-endpoint">
          <Navigation2 size={11} />
          <span className="endpoint-label">From</span>
          <span className="endpoint-value">{info.fromLabel}</span>
        </div>
        <div className="route-endpoint-divider">→</div>
        <div className="route-endpoint">
          <MapPin size={11} />
          <span className="endpoint-label">To</span>
          <span className="endpoint-value">{info.toArea}</span>
        </div>
      </div>

      <div className="route-info-stats">
        <div className="route-stat">
          <MapPin size={13} />
          <span className="route-stat-val">{info.distanceKm.toFixed(1)}</span>
          <span className="route-stat-lbl">km</span>
        </div>
        <div className="route-stat">
          <Clock size={13} />
          <span className="route-stat-val">{Math.round(info.durationMin)}</span>
          <span className="route-stat-lbl">min</span>
        </div>
        <div className="route-stat">
          <TransportIcon mode={info.transportMode} />
          <span className="route-stat-val">{transportLabel(info.transportMode)}</span>
        </div>
      </div>

      <button className="route-info-dismiss" onClick={onClose}>
        <X size={12} /> Clear Route
      </button>
    </div>
  );
}

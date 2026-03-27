'use client';

/**
 * RecommendationPanel — Top-3 with Lucide icons and navigation buttons.
 * Rendered inside the sidebar, not as a map overlay.
 */

import { MapPin, Clock, Fuel, Star, Navigation2, ExternalLink, Trophy } from 'lucide-react';
import type { Property, TransportMode } from '@/types/property';
import type { UserProfile } from '@/types/user';
import { calculateMonthlyTransportCost } from '@/map/feasibilityEngine';
import { calculateCommuteMinutes } from '@/utils/geo';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#cd7f32'] as const;

interface RecommendationPanelProps {
  filteredProperties: Property[];
  userProfile: UserProfile;
  scores: Map<string, number>;
  onNavigate: (property: Property) => void;
  onCardClick?: (property: Property) => void;
}

export default function RecommendationPanel({
  filteredProperties,
  userProfile,
  scores,
  onNavigate,
  onCardClick,
}: RecommendationPanelProps) {
  const sorted = [...filteredProperties].sort((a, b) => {
    return (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0);
  });

  const top3 = sorted.slice(0, 3);
  const isTransportNone = userProfile.preferredTransport === 'none';

  const getGoogleMapsUrl = (prop: Property): string => {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${prop.location.lat},${prop.location.lng}`;
    if (userProfile.currentLocation) {
      url += `&origin=${userProfile.currentLocation.lat},${userProfile.currentLocation.lng}`;
    }
    return url;
  };

  if (top3.length === 0) {
    return (
      <div className="rec-panel">
        <h2 className="rec-panel-title">
          <Trophy size={16} /> Top Recommendations
        </h2>
        <p className="rec-empty">No properties match. Try adjusting filters.</p>
      </div>
    );
  }

  return (
    <div className="rec-panel">
      <h2 className="rec-panel-title">
        <Trophy size={16} /> Top Recommendations
      </h2>
      <div className="rec-list">
        {top3.map((prop, idx) => {
          const score = scores.get(prop.id) ?? 0;
          const bhkLabel = prop.bhk ? ` ${prop.bhk}BHK` : '';

          let commuteMin: number | null = null;
          let transportCost: number | null = null;
          if (!isTransportNone) {
            commuteMin = calculateCommuteMinutes(
              userProfile.currentLocation.lat,
              userProfile.currentLocation.lng,
              prop.location.lat,
              prop.location.lng,
              userProfile.preferredTransport
            );
            transportCost = calculateMonthlyTransportCost(prop, userProfile);
          }
          const topAmenities = prop.nearby.slice(0, 2);

          return (
            <div key={prop.id} className="rec-card" onClick={() => onCardClick?.(prop)} style={{ cursor: onCardClick ? 'pointer' : undefined }}>
              {/* Image header */}
              {prop.image_url && (
                <div className="rec-img-wrap">
                  <img src={prop.image_url} alt={prop.title} className="rec-img" />
                  <div
                    className="rec-rank"
                    style={{ background: RANK_COLORS[idx] ?? '#6b7280' }}
                  >
                    #{idx + 1}
                  </div>
                </div>
              )}
              {!prop.image_url && (
                <div
                  className="rec-rank rec-rank-no-img"
                  style={{ background: RANK_COLORS[idx] ?? '#6b7280' }}
                >
                  #{idx + 1}
                </div>
              )}

              <div className="rec-body">
                <h3 className="rec-name">{prop.title}</h3>
                <p className="rec-area">
                  <MapPin size={11} /> {prop.location.area} · {prop.type}{bhkLabel}
                </p>

                <div className="rec-stats">
                  <div className="stat">
                    <span className="stat-val">₹{prop.rent_price.toLocaleString('en-IN')}</span>
                    <span className="stat-lbl">/mo</span>
                  </div>
                  {commuteMin !== null && (
                    <div className="stat">
                      <Clock size={11} />
                      <span className="stat-val">{commuteMin}</span>
                      <span className="stat-lbl">min</span>
                    </div>
                  )}
                  <div className="stat">
                    <Star size={11} />
                    <span className="stat-val">{prop.rating}</span>
                  </div>
                </div>

                <div className="rec-score-bar">
                  <div className="score-fill" style={{ width: `${score}%` }} />
                  <span className="score-text">{score.toFixed(1)}</span>
                </div>

                {transportCost !== null && (
                  <p className="rec-cost">
                    <Fuel size={11} /> Transport: ₹{Math.round(transportCost).toLocaleString('en-IN')}/mo
                  </p>
                )}

                {topAmenities.length > 0 && (
                  <div className="rec-tags">
                    {topAmenities.map((a, i) => (
                      <span key={i} className="tag">{a.name}</span>
                    ))}
                  </div>
                )}

                <div className="rec-nav-buttons">
                  <button
                    type="button"
                    className="nav-btn nav-btn-map"
                    onClick={(e) => { e.stopPropagation(); onNavigate(prop); }}
                  >
                    <Navigation2 size={12} /> Navigate
                  </button>
                  <a
                    href={getGoogleMapsUrl(prop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-btn nav-btn-google"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} /> Google Maps
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

/**
 * PropertyDetailModal — full-screen overlay showing all property fields.
 */

import type { Property } from '@/types/property';
import {
  X, MapPin, Home, IndianRupee, Users, Calendar,
  Wifi, Car, Star, Building, Layers,
} from 'lucide-react';

interface Props {
  property: Property;
  onClose: () => void;
}

export default function PropertyDetailModal({ property: p, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        {/* Image */}
        {p.image_url && <img src={p.image_url} alt={p.title} className="modal-img" />}

        {/* Content */}
        <div className="modal-body">
          <h2 className="modal-title">{p.title}</h2>
          <p className="modal-addr"><MapPin size={13} /> {p.location.address}, {p.location.area}</p>

          {/* Rent highlight */}
          <div className="modal-rent-strip">
            <span className="modal-rent-label">Monthly Rent</span>
            <span className="modal-rent-amount">
              <IndianRupee size={18} />{p.rent_price.toLocaleString('en-IN')}<span className="modal-rent-mo">/mo</span>
            </span>
          </div>

          {/* Details grid */}
          <div className="modal-grid">
            <div className="modal-detail"><Home size={13} /><span className="modal-detail-label">Type</span><span className="modal-detail-val">{p.type}</span></div>
            <div className="modal-detail"><Layers size={13} /><span className="modal-detail-label">BHK</span><span className="modal-detail-val">{p.bhk || '-'}</span></div>
            <div className="modal-detail"><Users size={13} /><span className="modal-detail-label">Gender</span><span className="modal-detail-val">{p.gender_preference}</span></div>
            <div className="modal-detail"><Star size={13} /><span className="modal-detail-label">Rating</span><span className="modal-detail-val">{p.rating} / 5</span></div>
            <div className="modal-detail"><Calendar size={13} /><span className="modal-detail-label">Available</span><span className="modal-detail-val">{p.available_from || 'Immediately'}</span></div>
            <div className="modal-detail"><Building size={13} /><span className="modal-detail-label">For Sale</span><span className="modal-detail-val">{p.is_for_sale ? 'Yes' : 'No'}</span></div>
          </div>

          {/* Amenities */}
          {(p.amenities.in_unit.length > 0 || p.amenities.shared.length > 0) && (
            <div className="modal-section">
              <h3 className="modal-section-title"><Wifi size={14} /> Amenities</h3>
              {p.amenities.in_unit.length > 0 && (
                <div className="modal-amenity-group">
                  <span className="modal-amenity-label">In-Unit:</span>
                  <div className="modal-chips">{p.amenities.in_unit.map((a) => <span key={a} className="modal-chip">{a.replace(/_/g, ' ')}</span>)}</div>
                </div>
              )}
              {p.amenities.shared.length > 0 && (
                <div className="modal-amenity-group">
                  <span className="modal-amenity-label">Shared:</span>
                  <div className="modal-chips">{p.amenities.shared.map((a) => <span key={a} className="modal-chip">{a.replace(/_/g, ' ')}</span>)}</div>
                </div>
              )}
            </div>
          )}

          {/* Transport */}
          {p.transport_modes.length > 0 && (
            <div className="modal-section">
              <h3 className="modal-section-title"><Car size={14} /> Transport</h3>
              <div className="modal-chips">{p.transport_modes.map((t) => <span key={t} className="modal-chip">{t}</span>)}</div>
            </div>
          )}

          {/* Nearby */}
          {p.nearby.length > 0 && (
            <div className="modal-section">
              <h3 className="modal-section-title"><MapPin size={14} /> Nearby</h3>
              <div className="modal-nearby-list">
                {p.nearby.map((n, i) => (
                  <div key={i} className="modal-nearby-item">
                    <span>{n.name}</span>
                    <span className="modal-nearby-dist">{n.distance_km} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Owner */}
          {p.owner && (
            <div className="modal-section">
              <h3 className="modal-section-title"><Users size={14} /> Owner</h3>
              <p>{p.owner.name} {p.owner.verified ? '(Verified)' : ''}</p>
              {p.owner.contact && <p className="modal-contact">{p.owner.contact}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

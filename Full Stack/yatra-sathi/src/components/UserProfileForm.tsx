'use client';

/**
 * Sidebar form with Lucide icons, accommodation preferences,
 * and expandable filters.
 */

import { useState, type FormEvent } from 'react';
import {
  Home, MapPin, Briefcase, GraduationCap, Bike, Car, Bus,
  X, Filter, ChevronRight, Search, Navigation, Hospital,
  ShoppingCart, School, CircleDot,
} from 'lucide-react';
import type { UserProfile } from '@/types/user';
import type { TransportMode, PropertyFilters, AccommodationPreference } from '@/types/property';

interface UserProfileFormProps {
  onSubmit: (profile: Omit<UserProfile, 'currentLocation'>) => void;
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  hasLocation: boolean;
  locationLabel: string;
  onUseLiveLocation: () => void;
  isLocating: boolean;
}

export default function UserProfileForm({
  onSubmit,
  filters,
  onFiltersChange,
  hasLocation,
  locationLabel,
  onUseLiveLocation,
  isLocating,
}: UserProfileFormProps) {
  const [occupation, setOccupation] = useState<'student' | 'job'>('job');
  const [preferredTransport, setPreferredTransport] = useState<TransportMode>('bike');
  const [maxRentBudget, setMaxRentBudget] = useState<number | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [accommodationPrefs, setAccommodationPrefs] = useState<AccommodationPreference[]>(['none']);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!hasLocation) {
      alert('Please set your location first — click the map or use live location.');
      return;
    }
    onSubmit({
      occupation,
      preferredTransport,
      maxRentBudget: maxRentBudget || undefined,
      accommodationPrefs,
    });
  };

  const toggleAccommodationPref = (pref: AccommodationPreference) => {
    if (pref === 'none') {
      setAccommodationPrefs(['none']);
      return;
    }
    const filtered = accommodationPrefs.filter((p) => p !== 'none');
    if (filtered.includes(pref)) {
      const next = filtered.filter((p) => p !== pref);
      setAccommodationPrefs(next.length === 0 ? ['none'] : next);
    } else {
      setAccommodationPrefs([...filtered, pref]);
    }
  };

  const transportOptions: { mode: TransportMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'bike', icon: <Bike size={14} />, label: 'Bike' },
    { mode: 'car', icon: <Car size={14} />, label: 'Car' },
    { mode: 'bus', icon: <Bus size={14} />, label: 'Bus' },
    { mode: 'none', icon: <X size={14} />, label: '' },
  ];

  return (
    <form onSubmit={handleSubmit} className="sidebar-form">
      <div className="form-header">
        <h1 className="form-logo">
          <Home size={24} className="logo-icon-svg" />
          Yatra Sathi
        </h1>
        <p className="form-tagline">Commute-friendly stays in Nagpur</p>
      </div>

      {/* Location */}
      <div className="location-section">
        {hasLocation ? (
          <div className="loc-set">
            <CircleDot size={16} className="loc-icon-active" />
            <div>
              <span className="loc-label">Your location</span>
              <span className="loc-value">{locationLabel}</span>
            </div>
          </div>
        ) : (
          <div className="loc-set loc-pending">
            <CircleDot size={16} className="loc-icon-pending" />
            <div>
              <span className="loc-label">No location set</span>
              <span className="loc-value">Click the map or use live location</span>
            </div>
          </div>
        )}
        <button
          type="button"
          className="live-loc-btn"
          onClick={onUseLiveLocation}
          disabled={isLocating}
        >
          <Navigation size={14} />
          {isLocating ? 'Locating...' : 'Use Live Location'}
        </button>
      </div>

      <div className="form-divider" />

      {/* Occupation */}
      <div className="fg">
        <label htmlFor="occupation">Occupation</label>
        <select
          id="occupation"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value as 'student' | 'job')}
        >
          <option value="job">Working Professional</option>
          <option value="student">Student</option>
        </select>
      </div>

      {/* Transport */}
      <div className="fg">
        <label>Traveling Preference</label>
        <div className="transport-chips">
          {transportOptions.map(({ mode, icon, label }) => (
            <button
              key={mode}
              type="button"
              className={`chip ${preferredTransport === mode ? 'chip-active' : ''}`}
              onClick={() => setPreferredTransport(mode)}
              title={mode === 'none' ? 'Not Specified' : label}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Rent */}
      <div className="fg">
        <label htmlFor="rent">Max Rent Budget (₹)</label>
        <input
          id="rent"
          type="number"
          min={0}
          value={maxRentBudget ?? ''}
          onChange={(e) => setMaxRentBudget(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Optional"
        />
      </div>

      {/* Accommodation Preferences */}
      <div className="fg">
        <label>Nearby Preferences</label>
        <div className="transport-chips">
          <button
            type="button"
            className={`chip ${accommodationPrefs.includes('none') ? 'chip-active' : ''}`}
            onClick={() => toggleAccommodationPref('none')}
          >
            <X size={14} />
          </button>
          <button
            type="button"
            className={`chip ${accommodationPrefs.includes('hospital') ? 'chip-active' : ''}`}
            onClick={() => toggleAccommodationPref('hospital')}
          >
            <Hospital size={14} /> Hospital
          </button>
          <button
            type="button"
            className={`chip ${accommodationPrefs.includes('supermarket') ? 'chip-active' : ''}`}
            onClick={() => toggleAccommodationPref('supermarket')}
          >
            <ShoppingCart size={14} /> Market
          </button>
          <button
            type="button"
            className={`chip ${accommodationPrefs.includes('school') ? 'chip-active' : ''}`}
            onClick={() => toggleAccommodationPref('school')}
          >
            <School size={14} /> School
          </button>
        </div>
      </div>

      <div className="form-divider" />

      {/* Expandable Filters */}
      <button
        type="button"
        className="filters-toggle"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <span className="filters-toggle-label">
          <Filter size={14} /> Filters
        </span>
        <ChevronRight size={14} className={`toggle-arrow ${filtersOpen ? 'open' : ''}`} />
      </button>

      {filtersOpen && (
        <div className="filters-panel">
          <div className="filter-group">
            <span className="filter-label">Gender</span>
            <div className="filter-chips">
              {(['all', 'female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`fchip ${filters.gender === g ? 'fchip-active' : ''}`}
                  onClick={() => onFiltersChange({ ...filters, gender: g })}
                >
                  {g === 'all' ? 'All' : g === 'female' ? '♀ Female' : '♂ Male'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Property Type</span>
            <div className="filter-chips">
              {(['all', 'PG', 'FLAT', 'HOUSE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`fchip ${filters.propertyType === t ? 'fchip-active' : ''}`}
                  onClick={() => onFiltersChange({ ...filters, propertyType: t })}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Listing Type</span>
            <div className="filter-chips">
              {(['all', 'rent', 'buy'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`fchip ${filters.listingType === l ? 'fchip-active' : ''}`}
                  onClick={() => onFiltersChange({ ...filters, listingType: l })}
                >
                  {l === 'all' ? 'All' : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className={`submit-btn ${!hasLocation ? 'submit-btn-disabled' : ''}`}
        disabled={!hasLocation}
      >
        <Search size={16} /> Find Best Properties
      </button>
    </form>
  );
}

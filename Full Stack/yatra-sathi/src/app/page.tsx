'use client';

/**
 * Main page — map-first layout.
 * Sidebar: form → results. Map fills the rest.
 * Recommendations render in the sidebar after submit.
 */

import { useState, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import {
  Home as HomeIcon, MapPin, Bike, Car, Bus, X, DollarSign, RotateCcw,
  GripVertical,
} from 'lucide-react';
import UserProfileForm from '@/components/UserProfileForm';
import MapView, { type MapViewHandle } from '@/components/MapView';
import RecommendationPanel from '@/components/RecommendationPanel';
import type { UserProfile } from '@/types/user';
import type { Property, PropertyData, PropertyFilters } from '@/types/property';

import propertyDataJson from '../../Data/property.json';

const propertyData = propertyDataJson as unknown as PropertyData;

const DEFAULT_FILTERS: PropertyFilters = {
  gender: 'all',
  propertyType: 'all',
  listingType: 'all',
};

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [isLocating, setIsLocating] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const mapViewRef = useRef<MapViewHandle | null>(null);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, label: string) => {
      setSelectedLocation({ lat, lng, label });
      if (userProfile) {
        setUserProfile((prev) =>
          prev ? { ...prev, currentLocation: { lat, lng, label } } : null
        );
      }
      // Place marker on map if available
      if (mapInstanceRef.current) {
        // The MapView component handles this internally
      }
    },
    [userProfile]
  );

  /** Hardcoded live location — Tulsiram Gaikwad Patil College */
  const LIVE_LOCATION = {
    lat: 20.9603,
    lng: 79.0149,
    label: 'Tulsiram Gaikwad Patil College, Nagpur',
  } as const;

  const handleUseLiveLocation = useCallback(() => {
    const { lat, lng, label } = LIVE_LOCATION;
    setIsLocating(true);
    // Place marker directly, no API needed
    setTimeout(() => {
      handleLocationSelect(lat, lng, label);
      mapViewRef.current?.placeUserMarker(lat, lng);
      setIsLocating(false);
    }, 300); // small delay for UX feedback
  }, [handleLocationSelect]);

  const handleFormSubmit = (partial: Omit<UserProfile, 'currentLocation'>) => {
    if (!selectedLocation) return;
    setUserProfile({
      ...partial,
      currentLocation: selectedLocation,
    });
    setIsFormSubmitted(true);
  };

  const handleReset = () => {
    setIsFormSubmitted(false);
    setUserProfile(null);
    setFilteredProperties([]);
    setScores(new Map());
  };

  const handleResultsComputed = useCallback(
    (filtered: Property[], scoreMap: Map<string, number>) => {
      setFilteredProperties(filtered);
      setScores(scoreMap);
    },
    []
  );

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    mapInstanceRef.current = map;
  }, []);

  /** Draw route on map from user to property */
  const handleNavigate = useCallback(
    async (property: Property) => {
      const map = mapInstanceRef.current;
      if (!map || !userProfile) return;

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const from = `${userProfile.currentLocation.lng},${userProfile.currentLocation.lat}`;
      const to = `${property.location.lng},${property.location.lat}`;

      try {
        const res = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${from};${to}?geometries=geojson&access_token=${token}`
        );
        const data = await res.json();
        const route = data.routes?.[0]?.geometry;
        if (!route) return;

        if (map.getSource('route')) {
          (map.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: route,
          });
        } else {
          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: route },
          });
          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.8,
            },
          });
        }

        const coords = route.coordinates as [number, number][];
        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, { padding: 80 });
      } catch (err) {
        console.error('Route error:', err);
      }
    },
    [userProfile]
  );

  const transportIcon = (mode: string) => {
    switch (mode) {
      case 'bike': return <Bike size={14} />;
      case 'car': return <Car size={14} />;
      case 'bus': return <Bus size={14} />;
      default: return <X size={14} />;
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        {!isFormSubmitted ? (
          <UserProfileForm
            onSubmit={handleFormSubmit}
            filters={filters}
            onFiltersChange={setFilters}
            hasLocation={!!selectedLocation}
            locationLabel={selectedLocation?.label ?? ''}
            onUseLiveLocation={handleUseLiveLocation}
            isLocating={isLocating}
          />
        ) : (
          <div className="sidebar-submitted">
            <div className="form-header">
              <h1 className="form-logo">
                <HomeIcon size={22} className="logo-icon-svg" />
                Yatra Sathi
              </h1>
            </div>
            <div className="submitted-info">
              <div className="submitted-details">
                <div className="detail-row">
                  <MapPin size={14} className="detail-icon-svg" />
                  <span className="detail-text">{userProfile?.currentLocation.label}</span>
                </div>
                <div className="detail-row">
                  {transportIcon(userProfile?.preferredTransport ?? '')}
                  <span className="detail-text">
                    {userProfile?.preferredTransport === 'none'
                      ? 'No transport pref'
                      : userProfile?.preferredTransport &&
                        userProfile.preferredTransport.charAt(0).toUpperCase() +
                          userProfile.preferredTransport.slice(1)}
                  </span>
                </div>
                {userProfile?.maxRentBudget && (
                  <div className="detail-row">
                    <DollarSign size={14} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                    <span className="detail-text">
                      Max ₹{userProfile.maxRentBudget.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Active filters */}
              <div className="active-filters">
                {filters.gender !== 'all' && (
                  <span className="active-filter-tag">
                    {filters.gender === 'female' ? '♀' : '♂'} {filters.gender}
                  </span>
                )}
                {filters.propertyType !== 'all' && (
                  <span className="active-filter-tag">{filters.propertyType}</span>
                )}
                {filters.listingType !== 'all' && (
                  <span className="active-filter-tag">{filters.listingType}</span>
                )}
              </div>

              <button className="change-btn" onClick={handleReset}>
                <RotateCcw size={14} /> Change Preferences
              </button>

              <div className="form-divider" />

              {/* Recommendations — now in sidebar */}
              <div className="sidebar-results">
                <RecommendationPanel
                  filteredProperties={filteredProperties}
                  userProfile={userProfile!}
                  scores={scores}
                  onNavigate={handleNavigate}
                />
                <p className="results-count">
                  Showing {filteredProperties.length} of {propertyData.properties.length} properties
                </p>
              </div>

              <p className="drag-hint">
                <GripVertical size={12} /> Drag the pin to update location
              </p>
            </div>
          </div>
        )}
      </aside>

      <main className="map-main">
        <MapView
          ref={mapViewRef}
          propertyData={propertyData}
          userProfile={userProfile}
          onLocationSelect={handleLocationSelect}
          isFormSubmitted={isFormSubmitted}
          filters={filters}
          onResultsComputed={handleResultsComputed}
          onMapReady={handleMapReady}
        />
      </main>
    </div>
  );
}

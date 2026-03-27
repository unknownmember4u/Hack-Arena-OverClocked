'use client';

/**
 * MapView — Full-screen map with circular property pins.
 * Exposes placeUserMarker via ref for external calls (live location).
 */

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { initMap } from '@/map/mapSetup';
import { MarkerManager } from '@/map/markerManager';
import { filterProperties } from '@/map/filterEngine';
import { drawCommuteZone, removeCommuteZone } from '@/map/isochroneLayer';
import { calculateFeasibilityScore } from '@/map/feasibilityEngine';
import { calculateCommuteMinutes } from '@/utils/geo';

import type { Property, PropertyData, NearbyAmenity, PropertyFilters } from '@/types/property';
import type { UserProfile } from '@/types/user';

export interface MapViewHandle {
  placeUserMarker: (lat: number, lng: number) => void;
}

interface MapViewProps {
  propertyData: PropertyData;
  userProfile: UserProfile | null;
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  isFormSubmitted: boolean;
  filters: PropertyFilters;
  onResultsComputed: (filtered: Property[], scores: Map<string, number>) => void;
  onMapReady: (map: mapboxgl.Map) => void;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { propertyData, userProfile, onLocationSelect, isFormSubmitted, filters, onResultsComputed, onMapReady },
  ref
) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerManagerRef = useRef<MarkerManager>(new MarkerManager());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const customMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const res = await fetch(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + ',' + lat + '.json?access_token=' + token + '&limit=1'
      );
      const data = await res.json();
      return data.features?.[0]?.place_name ?? (lat.toFixed(4) + ', ' + lng.toFixed(4));
    } catch {
      return lat.toFixed(4) + ', ' + lng.toFixed(4);
    }
  }, []);

  const placeUserMarker = useCallback((lat: number, lng: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lng, lat]);
    } else {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      userMarkerRef.current = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);
      userMarkerRef.current.on('dragend', async () => {
        const lngLat = userMarkerRef.current!.getLngLat();
        const label = await reverseGeocode(lngLat.lat, lngLat.lng);
        onLocationSelect(lngLat.lat, lngLat.lng, label);
      });
    }
    map.easeTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13) });
  }, [onLocationSelect, reverseGeocode]);

  useImperativeHandle(ref, () => ({ placeUserMarker }), [placeUserMarker]);

  /** Build circular image pin with no text below */
  const buildPropertyPin = (prop: Property): HTMLElement => {
    const container = document.createElement('div');
    container.className = 'property-pin-card';
    container.setAttribute('data-property-id', prop.id);

    const img = document.createElement('div');
    img.className = 'pin-card-img';
    if (prop.image_url) {
      img.style.backgroundImage = 'url(' + prop.image_url + ')';
    }
    container.appendChild(img);

    // Price overlay bottom-centre of circle
    const priceEl = document.createElement('div');
    priceEl.className = 'pin-price-overlay';
    priceEl.textContent = '\u20b9' + ((prop.rent_price || 0) / 1000).toFixed(0) + 'k';
    container.appendChild(priceEl);

    return container;
  };

  /** Build popup HTML using string concatenation */
  const buildPopupHtml = (prop: Property): string => {
    const imgPart = prop.image_url
      ? '<img src="' + prop.image_url + '" class="popup-img" alt="' + prop.title + '" loading="lazy" />'
      : '<div class="popup-img-placeholder"></div>';

    const rentFormatted = '\u20b9' + (prop.rent_price || 0).toLocaleString('en-IN');
    const bhkText   = prop.bhk ? prop.bhk + ' BHK' : '-';
    const typeText  = prop.type || '-';
    const areaText  = prop.location?.area || '';
    const availText = prop.available_from ? prop.available_from : 'Immediately';
    const nearbyCount = (prop.nearby?.length || 0) + ' amenities';

    const detailRow = (label: string, value: string) =>
      '<div class="popup-detail-row"><span class="popup-detail-label">' + label + '</span><span class="popup-detail-value">' + value + '</span></div>';

    return (
      '<div class="popup-content">'
      // Image
      + '<div class="popup-img-wrap">' + imgPart + '</div>'
      // Rent highlight strip
      + '<div class="popup-rent-highlight">'
      + '<span class="popup-rent-label">Monthly Rent</span>'
      + '<span class="popup-rent-amount">' + rentFormatted + '<span class="popup-rent-mo">/mo</span></span>'
      + '</div>'
      // Body
      + '<div class="popup-body">'
      + '<h3 class="popup-title">' + prop.title + '</h3>'
      + '<p class="popup-addr">' + (prop.location?.address || '') + '</p>'
      + '<div class="popup-divider"></div>'
      + '<div class="popup-details-grid">'
      + detailRow('Type', typeText)
      + detailRow('Size', bhkText)
      + detailRow('Area', areaText)
      + detailRow('Available', availText)
      + detailRow('Rating', prop.rating + ' / 5')
      + detailRow('Nearby', nearbyCount)
      + '</div>'
      + '<div class="popup-chips" style="margin-top:6px">'
      + '<span class="popup-chip popup-chip-gender">' + prop.gender_preference + '</span>'
      + '</div>'
      + '</div>'
      + '</div>'
    );
  };

  const addEnhancedPropertyMarkers = useCallback((map: mapboxgl.Map, properties: Property[]) => {
    customMarkersRef.current.forEach((m) => m.remove());
    customMarkersRef.current = [];

    properties.forEach((prop) => {
      if (!prop.location?.lat || !prop.location?.lng) return;
      const el = buildPropertyPin(prop);

      const popup = new mapboxgl.Popup({
        offset: 50,
        maxWidth: '300px',
        closeButton: true,
        closeOnClick: false,
      }).setHTML(buildPopupHtml(prop));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([prop.location.lng, prop.location.lat])
        .setPopup(popup)
        .addTo(map);

      customMarkersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = initMap('map-container');
    mapRef.current = map;

    map.on('load', () => {
      onMapReady(map);
      map.setPitch(45);
      map.setBearing(-17.6);

      // 3D buildings
      const layers = map.getStyle()?.layers ?? [];
      let labelLayerId: string | undefined;
      for (const layer of layers) {
        if (layer.type === 'symbol' && (layer.layout as Record<string, unknown>)?.['text-field']) {
          labelLayerId = layer.id;
          break;
        }
      }
      try {
        map.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'height'], 0, '#1e293b', 50, '#334155', 100, '#475569'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.7,
          },
        }, labelLayerId);
      } catch { /* buildings may not exist on this style tile */ }

      // Sky
      map.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6,
      });

      const work = propertyData.meta.default_work_location;
      markerManagerRef.current.addWorkplaceMarker(map, { lat: work.lat, lng: work.lng });
      addEnhancedPropertyMarkers(map, propertyData.properties);

      const allAmenities: NearbyAmenity[] = propertyData.properties.flatMap((p) => p.nearby);
      markerManagerRef.current.addAmenityMarkers(map, allAmenities);
    });

    map.on('click', async (e) => {
      const target = e.originalEvent.target as HTMLElement;
      if (target.closest('.property-pin-card') || target.closest('.mapboxgl-popup')) return;

      const { lat, lng } = e.lngLat;
      placeUserMarker(lat, lng);
      const label = await reverseGeocode(lat, lng);
      onLocationSelect(lat, lng, label);
    });

    return () => {
      if (mapRef.current) {
        markerManagerRef.current.clearAll();
        customMarkersRef.current.forEach((m) => m.remove());
        customMarkersRef.current = [];
        userMarkerRef.current?.remove();
        userMarkerRef.current = null;
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userProfile || !mapRef.current || !isFormSubmitted) return;
    const map = mapRef.current;

    placeUserMarker(userProfile.currentLocation.lat, userProfile.currentLocation.lng);

    const filtered = filterProperties(propertyData.properties, userProfile, filters);
    addEnhancedPropertyMarkers(map, filtered);

    removeCommuteZone(map);
    if (userProfile.preferredTransport !== 'none' && filtered.length > 0) {
      const maxCommuteMin = Math.max(
        ...filtered.map((p) => calculateCommuteMinutes(
          userProfile.currentLocation.lat, userProfile.currentLocation.lng,
          p.location.lat, p.location.lng,
          userProfile.preferredTransport
        )),
        10
      );
      drawCommuteZone(map, { lat: userProfile.currentLocation.lat, lng: userProfile.currentLocation.lng }, maxCommuteMin, userProfile.preferredTransport);
    }

    const scoreMap = new Map<string, number>();
    filtered.forEach((prop) => {
      scoreMap.set(prop.id, calculateFeasibilityScore(prop, userProfile, propertyData.feasibility_score_weights));
    });
    onResultsComputed(filtered, scoreMap);

    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userProfile.currentLocation.lng, userProfile.currentLocation.lat]);
    filtered.forEach((p) => bounds.extend([p.location.lng, p.location.lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 14 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, isFormSubmitted, propertyData, placeUserMarker, addEnhancedPropertyMarkers, filters]);

  return (
    <div className="map-area">
      <div id="map-container" ref={mapContainerRef} className="map-canvas" />
    </div>
  );
});

export default MapView;

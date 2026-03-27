/**
 * Mapbox GL JS map initialization — enhanced with all available controls.
 */

import mapboxgl from 'mapbox-gl';

/** Tulsiram Gaikwad Patil College — default user location */
const DEFAULT_CENTER: [number, number] = [79.0149, 20.9603]; // [lng, lat]
const DEFAULT_ZOOM = 12;
const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

export function initMap(containerId: string): mapboxgl.Map {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN is not set. Add it to your .env file.');
  }

  mapboxgl.accessToken = token;

  const map = new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    // Smooth interaction limits
    minZoom: 8,
    maxZoom: 20,
    // Enable all pointer gestures
    touchZoomRotate: true,
    touchPitch: true,
    // Attribution compact mode
    attributionControl: false,
  });

  // ── Controls ──────────────────────────────────────────────────

  // Zoom + rotate compass (top-right)
  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

  // Full-screen button (top-right)
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

  // Scale bar (bottom-left)
  map.addControl(
    new mapboxgl.ScaleControl({ maxWidth: 120, unit: 'metric' }),
    'bottom-left'
  );

  // Compact attribution (bottom-right)
  map.addControl(
    new mapboxgl.AttributionControl({ compact: true }),
    'bottom-right'
  );

  // ── Interaction enhancements ───────────────────────────────────

  // Double-click zoom
  map.doubleClickZoom.enable();

  // Keyboard navigation
  map.keyboard.enable();

  // Smooth scroll zoom
  map.scrollZoom.setWheelZoomRate(1 / 250);

  return map;
}

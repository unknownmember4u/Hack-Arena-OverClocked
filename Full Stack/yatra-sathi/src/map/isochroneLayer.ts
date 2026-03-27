/**
 * Task 4 — Isochrone / commute-zone circle layer.
 *
 * Draws a filled circle on the map representing the area reachable
 * within the user's max commute time for their chosen transport mode.
 * Uses @turf/turf for GeoJSON circle generation.
 */

import * as turf from '@turf/turf';
import type mapboxgl from 'mapbox-gl';
import type { TransportMode } from '@/types/property';
import { TRANSPORT_SPEEDS } from '@/utils/geo';

const SOURCE_ID = 'commute-zone-source';
const FILL_LAYER_ID = 'commute-zone-fill';
const STROKE_LAYER_ID = 'commute-zone-stroke';

/**
 * Draws a circular commute zone on the map.
 *
 * @param map            - The Mapbox map instance.
 * @param center         - `{ lat, lng }` centre of the circle (work location).
 * @param commuteTimeMin - Maximum commute time in minutes.
 * @param transportMode  - The selected transport mode.
 */
export function drawCommuteZone(
  map: mapboxgl.Map,
  center: { lat: number; lng: number },
  commuteTimeMin: number,
  transportMode: TransportMode
): void {
  // Remove existing layers first
  removeCommuteZone(map);

  const speed = TRANSPORT_SPEEDS[transportMode] ?? 20;
  const radiusKm = (commuteTimeMin / 60) * speed;

  // turf.circle expects [lng, lat]
  const circle = turf.circle([center.lng, center.lat], radiusKm, {
    steps: 80,
    units: 'kilometers',
  });

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: circle,
  });

  // Semi-transparent blue fill
  map.addLayer({
    id: FILL_LAYER_ID,
    type: 'fill',
    source: SOURCE_ID,
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0.2,
    },
  });

  // Blue stroke
  map.addLayer({
    id: STROKE_LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    paint: {
      'line-color': '#2563eb',
      'line-width': 2,
      'line-opacity': 0.7,
    },
  });
}

/**
 * Removes the commute zone layer and source from the map (if present).
 *
 * @param map - The Mapbox map instance.
 */
export function removeCommuteZone(map: mapboxgl.Map): void {
  if (map.getLayer(FILL_LAYER_ID)) {
    map.removeLayer(FILL_LAYER_ID);
  }
  if (map.getLayer(STROKE_LAYER_ID)) {
    map.removeLayer(STROKE_LAYER_ID);
  }
  if (map.getSource(SOURCE_ID)) {
    map.removeSource(SOURCE_ID);
  }
}

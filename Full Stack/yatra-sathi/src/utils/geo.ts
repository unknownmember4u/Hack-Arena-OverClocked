/**
 * GIS utility functions for distance and commute calculations.
 */

/** Average speeds (km/h) by transport mode */
export const TRANSPORT_SPEEDS: Record<string, number> = {
  bike: 35,
  car: 30,
  bus: 20,
} as const;

/** Cost per km by motorized transport mode */
export const TRANSPORT_COST_PER_KM: Record<string, number> = {
  bike: 3.5,
  car: 7.0,
} as const;

/** Flat monthly bus pass cost in INR */
export const BUS_MONTHLY_PASS = 800;

/**
 * Calculates the great-circle distance between two points
 * using the Haversine formula.
 *
 * @returns Distance in kilometres
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates estimated commute time in minutes between two points
 * for a given transport mode.
 */
export function calculateCommuteMinutes(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  transportMode: string
): number {
  const distKm = haversineDistance(fromLat, fromLng, toLat, toLng);
  const speed = TRANSPORT_SPEEDS[transportMode] ?? 20;
  return Math.round((distKm / speed) * 60);
}

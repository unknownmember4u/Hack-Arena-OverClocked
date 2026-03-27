/**
 * Feasibility score engine — supports 'none' transport bypass
 * and accommodation preference boosting.
 */

import type { Property, FeasibilityWeights } from '@/types/property';
import type { UserProfile } from '@/types/user';
import {
  haversineDistance,
  clamp,
  TRANSPORT_COST_PER_KM,
  BUS_MONTHLY_PASS,
  calculateCommuteMinutes,
} from '@/utils/geo';

const DEFAULT_WEIGHTS: FeasibilityWeights = {
  commute_time: 0.30,
  transport_cost: 0.15,
  rent_to_salary_ratio: 0.20,
  amenity_score: 0.15,
  rating: 0.10,
};

/** Extra weight given to accommodation preference proximity */
const ACCOMMODATION_WEIGHT = 0.10;

const MAX_COMMUTE_NORM = 60;

/**
 * Calculates feasibility score with accommodation preference boosting.
 */
export function calculateFeasibilityScore(
  property: Property,
  userProfile: UserProfile,
  weights: FeasibilityWeights = DEFAULT_WEIGHTS
): number {
  const isTransportNone = userProfile.preferredTransport === 'none';

  let commuteScore = 0.5;
  let transportCostScore = 0.5;

  if (!isTransportNone) {
    const commuteMin = calculateCommuteMinutes(
      userProfile.currentLocation.lat,
      userProfile.currentLocation.lng,
      property.location.lat,
      property.location.lng,
      userProfile.preferredTransport
    );
    commuteScore = clamp(1 - commuteMin / MAX_COMMUTE_NORM, 0, 1);

    const transportCostMonthly = calculateMonthlyTransportCost(property, userProfile);
    transportCostScore = clamp(1 - transportCostMonthly / 5000, 0, 1);
  }

  const salary = 20000;
  const rentRatio = property.rent_price / salary;
  const rentScore = clamp(1 - rentRatio / 0.4, 0, 1);

  const amenityScore = Math.min(property.nearby.length / 5, 1);
  const ratingScore = property.rating / 5;

  // Accommodation preference score — based on proximity of preferred amenities
  let accommodationScore = 0;
  const prefs = userProfile.accommodationPrefs.filter((p) => p !== 'none');
  if (prefs.length > 0) {
    let totalProximity = 0;
    prefs.forEach((prefType) => {
      const matching = property.nearby.filter((a) => a.type === prefType);
      if (matching.length > 0) {
        // Closest amenity of this type — closer = higher score
        const closest = Math.min(...matching.map((a) => a.distance_km));
        totalProximity += clamp(1 - closest / 5, 0, 1); // Max 5km norm
      }
    });
    accommodationScore = totalProximity / prefs.length;
  } else {
    accommodationScore = 0.5; // neutral
  }

  const raw =
    commuteScore * weights.commute_time +
    transportCostScore * weights.transport_cost +
    rentScore * weights.rent_to_salary_ratio +
    amenityScore * weights.amenity_score +
    ratingScore * weights.rating +
    accommodationScore * ACCOMMODATION_WEIGHT;

  return Math.round(raw * 1000) / 10;
}

/**
 * Monthly transport cost. Returns 0 if transport is 'none'.
 */
export function calculateMonthlyTransportCost(
  property: Property,
  userProfile: UserProfile
): number {
  if (userProfile.preferredTransport === 'none') return 0;
  if (userProfile.preferredTransport === 'bus') return BUS_MONTHLY_PASS;

  const distanceKm = haversineDistance(
    userProfile.currentLocation.lat,
    userProfile.currentLocation.lng,
    property.location.lat,
    property.location.lng
  );

  const costPerKm = TRANSPORT_COST_PER_KM[userProfile.preferredTransport] ?? 3.5;
  return distanceKm * 2 * 22 * costPerKm;
}

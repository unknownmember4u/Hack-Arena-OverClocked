/**
 * User profile types — simplified.
 */

import type { TransportMode, AccommodationPreference } from './property';

/** User's current location */
export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
}

/** User profile — minimal */
export interface UserProfile {
  occupation: 'student' | 'job';
  currentLocation: UserLocation;
  preferredTransport: TransportMode;
  maxRentBudget?: number;
  /** Accommodation preferences — boosts score based on proximity */
  accommodationPrefs: AccommodationPreference[];
}

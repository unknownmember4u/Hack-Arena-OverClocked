/**
 * Type definitions for property data structures.
 */

/** Supported transport modes — 'none' means "Not Specified" */
export type TransportMode = 'bike' | 'car' | 'bus' | 'none';

/** Gender preference filter */
export type GenderPreference = 'male' | 'female' | 'any' | 'coed';

/** Nearby amenity types used as accommodation preferences */
export type AmenityType = 'hospital' | 'supermarket' | 'school' | 'college' | 'mall' | 'restaurant' | 'park' | 'metro_station' | 'bus_stop' | 'railway_station' | 'airport' | 'library' | 'market';

/** A nearby amenity */
export interface NearbyAmenity {
  type: string;
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
}

export interface Owner {
  name: string;
  contact: string;
  verified: boolean;
}

export interface Amenities {
  in_unit: string[];
  shared: string[];
}

export interface PropertyLocation {
  area: string;
  address: string;
  lat: number;
  lng: number;
}

/** A single property listing */
export interface Property {
  id: string;
  type: 'PG' | 'FLAT' | 'HOUSE';
  title: string;
  bhk?: number;
  location: PropertyLocation;
  rent_price: number;
  is_for_sale: boolean;
  selling_price: number | null;
  rooms?: number | null;
  gender_preference: GenderPreference;
  commute_time_min: number;
  transport_modes: TransportMode[];
  amenities: Amenities;
  nearby: NearbyAmenity[];
  owner: Owner;
  images: string[];
  /** Primary image URL for 3D pin texture */
  image_url?: string;
  rating: number;
  available_from: string;
}

export interface MotorizedTransportConfig {
  fuel_cost_per_km: number;
  avg_speed_kmh: number;
  description: string;
}

export interface BusTransportConfig {
  monthly_pass_cost: number;
  avg_speed_kmh: number;
  description: string;
}

export interface TransportCostConfig {
  bike: MotorizedTransportConfig;
  car: MotorizedTransportConfig;
  bus: BusTransportConfig;
}

export interface FeasibilityWeights {
  commute_time: number;
  transport_cost: number;
  rent_to_salary_ratio: number;
  amenity_score: number;
  rating: number;
}

export interface WorkLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface PropertyData {
  meta: {
    city: string;
    default_work_location: WorkLocation;
    currency: string;
    version: string;
  };
  properties: Property[];
  transport_cost_config: TransportCostConfig;
  feasibility_score_weights: FeasibilityWeights;
}

/** Active user filters for the sidebar */
export interface PropertyFilters {
  gender: 'male' | 'female' | 'all';
  propertyType: 'FLAT' | 'PG' | 'HOUSE' | 'all';
  listingType: 'rent' | 'buy' | 'all';
}

/** Accommodation preferences — nearby amenities the user cares about */
export type AccommodationPreference = 'hospital' | 'supermarket' | 'school' | 'none';

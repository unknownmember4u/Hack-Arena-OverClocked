/**
 * Property filtering engine.
 * Supports transport mode, rent, gender, property type, and listing type filters.
 */

import type { Property, PropertyFilters } from '@/types/property';
import type { UserProfile } from '@/types/user';

/**
 * Filters properties based on user preferences AND active sidebar filters.
 */
export function filterProperties(
  properties: Property[],
  userProfile: UserProfile,
  filters: PropertyFilters
): Property[] {
  return properties.filter((prop) => {
    // Transport mode — skip if "none" (Not Specified)
    if (
      userProfile.preferredTransport !== 'none' &&
      !(prop.transport_modes ?? []).includes(userProfile.preferredTransport)
    ) {
      return false;
    }

    // Rent budget
    if (
      userProfile.maxRentBudget !== undefined &&
      (prop.rent_price || 0) > userProfile.maxRentBudget
    ) {
      return false;
    }

    // Gender filter
    if (filters.gender !== 'all') {
      const gp = prop.gender_preference;
      if (gp !== 'any' && gp !== 'coed' && gp !== filters.gender) {
        return false;
      }
    }

    // Property type filter
    if (filters.propertyType !== 'all' && prop.type !== filters.propertyType) {
      return false;
    }

    // Listing type filter
    if (filters.listingType === 'buy' && !prop.is_for_sale) {
      return false;
    }
    if (filters.listingType === 'rent' && prop.is_for_sale && prop.selling_price && !prop.rent_price) {
      return false;
    }

    return true;
  });
}

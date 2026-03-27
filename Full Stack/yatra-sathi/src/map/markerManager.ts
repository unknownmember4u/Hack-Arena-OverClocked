/**
 * Task 2 — Marker manager for workplace, property, and amenity markers.
 *
 * Each marker type gets a distinct visual style and optional popup.
 */

import mapboxgl from 'mapbox-gl';
import type { Property, NearbyAmenity, TransportMode } from '@/types/property';

/** Emoji map for amenity types */
const AMENITY_ICONS: Record<string, string> = {
  hospital: '🏥',
  school: '🏫',
  college: '🎓',
  supermarket: '🛒',
  mall: '🏬',
  restaurant: '🍽️',
  park: '🌳',
  metro_station: '🚇',
  bus_stop: '🚌',
  railway_station: '🚂',
  airport: '✈️',
  library: '📚',
  market: '🏪',
};

/** Transport mode emoji */
const TRANSPORT_EMOJI: Record<TransportMode, string> = {
  bike: '🏍️',
  car: '🚗',
  bus: '🚌',
  none: '',
};

/** Callback type for property detail button clicks */
export type PropertyDetailCallback = (property: Property) => void;

/**
 * Manages all map markers — workplace, property, and amenity layers.
 */
export class MarkerManager {
  private workplaceMarker: mapboxgl.Marker | null = null;
  private propertyMarkers: mapboxgl.Marker[] = [];
  private amenityMarkers: mapboxgl.Marker[] = [];
  private onPropertyDetail: PropertyDetailCallback | null = null;

  /**
   * Register a callback that fires when the user clicks "View Details"
   * on a property popup.
   */
  setPropertyDetailCallback(cb: PropertyDetailCallback): void {
    this.onPropertyDetail = cb;
  }

  /**
   * Adds a blue pulsing marker at the workplace location.
   *
   * @param map  - The Mapbox map instance.
   * @param latlng - `{ lat, lng }` for the workplace.
   */
  addWorkplaceMarker(
    map: mapboxgl.Map,
    latlng: { lat: number; lng: number }
  ): void {
    // Remove previous if exists
    this.workplaceMarker?.remove();

    const el = document.createElement('div');
    el.className = 'workplace-marker';

    this.workplaceMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([latlng.lng, latlng.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          '<div class="popup-content"><strong>📍 Your Workplace</strong><p>MIHAN SEZ, Nagpur</p></div>'
        )
      )
      .addTo(map);
  }

  /**
   * Adds red markers for each property in the filtered list.
   * On click each marker shows a popup card.
   *
   * @param map        - The Mapbox map instance.
   * @param properties - Array of filtered properties to display.
   */
  addPropertyMarkers(map: mapboxgl.Map, properties: Property[]): void {
    this.clearPropertyMarkers();

    properties.forEach((prop) => {
      const el = document.createElement('div');
      el.className = 'property-marker';

      const typeLabel = this.formatPropertyType(prop);
      const transportIcons = prop.transport_modes
        .map((m) => TRANSPORT_EMOJI[m] ?? m)
        .join(' ');

      const popupHTML = `
        <div class="popup-content property-popup">
          <h3 class="popup-title">${prop.title}</h3>
          <p class="popup-type">${typeLabel}</p>
          <p class="popup-rent">Rent: ₹${prop.rent_price.toLocaleString('en-IN')}/mo</p>
          <p class="popup-commute">Commute: ${prop.commute_time_min} min ${transportIcons}</p>
          <p class="popup-rating">⭐ ${prop.rating.toFixed(1)}</p>
          <button class="popup-detail-btn" data-property-id="${prop.id}">View Details</button>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '260px' }).setHTML(popupHTML);

      // Attach event handler after popup opens
      popup.on('open', () => {
        const btn = document.querySelector(
          `button[data-property-id="${prop.id}"]`
        );
        btn?.addEventListener('click', () => {
          this.onPropertyDetail?.(prop);
        });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([prop.location.lng, prop.location.lat])
        .setPopup(popup)
        .addTo(map);

      this.propertyMarkers.push(marker);
    });
  }

  /**
   * Adds small amenity markers (categorised by emoji).
   *
   * @param map       - The Mapbox map instance.
   * @param amenities - Array of nearby amenity objects.
   */
  addAmenityMarkers(map: mapboxgl.Map, amenities: NearbyAmenity[]): void {
    this.clearAmenityMarkers();

    amenities.forEach((a) => {
      if (!a || !a.type || !a.lat || !a.lng) return;
      const el = document.createElement('div');
      el.className = 'amenity-marker';
      el.textContent = AMENITY_ICONS[a.type] ?? '📌';
      el.title = a.name;

      const popup = new mapboxgl.Popup({ offset: 15, maxWidth: '200px' }).setHTML(
        `<div class="popup-content"><strong>${AMENITY_ICONS[a.type] ?? ''} ${a.name}</strong><p>${a.distance_km} km away</p></div>`
      );

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([a.lng, a.lat])
        .setPopup(popup)
        .addTo(map);

      this.amenityMarkers.push(marker);
    });
  }

  /** Removes all markers from the map. */
  clearAll(): void {
    this.workplaceMarker?.remove();
    this.workplaceMarker = null;
    this.clearPropertyMarkers();
    this.clearAmenityMarkers();
  }

  /** Removes only property markers. */
  private clearPropertyMarkers(): void {
    this.propertyMarkers.forEach((m) => m.remove());
    this.propertyMarkers = [];
  }

  /** Removes only amenity markers. */
  private clearAmenityMarkers(): void {
    this.amenityMarkers.forEach((m) => m.remove());
    this.amenityMarkers = [];
  }

  /**
   * Formats a property's type string for display.
   * E.g. "FLAT 2BHK", "PG", "HOUSE 3BHK".
   */
  private formatPropertyType(prop: Property): string {
    const bhkLabel = prop.bhk ? ` ${prop.bhk}BHK` : '';
    return `${prop.type}${bhkLabel}`;
  }
}

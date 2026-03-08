/**
 * Google Maps Web Platform Declarations
 * Owner: Mei Lin (Type Safety Lead)
 *
 * Provides minimal type declarations for Google Maps JavaScript API
 * used in the web-only search/map view. Eliminates `(window as any).google` casts.
 */

interface GoogleMapsLatLng {
  lat: number;
  lng: number;
}

interface GoogleMapsMarker {
  setMap(map: GoogleMapsMap | null): void;
  addListener(event: string, handler: () => void): void;
}

interface GoogleMapsMap {
  setCenter(latLng: GoogleMapsLatLng): void;
  setZoom(zoom: number): void;
  fitBounds(bounds: GoogleMapsLatLngBounds): void;
}

interface GoogleMapsLatLngBounds {
  extend(latLng: GoogleMapsLatLng): void;
}

interface GoogleMapsNamespace {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapsMap;
    Marker: new (options: Record<string, unknown>) => GoogleMapsMarker;
    LatLngBounds: new () => GoogleMapsLatLngBounds;
  };
}

declare global {
  interface Window {
    google?: GoogleMapsNamespace;
    gm_authFailure?: () => void;
  }
}

export {};

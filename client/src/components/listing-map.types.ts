import type { FoodListing } from '@/lib/database.types';
import type { MapCoordinate } from '@/lib/geo';

export type ListingMapProps = {
  listings: FoodListing[];
  selectedListingId?: string | null;
  onSelect?: (listing: FoodListing) => void;
  searchCenter?: MapCoordinate | null;
  searchRadiusMiles?: number | null;
  showSelectedPickupRadius?: boolean;
  onMapCenterChange?: (latitude: number, longitude: number) => void;
  userLocationRequest?: number;
  onUserLocationFound?: (latitude: number, longitude: number) => void;
  onUserLocationError?: () => void;
};

export type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
};

export type AccountType = 'farmer' | 'provider';

export type FoodCategory =
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'prepared'
  | 'pantry'
  | 'other';

export type FoodUnit = 'items' | 'kg' | 'lb' | 'boxes' | 'bags' | 'meals';

export const PICKUP_RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;
export type PickupRadiusMiles = (typeof PICKUP_RADIUS_OPTIONS)[number];

export type ListingStatus = 'available' | 'reserved' | 'collected' | 'cancelled';

export type Profile = {
  id: string;
  account_type: AccountType;
  full_name: string;
  organization_name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type FoodListing = {
  id: string;
  posted_by: string;
  provider_name: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: number;
  unit: FoodUnit;
  image_url: string | null;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  pickup_radius_miles: PickupRadiusMiles;
  pickup_starts_at: string;
  pickup_ends_at: string;
  expires_at: string;
  status: ListingStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  collected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Pick<Profile, 'id' | 'account_type'> &
          Partial<Pick<Profile, 'full_name' | 'organization_name' | 'phone'>>;
        Update: Partial<Pick<Profile, 'full_name' | 'organization_name' | 'phone'>>;
        Relationships: [];
      };
      food_listings: {
        Row: FoodListing;
        Insert: Pick<
          FoodListing,
          | 'posted_by'
          | 'provider_name'
          | 'title'
          | 'category'
          | 'quantity'
          | 'unit'
          | 'pickup_address'
          | 'pickup_latitude'
          | 'pickup_longitude'
          | 'pickup_radius_miles'
          | 'pickup_starts_at'
          | 'pickup_ends_at'
          | 'expires_at'
        > &
          Partial<Pick<FoodListing, 'description' | 'image_url'>>;
        Update: Partial<
          Pick<
            FoodListing,
            | 'title'
            | 'description'
            | 'category'
            | 'quantity'
            | 'unit'
            | 'image_url'
            | 'pickup_address'
            | 'pickup_latitude'
            | 'pickup_longitude'
            | 'pickup_starts_at'
            | 'pickup_ends_at'
            | 'expires_at'
          >
        >;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      cancel_food_listing: {
        Args: { p_listing_id: string };
        Returns: string;
      };
      claim_food_listing: {
        Args: { p_listing_id: string };
        Returns: string;
      };
      complete_food_pickup: {
        Args: { p_listing_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

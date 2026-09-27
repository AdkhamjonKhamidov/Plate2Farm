import type { Session } from '@supabase/supabase-js';
import type { FoodListing, Profile } from './database.types';

export const DEMO_ACCOUNTS = [
  {
    email: 'farmer@plate2farm.demo',
    password: 'demo-farmer',
    profile: {
      id: 'demo-farmer',
      account_type: 'farmer',
      full_name: 'Maya Green',
      organization_name: 'Green Valley Farm',
      phone: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } satisfies Profile,
  },
  {
    email: 'provider@plate2farm.demo',
    password: 'demo-provider',
    profile: {
      id: 'demo-provider',
      account_type: 'provider',
      full_name: 'Jordan Lee',
      organization_name: 'Harvest Table Cafe',
      phone: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    } satisfies Profile,
  },
] as const;

const today = new Date();
const pickupStartsAt = new Date(today.getTime() + 2 * 60 * 60 * 1000).toISOString();
const pickupEndsAt = new Date(today.getTime() + 6 * 60 * 60 * 1000).toISOString();
const expiresAt = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

export const DEMO_LISTINGS: FoodListing[] = [
  {
    id: 'demo-listing-bakery',
    posted_by: 'demo-provider',
    provider_name: 'Harvest Table Cafe',
    title: 'Fresh sourdough & pastries',
    description: 'End-of-day bread and pastries, packed and ready for a farm pickup.',
    category: 'bakery',
    quantity: 24,
    unit: 'items',
    image_url: null,
    pickup_address: '18 Market Street',
    pickup_latitude: 40.7128,
    pickup_longitude: -74.006,
    pickup_radius_miles: 25,
    pickup_starts_at: pickupStartsAt,
    pickup_ends_at: pickupEndsAt,
    expires_at: expiresAt,
    status: 'available',
    claimed_by: null,
    claimed_at: null,
    collected_at: null,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
  {
    id: 'demo-listing-produce',
    posted_by: 'demo-provider',
    provider_name: 'Riverside Market',
    title: 'Seasonal mixed produce',
    description: 'A crate of tomatoes, greens, and herbs that needs a good home today.',
    category: 'produce',
    quantity: 6,
    unit: 'boxes',
    image_url: null,
    pickup_address: '42 River Road',
    pickup_latitude: 40.7282,
    pickup_longitude: -73.9942,
    pickup_radius_miles: 25,
    pickup_starts_at: pickupStartsAt,
    pickup_ends_at: pickupEndsAt,
    expires_at: expiresAt,
    status: 'available',
    claimed_by: null,
    claimed_at: null,
    collected_at: null,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
  {
    id: 'demo-listing-reserved',
    posted_by: 'demo-provider',
    provider_name: 'Harvest Table Cafe',
    title: 'Prepared grain bowls',
    description: 'Nutritious prepared meals available for a nearby farm crew.',
    category: 'prepared',
    quantity: 18,
    unit: 'meals',
    image_url: null,
    pickup_address: '18 Market Street',
    pickup_latitude: 40.7128,
    pickup_longitude: -74.006,
    pickup_radius_miles: 25,
    pickup_starts_at: pickupStartsAt,
    pickup_ends_at: pickupEndsAt,
    expires_at: expiresAt,
    status: 'reserved',
    claimed_by: 'demo-farmer',
    claimed_at: today.toISOString(),
    collected_at: null,
    created_at: today.toISOString(),
    updated_at: today.toISOString(),
  },
];

export function getDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (account) => account.email === normalizedEmail && account.password === password,
  );
}

export function isDemoSession(session: Session | null) {
  return session?.user.app_metadata.provider === 'demo';
}

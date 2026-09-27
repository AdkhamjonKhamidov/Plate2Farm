import type { FoodListing, Profile } from './database.types';
import { getSupabaseClient } from './supabase';
import { validateListing, type ListingInput } from './validation';

export async function getProfile(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }
  return data satisfies Profile;
}

export async function getAvailableListings() {
  const { data, error } = await getSupabaseClient()
    .from('food_listings')
    .select('*')
    .eq('status', 'available')
    .gt('expires_at', new Date().toISOString())
    .gt('pickup_ends_at', new Date().toISOString())
    .order('pickup_starts_at');

  if (error) {
    throw error;
  }
  return data satisfies FoodListing[];
}

export async function getProviderListings(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('food_listings')
    .select('*')
    .eq('posted_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data satisfies FoodListing[];
}

export async function getFarmerPickups(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('food_listings')
    .select('*')
    .eq('claimed_by', userId)
    .in('status', ['reserved', 'collected'])
    .order('claimed_at', { ascending: false });

  if (error) {
    throw error;
  }
  return data satisfies FoodListing[];
}

export async function createFoodListing(
  input: Omit<ListingInput, 'latitude' | 'longitude'> & {
    latitude: number;
    longitude: number;
  },
  profile: Profile,
) {
  if (profile.account_type !== 'provider') {
    throw new Error('Only food provider accounts can create listings.');
  }
  const validationError = validateListing(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const now = new Date();
  const pickupStartsAt =
    input.pickupWindow === 'today'
      ? now
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9);
  const pickupEndsAt =
    input.pickupWindow === 'today'
      ? new Date(now.getTime() + 4 * 60 * 60 * 1000)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11);

  const { data, error } = await getSupabaseClient()
    .from('food_listings')
    .insert({
      posted_by: profile.id,
      provider_name: profile.organization_name.trim() || profile.full_name,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      quantity: Number(input.quantity),
      unit: input.unit,
      pickup_address: input.pickupAddress.trim(),
      pickup_latitude: input.latitude,
      pickup_longitude: input.longitude,
      pickup_radius_miles: input.pickupRadiusMiles,
      pickup_starts_at: pickupStartsAt.toISOString(),
      pickup_ends_at: pickupEndsAt.toISOString(),
      expires_at: pickupEndsAt.toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function claimFoodListing(listingId: string) {
  const { error } = await getSupabaseClient().rpc('claim_food_listing', {
    p_listing_id: listingId,
  });
  if (error) {
    throw error;
  }
}

export async function completeFoodPickup(listingId: string) {
  const { error } = await getSupabaseClient().rpc('complete_food_pickup', {
    p_listing_id: listingId,
  });
  if (error) {
    throw error;
  }
}

export async function cancelFoodListing(listingId: string) {
  const { error } = await getSupabaseClient().rpc('cancel_food_listing', {
    p_listing_id: listingId,
  });
  if (error) {
    throw error;
  }
}

export async function updateProfile(
  userId: string,
  updates: Pick<Profile, 'full_name' | 'organization_name' | 'phone'>,
) {
  const { error } = await getSupabaseClient()
    .from('profiles')
    .update({
      full_name: updates.full_name.trim(),
      organization_name: updates.organization_name.trim(),
      phone: updates.phone.trim() || null,
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
  return getProfile(userId);
}

import {
  PICKUP_RADIUS_OPTIONS,
  type AccountType,
  type FoodCategory,
  type FoodUnit,
  type PickupRadiusMiles,
} from './database.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SignUpInput = {
  accountType: AccountType;
  fullName: string;
  organizationName: string;
  email: string;
  password: string;
};

export type ListingInput = {
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  unit: FoodUnit;
  pickupAddress: string;
  latitude: number | null;
  longitude: number | null;
  pickupRadiusMiles: PickupRadiusMiles;
  pickupWindow: 'today' | 'tomorrow';
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail.length <= 254 && EMAIL_PATTERN.test(normalizedEmail);
}

export function validateSignUp(input: SignUpInput) {
  if (input.fullName.trim().length < 2 || input.fullName.trim().length > 80) {
    return 'Enter your full name (2–80 characters).';
  }
  if (input.organizationName.trim().length > 120) {
    return 'Farm or organization name must be 120 characters or fewer.';
  }
  if (!validateEmail(input.email)) {
    return 'Enter a valid email address.';
  }
  if (input.password.length < 8 || input.password.length > 128) {
    return 'Password must be between 8 and 128 characters.';
  }
  return null;
}

export function validateListing(input: ListingInput) {
  const title = input.title.trim();
  if (title.length < 1 || title.length > 120) {
    return 'Listing title must be between 1 and 120 characters.';
  }
  if (input.description.trim().length > 1000) {
    return 'Description must be 1,000 characters or fewer.';
  }

  const quantity = Number(input.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 10_000_000) {
    return 'Enter a quantity greater than 0 and no more than 10,000,000.';
  }
  if (!input.pickupAddress.trim() || input.pickupAddress.trim().length > 300) {
    return 'Enter a pickup address (up to 300 characters).';
  }
  if (
    input.latitude === null ||
    input.longitude === null ||
    !Number.isFinite(input.latitude) ||
    !Number.isFinite(input.longitude) ||
    input.latitude < -90 ||
    input.latitude > 90 ||
    input.longitude < -180 ||
    input.longitude > 180
  ) {
    return 'Choose the pickup point on the map.';
  }
  if (!PICKUP_RADIUS_OPTIONS.includes(input.pickupRadiusMiles)) {
    return 'Choose a pickup radius between 5 and 100 miles.';
  }
  return null;
}

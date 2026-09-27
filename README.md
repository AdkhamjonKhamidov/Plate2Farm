# Plate2Farm

Plate2Farm connects food providers with nearby farmers. Providers post surplus food with a pickup point, time window, and pickup radius; farmers discover nearby offers, reserve pickups, and mark them collected.

## Requirements

- Node.js 22 or newer and npm
- A Supabase project
- A Google Maps Platform key for the web map
- An iPhone with Expo Go for physical-device testing (Mac required for iOS Simulator)

## 1. Set up Supabase

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor** and run each SQL migration in timestamp order:
   1. [`supabase/migrations/20260926220000_initial_leftover_schema.sql`](supabase/migrations/20260926220000_initial_leftover_schema.sql)
   2. [`supabase/migrations/20260927010000_validate_profile_and_listing_inputs.sql`](supabase/migrations/20260927010000_validate_profile_and_listing_inputs.sql)
   3. [`supabase/migrations/20260927020000_add_listing_pickup_radius.sql`](supabase/migrations/20260927020000_add_listing_pickup_radius.sql)
3. In **Project Settings > API**, copy the project URL and publishable key.
4. In **Authentication > URL Configuration**, allow the redirect URL used by the app. The app uses the `leftover` scheme; local web testing also needs its local web origin allowed.

The migrations create the account profiles, food listings, row-level security policies, and claim/cancel/complete operations. Existing listings get a default pickup radius of 25 miles.

## 2. Configure the app

From a terminal, go to `client` and create `.env` from `.env.example`:

```powershell
cd client
Copy-Item .env.example .env
```

Set the values in `client/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-web-maps-key
EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=
```

Use only a Supabase **publishable** key in the app. Never put a Supabase service-role or secret key in a client environment file.

### Maps by platform

- **Web:** Enable **Maps JavaScript API** in Google Cloud and provide `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`. Configure website restrictions for the web key.
- **iPhone with Expo Go:** The native map uses Apple Maps by default and does not need a Google Maps key.
- **Custom native build with Google Maps:** Enable **Maps SDK for iOS** and/or **Maps SDK for Android**, then provide the matching platform-specific key above. Restrict each key to the appropriate app identifier/signing certificate. These keys are embedded at build time, so rebuild and reinstall the native app after adding or changing them. A web-restricted key is not a native Maps SDK key.

Restart Expo after editing `.env`. Do not commit `.env`.

## 3. Install and start

```powershell
cd client
npm install
npx expo start
```

Use the Expo terminal shortcuts to open web, Android, or iOS. On a physical iPhone, scan the QR code using Expo Go and ensure the phone and development computer can reach the same network.

## 4. Add demo listings

After the migrations have run and at least one provider account exists:

1. Open **SQL Editor** in Supabase.
2. Open [`supabase/sample-data.sql`](supabase/sample-data.sql), copy its contents into a query, and run it.

The script adds five clearly labeled listings near Columbus, Ohio, for each provider. It is safe to run again without duplicating those samples; each sample expires six hours after insertion. The listings use original category-based artwork in the app, with no external image/license dependency. Listing photo URLs are displayed when a listing has one. The samples are real rows in your project, so remove them from **My listings** or Supabase when you no longer need them.

**A provider account is required before running this script.** Each listing must belong to a real provider profile linked to an authenticated Supabase user. Create a provider account through the app first; the script deliberately does not create or bypass authentication users.

## 5. Try both account types

Use separate email addresses for the provider and farmer accounts. Confirm each email if Supabase requires it.

### Provider

1. Sign up and choose **Restaurant / grocery**.
2. Open **My listings > Create a listing**.
3. Enter a title, quantity, address, pickup window, and map location. Select a pickup radius of 5, 10, 25, 50, or 100 miles.
4. Publish the listing. **My listings** shows active pickup pins; tap a pin to highlight the listing and its pickup area.

### Farmer

1. Sign up with a different email and choose **Farmer**.
2. Open **Discover** and choose a supply category if desired.
3. On iPhone, tap **Use my location** and allow access when prompted. The map recenters and uses your location as the search center. You can instead pan the map and tap **Use map center**.
4. Choose a radius. Discover shows available offers within both your search radius and the provider's pickup area. Tap a pin to highlight its offer and pickup radius.
5. Reserve an offer. It appears in **My pickups**, where you can tap **Mark as collected** when pickup is complete.

## iPhone location permissions

On the first **Use my location** request, iOS asks whether Plate2Farm/Expo Go can use location while the app is in use. If permission was denied or location lookup times out:

1. Open iPhone **Settings > Privacy & Security > Location Services**.
2. Make sure Location Services is on, then find **Expo Go** and allow access while using the app.
3. Return to Discover and tap **Use my location** again.

If the location permission prompt or map behavior does not update after app configuration changes, restart Expo with a cleared cache:

```powershell
cd client
npx expo start --clear
```

## Checks

Run these from `client`:

```powershell
npx tsc --noEmit
npm run lint
```

## Troubleshooting

- **Map is blank on web:** Check the web Maps key, Maps JavaScript API, billing, website restrictions, and browser console errors.
- **Map is blank on iPhone in Expo Go:** Expo Go uses Apple Maps by default. Confirm the iPhone has network access and Location Services are available; the web Google Maps key is not used by the native map. Restart Expo with `npx expo start --clear`.
- **Google map is blank in a custom native build:** Confirm the platform Maps SDK is enabled, the platform-specific key matches the app restrictions, and the app was rebuilt after changing the key.
- **No demo or nearby offers:** Confirm all three migrations ran, sample rows have not expired, and the signed-in account is a farmer. Demo locations are in Columbus, Ohio; use a nearby map center or simulate that location when testing.
- **Auth redirect fails:** Add the exact redirect URL used by the current Expo Go or web session under Supabase **Authentication > URL Configuration**.
- **Location is unavailable:** Enable iPhone Location Services and allow Expo Go access. On web, allow location access for the site or pan the map and use its center.

## Brand assets

The app currently uses a leaf mark by default. To add a bundled logo or replace the landing-page hero image, update `BRAND_LOGO`, `BRAND_IMAGES.hero`, and—when changing the image—`BRAND_HERO_ACCESSIBILITY_LABEL` in [`client/src/constants/brand.ts`](client/src/constants/brand.ts). Static image files can live in `client/assets/branding/`.

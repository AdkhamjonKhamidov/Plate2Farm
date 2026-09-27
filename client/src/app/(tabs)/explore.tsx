import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Notice, PageHeading, Palette, Panel, PrimaryButton, Screen } from '@/components/app-ui';
import { FoodListingCard } from '@/components/food-listing-card';
import ListingMap from '@/components/listing-map';
import {
  PICKUP_RADIUS_OPTIONS,
  type FoodCategory,
  type FoodListing,
  type PickupRadiusMiles,
} from '@/lib/database.types';
import { claimFoodListing, getAvailableListings } from '@/lib/food-listings';
import { getDistanceMiles, type MapCoordinate } from '@/lib/geo';
import { DEMO_LISTINGS, isDemoSession } from '@/lib/demo-data';
import { useAuth } from '@/providers/auth-provider';

const categories: Array<{ label: string; value: FoodCategory | 'all' }> = [
  { label: 'All supplies', value: 'all' },
  { label: 'Produce', value: 'produce' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Bakery', value: 'bakery' },
  { label: 'Prepared', value: 'prepared' },
  { label: 'Pantry', value: 'pantry' },
];

const radiusOptions: Array<{ label: string; value: PickupRadiusMiles | null }> = [
  { label: 'Any distance', value: null },
  ...PICKUP_RADIUS_OPTIONS.map((radius) => ({ label: `${radius} mi`, value: radius })),
];

export default function ExploreScreen() {
  const { session } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [searchCenter, setSearchCenter] = useState<MapCoordinate | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCoordinate | null>(null);
  const [searchRadiusMiles, setSearchRadiusMiles] = useState<PickupRadiusMiles | null>(25);
  const [userLocationRequest, setUserLocationRequest] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setListings(
        isDemoSession(session)
          ? DEMO_LISTINGS.filter((listing) => listing.status === 'available')
          : await getAvailableListings(),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load local supplies.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void loadListings();
    }, [loadListings]),
  );

  const filteredListings = useMemo(
    () => {
      const categoryListings =
        selectedCategory === 'all'
          ? listings
          : listings.filter((listing) => listing.category === selectedCategory);

      if (!searchCenter) {
        return categoryListings;
      }

      return categoryListings.filter((listing) => {
        const distance = getDistanceMiles(searchCenter, {
          latitude: listing.pickup_latitude,
          longitude: listing.pickup_longitude,
        });
        return (
          distance <= listing.pickup_radius_miles &&
          (searchRadiusMiles === null || distance <= searchRadiusMiles)
        );
      });
    },
    [listings, searchCenter, searchRadiusMiles, selectedCategory],
  );

  const handleMapCenterChange = useCallback((latitude: number, longitude: number) => {
    setMapCenter({ latitude, longitude });
  }, []);

  const handleUserLocationFound = useCallback((latitude: number, longitude: number) => {
    setSearchCenter({ latitude, longitude });
    setIsLocating(false);
    setLocationError(null);
  }, []);

  const handleUserLocationError = useCallback(() => {
    setIsLocating(false);
    setUserLocationRequest(0);
    setLocationError(
      'Could not get your location. Allow location access for this app in iPhone Settings, then try again.',
    );
  }, []);

  const setSearchToMapCenter = () => {
    setLocationError(null);
    setIsLocating(false);
    setUserLocationRequest(0);
    if (!mapCenter) {
      setLocationError('Move the map to your area, then try setting the search center again.');
      return;
    }
    setSearchCenter(mapCenter);
  };

  const setSearchArea = () => {
    setLocationError(null);
    if (Platform.OS !== 'web') {
      setSearchToMapCenter();
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationError('Location is not available in this browser. Allow location access or use another browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSearchCenter({ latitude: coords.latitude, longitude: coords.longitude });
        setIsLocating(false);
      },
      (positionError) => {
        setLocationError(
          positionError.code === positionError.PERMISSION_DENIED
            ? 'Location access was denied. Allow it in your browser settings or use another search area.'
            : 'Unable to get your location. Check your connection and try again.',
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 12_000 },
    );
  };

  const requestNativeLocation = () => {
    setLocationError(null);
    setIsLocating(true);
    setUserLocationRequest((request) => request + 1);
  };

  const claim = async (listingId: string) => {
    setIsClaiming(listingId);
    setNotice(null);
    setError(null);
    try {
      if (!isDemoSession(session)) {
        await claimFoodListing(listingId);
      }
      setNotice('Pickup saved. You can find it in My pickups.');
      if (isDemoSession(session)) {
        setListings((current) =>
          current.filter((listing) => listing.id !== listingId),
        );
      } else {
        await loadListings();
      }
    } catch (claimError) {
      setError(
        claimError instanceof Error ? claimError.message : 'Unable to reserve this pickup.',
      );
    } finally {
      setIsClaiming(null);
    }
  };

  return (
    <Screen>
      <PageHeading
        eyebrow="For farmers"
        title="Discover local supplies"
        subtitle="Explore available food and choose a pickup point that works for you."
      />

      <View style={styles.filters}>
        {categories.map((category) => (
          <Pressable
            key={category.value}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category.value }}
            onPress={() => setSelectedCategory(category.value)}
            style={[
              styles.filter,
              selectedCategory === category.value && styles.filterSelected,
            ]}>
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.value && styles.filterTextSelected,
              ]}>
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Panel>
        <Text style={styles.searchTitle}>Search by distance</Text>
        <Text style={styles.searchHelp}>
          {Platform.OS === 'web'
            ? 'Use your location, or pan the map and search its center.'
            : 'Move the map to your area, then use its center to search nearby.'}
        </Text>
        <View style={styles.searchButtons}>
          {Platform.OS === 'web' ? (
            <PrimaryButton disabled={isLocating} onPress={setSearchArea}>
              {isLocating
                ? 'Finding your location…'
                : searchCenter
                  ? 'Update my location'
                  : 'Use my location'}
            </PrimaryButton>
          ) : null}
          {Platform.OS === 'ios' ? (
            <PrimaryButton disabled={isLocating} onPress={requestNativeLocation}>
              {isLocating
                ? 'Finding your location…'
                : searchCenter
                  ? 'Update my location'
                  : 'Use my location'}
            </PrimaryButton>
          ) : null}
          <PrimaryButton variant="secondary" onPress={setSearchToMapCenter}>
            {searchCenter && Platform.OS !== 'web' ? 'Update search area' : 'Use map center'}
          </PrimaryButton>
        </View>
        <View style={styles.filters}>
          {radiusOptions.map((option) => (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: searchRadiusMiles === option.value }}
              onPress={() => setSearchRadiusMiles(option.value)}
              style={[
                styles.filter,
                searchRadiusMiles === option.value && styles.filterSelected,
              ]}>
              <Text
                style={[
                  styles.filterText,
                  searchRadiusMiles === option.value && styles.filterTextSelected,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {searchCenter ? (
          <Text style={styles.searchHelp}>
            {searchRadiusMiles === null
              ? 'Showing offers within each provider’s pickup area.'
              : `Showing offers within ${searchRadiusMiles} miles of your search area and within each provider’s pickup area.`}
          </Text>
        ) : (
          <Text style={styles.searchHelp}>
            Set a search area to apply the selected distance.
          </Text>
        )}
        {locationError ? <Text style={styles.locationError}>{locationError}</Text> : null}
      </Panel>

      {error ? <Notice>{error}</Notice> : null}
      {notice ? <Notice tone="info">{notice}</Notice> : null}
      <ListingMap
        listings={filteredListings}
        selectedListingId={selectedListingId}
        onSelect={(listing) => setSelectedListingId(listing.id)}
        searchCenter={searchCenter}
        searchRadiusMiles={searchRadiusMiles}
        showSelectedPickupRadius
        onMapCenterChange={handleMapCenterChange}
        userLocationRequest={userLocationRequest}
        onUserLocationFound={handleUserLocationFound}
        onUserLocationError={handleUserLocationError}
      />

      <View style={styles.listHeading}>
        <Text style={styles.sectionTitle}>Pickup options</Text>
        <Text style={styles.count}>
          {filteredListings.length} {filteredListings.length === 1 ? 'offer' : 'offers'} available
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Palette.forest} />
      ) : filteredListings.length ? (
        filteredListings.map((listing) => (
          <View key={listing.id} style={selectedListingId === listing.id && styles.selectedCard}>
            <FoodListingCard listing={listing}>
              <PrimaryButton
                disabled={isClaiming === listing.id}
                onPress={() => void claim(listing.id)}>
                {isClaiming === listing.id ? 'Saving pickup…' : 'Reserve this pickup'}
              </PrimaryButton>
            </FoodListingCard>
          </View>
        ))
      ) : (
        <Panel>
          <Text style={styles.emptyTitle}>No offers in this category</Text>
          <Text style={styles.emptyText}>
            {error
              ? 'Check your connection and try loading the offers again.'
              : searchCenter
                ? searchRadiusMiles === null
                  ? 'No offers are available inside their pickup areas here. Move the map to another area and update your search center.'
                  : 'Try increasing your search radius or moving the map to another area.'
                : selectedCategory === 'all'
                  ? 'New local supplies will appear here when a provider posts them.'
                  : 'Try another supply category to see available pickup options.'}
          </Text>
          {error ? (
            <PrimaryButton variant="secondary" onPress={() => void loadListings()}>
              Try again
            </PrimaryButton>
          ) : null}
        </Panel>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filter: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: Palette.card,
  },
  filterSelected: {
    backgroundColor: Palette.forest,
    borderColor: Palette.forest,
  },
  filterText: {
    color: Palette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTextSelected: {
    color: Palette.card,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Palette.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  count: {
    color: Palette.muted,
    fontSize: 13,
  },
  searchTitle: {
    color: Palette.heading,
    fontSize: 17,
    fontWeight: '800',
  },
  searchHelp: {
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  searchButtons: {
    gap: 8,
  },
  locationError: {
    color: Palette.error,
    fontSize: 13,
    lineHeight: 19,
  },
  selectedCard: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: Palette.primarySoft,
    borderRadius: 24,
  },
  emptyTitle: {
    color: Palette.heading,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});

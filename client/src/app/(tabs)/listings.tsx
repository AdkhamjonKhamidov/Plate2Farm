import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Notice, PageHeading, Palette, Panel, PrimaryButton, Screen } from '@/components/app-ui';
import { FoodListingCard } from '@/components/food-listing-card';
import ListingMap from '@/components/listing-map';
import { cancelFoodListing, getProviderListings } from '@/lib/food-listings';
import type { FoodListing } from '@/lib/database.types';
import { useAuth } from '@/providers/auth-provider';

export default function ProviderListingsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setListings(await getProviderListings(session.user.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your listings.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void loadListings();
    }, [loadListings]),
  );

  const cancelListing = async (listingId: string) => {
    setIsCancelling(listingId);
    setError(null);
    setNotice(null);
    try {
      await cancelFoodListing(listingId);
      setNotice('Listing cancelled.');
      await loadListings();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Unable to cancel listing.');
    } finally {
      setIsCancelling(null);
    }
  };

  const mappedListings = listings.filter(
    (listing) => listing.status === 'available' || listing.status === 'reserved',
  );
  const activeSelection = mappedListings.some((listing) => listing.id === selectedListingId)
    ? selectedListingId
    : mappedListings[0]?.id ?? null;

  return (
    <Screen>
      <PageHeading
        eyebrow="For food providers"
        title="My listings"
        subtitle="Manage the food you have made available for local pickup."
      />
      <PrimaryButton onPress={() => router.push('/listing/new')}>Create a listing</PrimaryButton>
      {error ? <Notice>{error}</Notice> : null}
      {notice ? <Notice tone="info">{notice}</Notice> : null}
      {mappedListings.length ? (
        <>
          <Text style={styles.mapCaption}>
            Tap a pin to preview that offer’s pickup area.
          </Text>
          <ListingMap
            listings={mappedListings}
            selectedListingId={activeSelection}
            onSelect={(listing) => setSelectedListingId(listing.id)}
            showSelectedPickupRadius
          />
        </>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={Palette.forest} />
      ) : listings.length ? (
        listings.map((listing) => (
          <View
            key={listing.id}
            style={activeSelection === listing.id && styles.selectedCard}>
            <FoodListingCard listing={listing}>
              <View style={styles.statusRow}>
                <Text style={styles.status}>{listing.status.replace('_', ' ')}</Text>
                {listing.status === 'reserved' ? (
                  <Text style={styles.claimed}>Claimed by a farmer</Text>
                ) : null}
              </View>
              {listing.status === 'available' ? (
                <PrimaryButton
                  variant="secondary"
                  disabled={isCancelling === listing.id}
                  onPress={() => void cancelListing(listing.id)}>
                  {isCancelling === listing.id ? 'Cancelling…' : 'Cancel offer'}
                </PrimaryButton>
              ) : null}
            </FoodListingCard>
          </View>
        ))
      ) : (
        <Panel>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptyText}>
            Add your first offer to share local supplies and pickup options with nearby farmers.
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mapCaption: {
    color: Palette.muted,
    fontSize: 13,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#86A95D',
    borderRadius: 24,
  },
  status: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  claimed: {
    color: Palette.muted,
    fontSize: 12,
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

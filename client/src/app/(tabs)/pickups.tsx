import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Notice, PageHeading, Palette, Panel, PrimaryButton, Screen } from '@/components/app-ui';
import { FoodListingCard } from '@/components/food-listing-card';
import ListingMap from '@/components/listing-map';
import { useAuth } from '@/providers/auth-provider';
import type { FoodListing } from '@/lib/database.types';
import { completeFoodPickup, getFarmerPickups } from '@/lib/food-listings';

export default function PickupsScreen() {
  const { session } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPickups = useCallback(async () => {
    if (!session) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setListings(await getFarmerPickups(session.user.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your pickups.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      void loadPickups();
    }, [loadPickups]),
  );

  const completePickup = async (listingId: string) => {
    setIsCompleting(listingId);
    setNotice(null);
    setError(null);
    try {
      await completeFoodPickup(listingId);
      setNotice('Pickup marked as collected. Thanks for rescuing good food!');
      await loadPickups();
    } catch (pickupError) {
      setError(
        pickupError instanceof Error ? pickupError.message : 'Unable to complete this pickup.',
      );
    } finally {
      setIsCompleting(null);
    }
  };

  const reserved = listings.filter((listing) => listing.status === 'reserved');
  const activeSelection = reserved.some((listing) => listing.id === selectedListingId)
    ? selectedListingId
    : reserved[0]?.id ?? null;

  return (
    <Screen>
      <PageHeading
        eyebrow="For farmers"
        title="My pickups"
        subtitle="Your reserved collection points and previously collected supplies."
      />
      {error ? <Notice>{error}</Notice> : null}
      {notice ? <Notice tone="info">{notice}</Notice> : null}
      {reserved.length ? (
        <ListingMap
          listings={reserved}
          selectedListingId={activeSelection}
          onSelect={(listing) => setSelectedListingId(listing.id)}
          showSelectedPickupRadius
        />
      ) : null}
      {isLoading ? (
        <ActivityIndicator color={Palette.forest} />
      ) : listings.length ? (
        listings.map((listing) => (
          <View
            key={listing.id}
            style={activeSelection === listing.id && styles.selectedCard}>
            <FoodListingCard listing={listing}>
              <Text style={styles.status}>
                {listing.status === 'collected' ? 'Collected' : 'Reserved for you'}
              </Text>
              {listing.status === 'reserved' ? (
                <PrimaryButton
                  disabled={isCompleting === listing.id}
                  onPress={() => void completePickup(listing.id)}>
                  {isCompleting === listing.id ? 'Updating pickup…' : 'Mark as collected'}
                </PrimaryButton>
              ) : null}
            </FoodListingCard>
          </View>
        ))
      ) : (
        <Panel>
          <Text style={styles.emptyTitle}>No pickups yet</Text>
          <Text style={styles.emptyText}>
            Offers you reserve from Discover will appear here with their pickup locations.
          </Text>
          {error ? (
            <PrimaryButton variant="secondary" onPress={() => void loadPickups()}>
              Try again
            </PrimaryButton>
          ) : null}
        </Panel>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: {
    color: '#597445',
    fontSize: 13,
    fontWeight: '800',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#86A95D',
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

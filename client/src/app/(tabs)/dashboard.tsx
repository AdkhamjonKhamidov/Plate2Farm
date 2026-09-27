import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Screen, PageHeading, Panel, Palette, PrimaryButton } from '@/components/app-ui';
import { FoodListingCard } from '@/components/food-listing-card';
import { useAuth } from '@/providers/auth-provider';
import type { FoodListing } from '@/lib/database.types';
import { getAvailableListings, getProviderListings } from '@/lib/food-listings';
import { DEMO_LISTINGS, isDemoSession } from '@/lib/demo-data';

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, session } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFarmer = profile?.account_type === 'farmer';

  const loadSummary = useCallback(async () => {
    if (!profile || !session) {
      return;
    }
    setIsLoading(true);
    setNotice(null);
    try {
      const results = isDemoSession(session)
        ? DEMO_LISTINGS.filter((listing) =>
            isFarmer ? listing.status === 'available' : listing.posted_by === session.user.id,
          )
        : isFarmer
          ? await getAvailableListings()
          : await getProviderListings(session.user.id);
      setListings(results.slice(0, 3));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to load your dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [isFarmer, profile, session]);

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  return (
    <Screen>
      <PageHeading
        eyebrow={profile?.organization_name || 'Leftover'}
        title={`Hi, ${profile?.full_name.split(' ')[0] || 'there'}!`}
        subtitle={
          isFarmer
            ? 'Find fresh local supplies and plan a pickup near you.'
            : 'Share good food with your local farming community.'
        }
      />

      {isFarmer ? (
        <Panel>
          <Text style={styles.featureTitle}>Good food, close by.</Text>
          <Text style={styles.description}>
            Browse nearby offers, choose a pickup point, and keep your claimed food organized.
          </Text>
          <PrimaryButton onPress={() => router.push('/(tabs)/explore')}>
            Explore local supplies
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onPress={() => router.push('/(tabs)/pickups')}>
            View my pickups
          </PrimaryButton>
        </Panel>
      ) : (
        <Panel>
          <Text style={styles.featureTitle}>Pass good food along.</Text>
          <Text style={styles.description}>
            Post available supplies with a pickup window and map location for local farmers.
          </Text>
          <PrimaryButton onPress={() => router.push('/listing/new')}>
            Create a food listing
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            onPress={() => router.push('/(tabs)/listings')}>
            Manage my listings
          </PrimaryButton>
        </Panel>
      )}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>{isFarmer ? 'New near you' : 'Your latest listings'}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(isFarmer ? '/(tabs)/explore' : '/(tabs)/listings')
          }>
          <Text style={styles.link}>See all</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Palette.forest} />
      ) : notice ? (
        <Panel>
          <Text style={styles.error}>{notice}</Text>
          <PrimaryButton variant="secondary" onPress={() => void loadSummary()}>
            Try again
          </PrimaryButton>
        </Panel>
      ) : listings.length ? (
        listings.map((listing) => (
          <FoodListingCard key={listing.id} listing={listing} />
        ))
      ) : (
        <Panel>
          <Text style={styles.description}>
            {isFarmer
              ? 'There are no active offers yet. Check back soon for local supplies.'
              : 'You have not posted any food listings yet.'}
          </Text>
          {!isFarmer ? (
            <PrimaryButton onPress={() => router.push('/listing/new')}>Post a listing</PrimaryButton>
          ) : null}
        </Panel>
      )}

      {!isFarmer && (
        <PrimaryButton variant="secondary" onPress={() => router.push('/(tabs)/profile')}>
          Update organization profile
        </PrimaryButton>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  featureTitle: {
    color: Palette.heading,
    fontSize: 21,
    fontWeight: '800',
  },
  description: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    color: Palette.heading,
    fontSize: 20,
    fontWeight: '800',
  },
  link: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  error: {
    color: Palette.error,
    fontSize: 14,
  },
});

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Panel, Palette } from '@/components/app-ui';
import { FoodListingArtwork } from '@/components/food-listing-artwork';
import type { FoodListing } from '@/lib/database.types';

export function FoodListingCard({
  listing,
  children,
}: {
  listing: FoodListing;
  children?: ReactNode;
}) {
  const pickupStart = new Date(listing.pickup_starts_at);
  const pickupEnd = new Date(listing.pickup_ends_at);

  return (
    <Panel>
      <FoodListingArtwork category={listing.category} imageUrl={listing.image_url} />
      <View style={styles.row}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.quantity}>
          {listing.quantity} {listing.unit}
        </Text>
      </View>
      <Text style={styles.provider}>{listing.provider_name}</Text>
      {listing.description ? <Text style={styles.description}>{listing.description}</Text> : null}
      <Text style={styles.category}>{listing.category.toUpperCase()}</Text>
      <Text style={styles.address}>{listing.pickup_address}</Text>
      <Text style={styles.radius}>Pickup area · {listing.pickup_radius_miles} mi</Text>
      <Text style={styles.pickup}>
        Pickup {pickupStart.toLocaleString()} – {pickupEnd.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })}
      </Text>
      {children}
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    color: Palette.heading,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '800',
  },
  quantity: {
    color: Palette.forest,
    fontSize: 14,
    fontWeight: '800',
  },
  provider: {
    color: '#597445',
    fontSize: 13,
    fontWeight: '700',
  },
  description: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  category: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    color: Palette.forest,
    backgroundColor: Palette.softGreen,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  address: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  radius: {
    color: Palette.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  pickup: {
    color: Palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});

import { APIProvider, Circle, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getSupplyPinColor, GOOGLE_MAP_STYLE } from '@/constants/map-style';
import type { ListingMapProps } from '@/components/listing-map.types';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

function ListingMapContents({
  listings,
  selectedListingId,
  onSelect,
  searchCenter,
  searchRadiusMiles,
  showSelectedPickupRadius,
  onMapCenterChange,
}: ListingMapProps) {
  const map = useMap();
  const hasCenteredOnListings = useRef(false);
  const handleIdle = useCallback(() => {
    const center = map?.getCenter();
    if (center) {
      onMapCenterChange?.(center.lat(), center.lng());
    }
  }, [map, onMapCenterChange]);

  const selectedListing = listings.find((listing) => listing.id === selectedListingId);

  useEffect(() => {
    if (!map || !searchCenter) {
      return;
    }
    map.panTo({ lat: searchCenter.latitude, lng: searchCenter.longitude });
    if (searchRadiusMiles) {
      map.setZoom(Math.max(5, Math.min(14, Math.round(10 - Math.log2(searchRadiusMiles / 25)))));
    }
  }, [map, searchCenter, searchRadiusMiles]);

  useEffect(() => {
    const firstListing = listings[0];
    if (!map || !firstListing || searchCenter || hasCenteredOnListings.current) {
      return;
    }
    hasCenteredOnListings.current = true;
    map.panTo({ lat: firstListing.pickup_latitude, lng: firstListing.pickup_longitude });
    map.setZoom(10);
  }, [listings, map, searchCenter]);

  return (
    <Map
      defaultCenter={
        searchCenter
          ? { lat: searchCenter.latitude, lng: searchCenter.longitude }
          : listings[0]
            ? { lat: listings[0].pickup_latitude, lng: listings[0].pickup_longitude }
            : { lat: 39.5, lng: -98.35 }
      }
      defaultZoom={searchCenter || listings[0] ? 10 : 4}
      gestureHandling="greedy"
      clickableIcons={false}
      styles={GOOGLE_MAP_STYLE}
      onIdle={handleIdle}
      style={styles.map}>
      {searchCenter && searchRadiusMiles ? (
        <Circle
          center={{ lat: searchCenter.latitude, lng: searchCenter.longitude }}
          radius={searchRadiusMiles * 1609.344}
          fillColor="#5B8548"
          fillOpacity={0.12}
          strokeColor="#365D3D"
          strokeOpacity={0.7}
          strokeWeight={2}
          clickable={false}
        />
      ) : null}
      {showSelectedPickupRadius && selectedListing ? (
        <Circle
          center={{
            lat: selectedListing.pickup_latitude,
            lng: selectedListing.pickup_longitude,
          }}
          radius={selectedListing.pickup_radius_miles * 1609.344}
          fillColor="#B68A4B"
          fillOpacity={0.12}
          strokeColor="#B68A4B"
          strokeOpacity={0.75}
          strokeWeight={2}
          clickable={false}
        />
      ) : null}
      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={{ lat: listing.pickup_latitude, lng: listing.pickup_longitude }}
          title={`${listing.title} · ${listing.provider_name}`}
          onClick={() => onSelect?.(listing)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: listing.id === selectedListingId ? 12 : 10,
            fillColor:
              listing.id === selectedListingId
                ? '#365D3D'
                : getSupplyPinColor(listing.category),
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          }}
          label={{
            text: listing.id === selectedListingId ? '✓' : '•',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '700',
          }}
        />
      ))}
    </Map>
  );
}

export default function ListingMap({
  listings,
  selectedListingId,
  onSelect,
  searchCenter,
  searchRadiusMiles,
  showSelectedPickupRadius = false,
  onMapCenterChange,
}: ListingMapProps) {
  if (!MAPS_KEY) {
    return (
      <View style={styles.missingKey}>
        <Text style={styles.missingTitle}>Google Maps needs an API key</Text>
        <Text style={styles.missingText}>
          Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to client/.env and enable the Maps JavaScript API.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <APIProvider apiKey={MAPS_KEY}>
        <ListingMapContents
          listings={listings}
          selectedListingId={selectedListingId}
          onSelect={onSelect}
          searchCenter={searchCenter}
          searchRadiusMiles={searchRadiusMiles}
          showSelectedPickupRadius={showSelectedPickupRadius}
          onMapCenterChange={onMapCenterChange}
        />
      </APIProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#E8EDDF',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  missingKey: {
    height: 180,
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#E8EDDF',
  },
  missingTitle: {
    color: '#253B2B',
    fontSize: 16,
    fontWeight: '800',
  },
  missingText: {
    color: '#687166',
    fontSize: 13,
    lineHeight: 20,
  },
});

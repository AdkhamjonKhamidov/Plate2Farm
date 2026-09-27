import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from 'react-native-maps';
import { useCallback, useEffect, useRef } from 'react';
import Constants, { AppOwnership } from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

import { getSupplyPinColor, GOOGLE_MAP_STYLE } from '@/constants/map-style';
import type { ListingMapProps } from '@/components/listing-map.types';

const PLATFORM_MAPS_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY?.trim()
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY?.trim();
const USE_GOOGLE_MAPS =
  Constants.appOwnership !== AppOwnership.Expo && Boolean(PLATFORM_MAPS_KEY);
const DEFAULT_REGION: Region = {
  latitude: 39.5,
  longitude: -98.35,
  latitudeDelta: 16,
  longitudeDelta: 22,
};

export default function ListingMap({
  listings,
  selectedListingId,
  onSelect,
  searchCenter,
  searchRadiusMiles,
  showSelectedPickupRadius = false,
  onMapCenterChange,
  userLocationRequest = 0,
  onUserLocationFound,
  onUserLocationError,
}: ListingMapProps) {
  const mapRef = useRef<MapView | null>(null);
  const mapReady = useRef(false);
  const hasCenteredOnListings = useRef(false);
  const pendingLocationRequest = useRef(false);
  const locationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstListing = listings[0];
  const selectedListing = listings.find((listing) => listing.id === selectedListingId);
  const initialRegion: Region = searchCenter
    ? { ...searchCenter, latitudeDelta: 0.5, longitudeDelta: 0.5 }
    : firstListing
      ? {
          latitude: firstListing.pickup_latitude,
          longitude: firstListing.pickup_longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.35,
        }
      : DEFAULT_REGION;

  useEffect(() => {
    if (!searchCenter) {
      return;
    }
    const latitudeDelta = Math.max(0.12, ((searchRadiusMiles ?? 25) / 69) * 2.6);
    mapRef.current?.animateToRegion(
      {
        ...searchCenter,
        latitudeDelta,
        longitudeDelta: Math.min(
          360,
          latitudeDelta / Math.max(Math.cos((searchCenter.latitude * Math.PI) / 180), 0.15),
        ),
      },
      350,
    );
  }, [searchCenter, searchRadiusMiles]);

  const centerOnFirstListing = useCallback(() => {
    if (
      !mapReady.current ||
      !firstListing ||
      searchCenter ||
      hasCenteredOnListings.current
    ) {
      return;
    }
    hasCenteredOnListings.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: firstListing.pickup_latitude,
        longitude: firstListing.pickup_longitude,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      },
      350,
    );
  }, [firstListing, searchCenter]);

  useEffect(() => {
    centerOnFirstListing();
  }, [centerOnFirstListing]);

  useEffect(() => {
    if (userLocationRequest <= 0) {
      return;
    }

    pendingLocationRequest.current = true;
    locationTimeout.current = setTimeout(() => {
      pendingLocationRequest.current = false;
      onUserLocationError?.();
    }, 15_000);
    return () => {
      pendingLocationRequest.current = false;
      if (locationTimeout.current) {
        clearTimeout(locationTimeout.current);
        locationTimeout.current = null;
      }
    };
  }, [userLocationRequest, onUserLocationError, onUserLocationFound]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegion}
        provider={USE_GOOGLE_MAPS ? PROVIDER_GOOGLE : undefined}
        customMapStyle={GOOGLE_MAP_STYLE}
        showsUserLocation={Platform.OS === 'ios' && userLocationRequest > 0}
        onUserLocationChange={(event) => {
          if (event.nativeEvent.error) {
            const requestWasPending = pendingLocationRequest.current;
            pendingLocationRequest.current = false;
            if (locationTimeout.current) {
              clearTimeout(locationTimeout.current);
              locationTimeout.current = null;
            }
            if (requestWasPending) {
              onUserLocationError?.();
            }
            return;
          }
          const location = event.nativeEvent.coordinate;
          if (!location) {
            return;
          }
          if (pendingLocationRequest.current) {
            pendingLocationRequest.current = false;
            if (locationTimeout.current) {
              clearTimeout(locationTimeout.current);
              locationTimeout.current = null;
            }
            mapRef.current?.animateToRegion(
              { ...location, latitudeDelta: 0.08, longitudeDelta: 0.08 },
              350,
            );
            onUserLocationFound?.(location.latitude, location.longitude);
          }
        }}
        onMapReady={() => {
          mapReady.current = true;
          centerOnFirstListing();
        }}
        onRegionChangeComplete={(region) =>
          onMapCenterChange?.(region.latitude, region.longitude)
        }
        style={styles.map}>
        {searchCenter && searchRadiusMiles ? (
          <Circle
            center={searchCenter}
            radius={searchRadiusMiles * 1609.344}
            fillColor="rgba(91, 133, 72, 0.12)"
            strokeColor="rgba(54, 93, 61, 0.7)"
            strokeWidth={2}
            tappable={false}
          />
        ) : null}
        {showSelectedPickupRadius && selectedListing ? (
          <Circle
            center={{
              latitude: selectedListing.pickup_latitude,
              longitude: selectedListing.pickup_longitude,
            }}
            radius={selectedListing.pickup_radius_miles * 1609.344}
            fillColor="rgba(182, 138, 75, 0.12)"
            strokeColor="rgba(182, 138, 75, 0.75)"
            strokeWidth={2}
            tappable={false}
          />
        ) : null}
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.pickup_latitude,
              longitude: listing.pickup_longitude,
            }}
            pinColor={
              listing.id === selectedListingId
                ? '#365D3D'
                : getSupplyPinColor(listing.category)
            }
            title={listing.title}
            description={`${listing.provider_name} · ${listing.pickup_address}`}
            onPress={() => onSelect?.(listing)}
          />
        ))}
      </MapView>
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
    flex: 1,
  },
});

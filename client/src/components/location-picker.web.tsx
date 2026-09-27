import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/components/app-ui';
import type { LocationPickerProps } from '@/components/listing-map.types';
import { GOOGLE_MAP_STYLE } from '@/constants/map-style';

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

function PickupMap({ latitude, longitude, onSelect }: LocationPickerProps) {
  const map = useMap();
  useEffect(() => {
    if (map && latitude !== null && longitude !== null) {
      map.panTo({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, map]);

  const center =
    latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : { lat: 39.5, lng: -98.35 };

  return (
    <Map
      defaultCenter={center}
      defaultZoom={latitude !== null ? 12 : 4}
      gestureHandling="greedy"
      clickableIcons={false}
      styles={GOOGLE_MAP_STYLE}
      onClick={(event) => {
        const point = event.detail.latLng;
        if (point) {
          onSelect(point.lat, point.lng);
        }
      }}
      style={styles.map}>
      {latitude !== null && longitude !== null ? (
        <Marker position={{ lat: latitude, lng: longitude }} title="Pickup point" />
      ) : null}
    </Map>
  );
}

export default function LocationPicker(props: LocationPickerProps) {
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
        <PickupMap {...props} />
      </APIProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: Palette.backgroundElement,
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
    borderRadius: 22,
    backgroundColor: Palette.backgroundElement,
  },
  missingTitle: {
    color: Palette.heading,
    fontSize: 16,
    fontWeight: '800',
  },
  missingText: {
    color: Palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});

import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Constants, { AppOwnership } from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';

import { Palette } from '@/components/app-ui';
import type { LocationPickerProps } from '@/components/listing-map.types';
import { GOOGLE_MAP_STYLE } from '@/constants/map-style';

const PLATFORM_MAPS_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY?.trim()
    : process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY?.trim();
const USE_GOOGLE_MAPS =
  Constants.appOwnership !== AppOwnership.Expo && Boolean(PLATFORM_MAPS_KEY);

export default function LocationPicker({
  latitude,
  longitude,
  onSelect,
}: LocationPickerProps) {
  const selectedCoordinate =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={{
          latitude: latitude ?? 39.5,
          longitude: longitude ?? -98.35,
          latitudeDelta: selectedCoordinate ? 0.08 : 18,
          longitudeDelta: selectedCoordinate ? 0.08 : 24,
        }}
        provider={USE_GOOGLE_MAPS ? PROVIDER_GOOGLE : undefined}
        customMapStyle={GOOGLE_MAP_STYLE}
        onPress={(event) =>
          onSelect(
            event.nativeEvent.coordinate.latitude,
            event.nativeEvent.coordinate.longitude,
          )
        }
        style={styles.map}>
        {selectedCoordinate ? <Marker coordinate={selectedCoordinate} pinColor={Palette.forest} /> : null}
      </MapView>
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
    flex: 1,
  },
});

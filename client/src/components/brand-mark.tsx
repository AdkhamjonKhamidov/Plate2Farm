import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { BRAND_LOGO } from '@/constants/brand';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {BRAND_LOGO ? (
        <Image
          accessibilityLabel="Leftover logo"
          contentFit="contain"
          source={BRAND_LOGO}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <Text style={[styles.fallback, { fontSize: size * 0.58 }]}>🌱</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    textAlign: 'center',
  },
});

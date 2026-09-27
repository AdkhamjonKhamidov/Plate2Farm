import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { BRAND_LOGO } from '@/constants/brand';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 36 }: BrandMarkProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Image
        accessibilityLabel="Leftover logo"
        contentFit="cover"
        source={BRAND_LOGO}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    overflow: 'hidden',
  },
});

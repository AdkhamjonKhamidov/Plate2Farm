import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { BRAND_HERO_ACCESSIBILITY_LABEL, BRAND_IMAGES, BRAND_NAME } from '@/constants/brand';

export default function HomeScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const isWide = width >= 820;
  const imageHeight = isWide
    ? Math.min(height * 0.62, 560)
    : Math.max(190, Math.min(height * 0.28, 320));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.content, width >= 1200 && styles.contentWide]}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <BrandMark size={38} />
              </View>
              <Text style={styles.brandName}>{BRAND_NAME}</Text>
            </View>
          </View>

          <View style={[styles.hero, isWide && styles.heroWide]}>
            <Image
              accessibilityLabel={BRAND_HERO_ACCESSIBILITY_LABEL}
              contentFit="cover"
              source={BRAND_IMAGES.hero}
              style={[styles.heroImage, isWide && styles.heroImageWide, { height: imageHeight }]}
              transition={250}
            />

            <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
              <Text style={[styles.headline, isWide && styles.headlineWide]}>
                Leftovers,{' '}
                <Text style={styles.headlineAccent}>made good.</Text>
              </Text>
              <Text style={styles.description}>
                Good food deserves another chance.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/auth')}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                <Text style={styles.primaryButtonText}>Get started</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/privacy')}
                style={styles.privacyLink}>
                <Text style={styles.privacyLinkText}>Privacy notice</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F1',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1440,
    paddingHorizontal: 22,
  },
  contentWide: {
    paddingHorizontal: 48,
  },
  header: {
    minHeight: 72,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    height: 42,
    width: 42,
    borderRadius: 15,
    backgroundColor: '#E5EFD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#253B2B',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
    paddingVertical: 16,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 56,
  },
  heroImage: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: '#D8E2CD',
  },
  heroImageWide: {
    width: '48%',
    flexShrink: 0,
    borderRadius: 36,
  },
  heroCopy: {
    gap: 18,
    paddingBottom: 8,
  },
  heroCopyWide: {
    flex: 1,
    gap: 24,
  },
  headline: {
    color: '#253B2B',
    fontSize: 42,
    lineHeight: 49,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  headlineWide: {
    fontSize: 58,
    lineHeight: 66,
  },
  headlineAccent: {
    color: '#699344',
  },
  description: {
    color: '#687166',
    fontSize: 18,
    lineHeight: 27,
  },
  primaryButton: {
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: '#365D3D',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  privacyLink: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  privacyLinkText: {
    color: '#597445',
    fontSize: 14,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
});

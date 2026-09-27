import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Palette } from '@/components/app-ui';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_LOGO, BRAND_NAME } from '@/constants/brand';

const heroImage = BRAND_LOGO;

const platforms = [
  { platform: 'iOS', store: 'App Store' },
  { platform: 'Android', store: 'Google Play' },
] as const;

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <BrandMark size={38} />
              </View>
              <Text style={styles.brandName}>{BRAND_NAME}</Text>
            </View>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/auth')}
              style={styles.signInLink}>
              <Text style={styles.signInText}>Sign in</Text>
            </Pressable>
          </View>

          <View style={[styles.hero, isWide && styles.heroWide]}>
            <View style={[styles.heroCopy, isWide && styles.heroCopyWide]}>
              <Text style={styles.eyebrow}>GOOD FOOD. GOOD NEIGHBORS.</Text>
              <Text style={styles.title}>Give good food another home.</Text>
              <Text style={styles.description}>
                Leftover brings food providers and local farmers together to make surplus food go
                further.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: '/auth', params: { mode: 'signUp' } })
                }
                style={({ pressed }) => [styles.joinButton, pressed && styles.pressed]}>
                <Text style={styles.joinButtonText}>Create your free account</Text>
                <Text style={styles.joinArrow}>→</Text>
              </Pressable>
            </View>
            {isWide ? (
              <Image
                accessibilityLabel="Leftover logo"
                contentFit="contain"
                source={heroImage}
                style={[styles.heroImage, styles.heroImageWide]}
                transition={150}
              />
            ) : null}
          </View>

          <View style={styles.downloadSection}>
            <View style={styles.downloadHeading}>
              <Text style={styles.sectionTitle}>Take Leftover with you</Text>
              <Text style={styles.sectionNote}>Choose your platform</Text>
            </View>
            <View style={styles.platforms}>
              {platforms.map((item) => (
                <Pressable
                  key={item.platform}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: true }}
                  disabled
                  style={styles.platformCard}>
                  <View style={styles.platformCopy}>
                    <Text style={styles.platformName}>{item.platform}</Text>
                    <Text style={styles.storeName}>{item.store}</Text>
                  </View>
                  <Text style={styles.comingSoon}>Coming soon</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.downloadNote}>App downloads will be available here soon.</Text>
          </View>

          {!isWide ? (
            <Image
              accessibilityLabel="Leftover logo"
              contentFit="contain"
              source={heroImage}
              style={styles.heroImage}
              transition={150}
            />
          ) : null}

          <Text style={styles.footer}>Less waste. More good, shared locally.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 30,
  },
  container: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
  header: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: Palette.heading,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  signInLink: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  signInText: {
    color: Palette.forest,
    fontSize: 14,
    fontWeight: '800',
  },
  hero: {
    gap: 22,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 44,
    marginTop: 14,
  },
  heroCopy: {
    gap: 14,
  },
  heroCopyWide: {
    flex: 1,
    gap: 18,
  },
  eyebrow: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: Palette.heading,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  description: {
    color: Palette.muted,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 500,
  },
  joinButton: {
    minHeight: 54,
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: Palette.forest,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  pressed: {
    opacity: 0.82,
  },
  joinButtonText: {
    color: Palette.card,
    fontSize: 14,
    fontWeight: '800',
  },
  joinArrow: {
    color: Palette.card,
    fontSize: 20,
    fontWeight: '600',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1.65,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroImageWide: {
    flex: 1,
    height: 360,
    width: undefined,
    aspectRatio: undefined,
  },
  downloadSection: {
    marginTop: 24,
    padding: 18,
    borderRadius: 22,
    backgroundColor: Palette.softGreen,
    gap: 14,
  },
  downloadHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 6,
  },
  sectionTitle: {
    color: Palette.heading,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionNote: {
    color: Palette.muted,
    fontSize: 12,
  },
  platforms: {
    flexDirection: 'row',
    gap: 10,
  },
  platformCard: {
    flex: 1,
    minHeight: 74,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 16,
    backgroundColor: Palette.card,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    opacity: 0.82,
  },
  platformCopy: {
    gap: 3,
  },
  platformName: {
    color: Palette.heading,
    fontSize: 14,
    fontWeight: '800',
  },
  storeName: {
    color: Palette.muted,
    fontSize: 11,
  },
  comingSoon: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },
  downloadNote: {
    color: Palette.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
});

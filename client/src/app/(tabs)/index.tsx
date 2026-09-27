import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>🌱</Text>
            </View>
            <Text style={styles.brandName}>Plate2Farm</Text>
          </View>
          <View style={styles.nonprofitBadge}>
            <Text style={styles.nonprofitBadgeText}>A food-waste nonprofit</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.photoCard}>
            <Image
              accessibilityLabel="Fresh produce ready to be shared"
              contentFit="cover"
              source={{
                uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
              }}
              style={StyleSheet.absoluteFill}
              transition={250}
            />
            <View style={styles.photoShade} />
            <View style={styles.photoTag}>
              <Text style={styles.photoTagText}>FROM PLATE TO FARM</Text>
            </View>
            <View style={styles.photoCaption}>
              <View style={styles.captionIcon}>
                <Text style={styles.captionIconText}>🌾</Text>
              </View>
              <View style={styles.captionCopy}>
                <Text style={styles.captionTitle}>Nothing goes to waste</Text>
                <Text style={styles.captionDescription}>Good food finds a new purpose</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowText}>GOOD FOOD. LESS WASTE.</Text>
            </View>
            <Text style={styles.headline}>
              Good food deserves a <Text style={styles.headlineAccent}>second home.</Text>
            </Text>
            <Text style={styles.description}>
              We connect restaurant surplus with local farms, keeping good food in the loop.
            </Text>
          </View>

          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>♻️</Text>
            <Text style={styles.impactText}>Better for food, farms, and our planet.</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/auth')}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Get started</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>
          <Text style={styles.footerNote}>Join us in making good food go further.</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    height: 36,
    width: 36,
    borderRadius: 13,
    backgroundColor: '#E5EFD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    fontSize: 19,
  },
  brandName: {
    color: '#253B2B',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  nonprofitBadge: {
    borderWidth: 1,
    borderColor: '#DDE5D6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  nonprofitBadgeText: {
    color: '#61715B',
    fontSize: 10,
    fontWeight: '700',
  },
  hero: {
    flex: 1,
    gap: 20,
  },
  photoCard: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#D8E2CD',
    justifyContent: 'space-between',
    padding: 15,
  },
  photoShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 47, 29, 0.12)',
  },
  photoTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.93)',
  },
  photoTagText: {
    color: '#405641',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  photoCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  captionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3E8',
  },
  captionIconText: {
    fontSize: 20,
  },
  captionCopy: {
    flex: 1,
    gap: 3,
  },
  captionTitle: {
    color: '#2D422F',
    fontSize: 13,
    fontWeight: '800',
  },
  captionDescription: {
    color: '#798174',
    fontSize: 11,
  },
  heroCopy: {
    gap: 11,
  },
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6D963F',
  },
  eyebrowText: {
    color: '#597445',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  headline: {
    color: '#253B2B',
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  headlineAccent: {
    color: '#699344',
  },
  description: {
    color: '#687166',
    fontSize: 15,
    lineHeight: 22,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#EBF0E4',
  },
  impactIcon: {
    fontSize: 18,
  },
  impactText: {
    flex: 1,
    color: '#4D6447',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#365D3D',
    paddingHorizontal: 20,
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
    fontSize: 15,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '600',
  },
  footerNote: {
    color: '#7C8277',
    fontSize: 12,
    textAlign: 'center',
  },
});

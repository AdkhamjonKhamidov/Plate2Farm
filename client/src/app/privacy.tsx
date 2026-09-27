import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/app-ui';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_NAME } from '@/constants/brand';

const sections = [
  {
    title: 'About this notice',
    body: 'Leftover uses Supabase for account authentication and its application database. Review and update this draft, including a monitored privacy contact and retention details, before public launch.',
  },
  {
    title: 'Account information',
    body: 'Supabase Auth manages your email, password credentials, and sign-in session. Leftover stores your name, account type (farmer or food provider), organization name, and optional phone number in your profile. Passwords are managed by Supabase Auth and are not stored in the app profile.',
  },
  {
    title: 'Food listings and location',
    body: 'Food providers can post food descriptions, quantities, pickup times, pickup addresses, and map coordinates. Active, unexpired listings and their exact pickup locations are visible to signed-in farmer accounts so they can decide what to collect. A provider can view its own listings; farmers can view listings they have claimed.',
  },
  {
    title: 'How information is used',
    body: 'Account and listing information supports sign-in, displays local food offers, coordinates pickups, and prevents multiple farmers from claiming the same offer. Pickup coordinates are shown on the Google Maps map so farmers can find collection locations.',
  },
  {
    title: 'Storage and service providers',
    body: 'Account and listing data is processed and stored in the selected Supabase project and its configured region. Maps are provided by Google Maps and map requests are subject to Google Maps Platform terms and privacy practices. Check both providers’ terms and configuration before enabling real user data.',
  },
  {
    title: 'Your choices and data requests',
    body: 'The app does not yet provide account export or deletion controls. Before launch, Leftover must publish a monitored privacy contact and a retention and deletion process so users can request access, correction, or deletion of their information.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.container}>
          {canGoBack ? (
            <Pressable
              accessibilityLabel="Back"
              accessibilityRole="button"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                }
              }}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
          ) : null}

          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <BrandMark size={38} />
            </View>
            <Text style={styles.brandName}>{BRAND_NAME}</Text>
          </View>

          <Text style={styles.title}>Privacy notice</Text>
          <Text style={styles.updated}>Draft · September 2026</Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          ))}
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
    paddingTop: 20,
    paddingBottom: 36,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.softGreen,
    marginBottom: 20,
  },
  backButtonText: {
    color: Palette.forest,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '500',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
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
  title: {
    color: Palette.heading,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  updated: {
    color: Palette.muted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 28,
  },
  section: {
    gap: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Palette.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
  },
  body: {
    color: Palette.muted,
    fontSize: 16,
    lineHeight: 25,
  },
});

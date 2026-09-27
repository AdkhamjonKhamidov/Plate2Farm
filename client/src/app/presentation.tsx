import { useRouter } from 'expo-router';
import { useState } from 'react';
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
import { BRAND_NAME } from '@/constants/brand';
import { DEMO_ACCOUNTS } from '@/lib/demo-data';
import { useAuth } from '@/providers/auth-provider';

export default function PresentationScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { signIn } = useAuth();
  const isWide = width >= 700;
  const [loadingRole, setLoadingRole] = useState<'farmer' | 'provider' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openDemo = async (role: 'farmer' | 'provider') => {
    const account = DEMO_ACCOUNTS.find((item) => item.profile.account_type === role);
    if (!account) {
      setError('This demo account is unavailable right now. Please try again later.');
      return;
    }

    setLoadingRole(role);
    setError(null);
    try {
      await signIn(account.email, account.password);
      router.replace('/(tabs)/dashboard');
    } catch (demoError) {
      setError(
        demoError instanceof Error
          ? demoError.message
          : 'Unable to open the presentation demo. Please try again.',
      );
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.replace('/')}
              style={styles.brand}>
              <View style={styles.brandMark}>
                <BrandMark size={34} />
              </View>
              <Text style={styles.brandName}>{BRAND_NAME}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/auth')}
              style={styles.signInButton}>
              <Text style={styles.signInText}>Sign in</Text>
            </Pressable>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>TAKE A LOOK AROUND</Text>
            <Text style={styles.title}>See good food go further.</Text>
            <Text style={styles.description}>
              Choose a perspective to explore how Leftover connects food providers with local
              farmers. No account setup needed.
            </Text>
          </View>

          {error ? (
            <View accessibilityRole="alert" style={styles.errorPanel}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.demoOptions, isWide && styles.demoOptionsWide]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingRole !== null }}
              disabled={loadingRole !== null}
              onPress={() => void openDemo('farmer')}
              style={({ pressed }) => [
                styles.demoCard,
                pressed && styles.cardPressed,
                loadingRole !== null && loadingRole !== 'farmer' && styles.cardDisabled,
              ]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.roleIcon, styles.farmerIcon]}>
                  <Text style={styles.roleIconText}>F</Text>
                </View>
                <Text style={styles.cardArrow}>{loadingRole === 'farmer' ? '…' : '→'}</Text>
              </View>
              <Text style={styles.cardEyebrow}>FOR LOCAL GROWERS</Text>
              <Text style={styles.cardTitle}>
                {loadingRole === 'farmer' ? 'Opening farmer demo…' : 'Explore as a farmer'}
              </Text>
              <Text style={styles.cardDescription}>
                Find nearby surplus food, reserve a pickup, and keep good ingredients in use.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Open farmer demo</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: loadingRole !== null }}
              disabled={loadingRole !== null}
              onPress={() => void openDemo('provider')}
              style={({ pressed }) => [
                styles.demoCard,
                pressed && styles.cardPressed,
                loadingRole !== null && loadingRole !== 'provider' && styles.cardDisabled,
              ]}>
              <View style={styles.cardTopRow}>
                <View style={[styles.roleIcon, styles.posterIcon]}>
                  <Text style={styles.roleIconText}>P</Text>
                </View>
                <Text style={styles.cardArrow}>{loadingRole === 'provider' ? '…' : '→'}</Text>
              </View>
              <Text style={styles.cardEyebrow}>FOR FOOD PROVIDERS</Text>
              <Text style={styles.cardTitle}>
                {loadingRole === 'provider' ? 'Opening poster demo…' : 'Explore as a food poster'}
              </Text>
              <Text style={styles.cardDescription}>
                Share available food, coordinate local pickups, and see the impact of each offer.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardAction}>Open food poster demo</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.accountPrompt}>
            <Text style={styles.accountPromptText}>Ready to join your local food community?</Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/auth', params: { mode: 'signUp' } })}
              style={({ pressed }) => [styles.createAccountButton, pressed && styles.cardPressed]}>
              <Text style={styles.createAccountText}>Create your free account</Text>
              <Text style={styles.createAccountArrow}>→</Text>
            </Pressable>
          </View>
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
    maxWidth: 860,
    alignSelf: 'center',
    gap: 24,
  },
  header: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: Palette.heading,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  signInButton: {
    minHeight: 42,
    minWidth: 86,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  intro: {
    maxWidth: 620,
    gap: 11,
    paddingTop: 8,
  },
  eyebrow: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: Palette.heading,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  description: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  demoOptions: {
    gap: 14,
  },
  demoOptionsWide: {
    flexDirection: 'row',
  },
  demoCard: {
    flex: 1,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
    gap: 10,
    shadowColor: Palette.forestDark,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  cardDisabled: {
    opacity: 0.62,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmerIcon: {
    backgroundColor: Palette.softGreen,
  },
  posterIcon: {
    backgroundColor: Palette.accentSoft,
  },
  roleIconText: {
    color: Palette.forestDark,
    fontSize: 17,
    fontWeight: '900',
  },
  cardArrow: {
    color: Palette.forest,
    fontSize: 24,
    fontWeight: '600',
  },
  cardEyebrow: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardTitle: {
    color: Palette.heading,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  cardDescription: {
    color: Palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  cardFooter: {
    marginTop: 7,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  cardAction: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  errorPanel: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.error,
    backgroundColor: Palette.errorSoft,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    lineHeight: 19,
  },
  accountPrompt: {
    gap: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: Palette.softGreen,
  },
  accountPromptText: {
    color: Palette.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  createAccountButton: {
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: Palette.forest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createAccountText: {
    color: Palette.card,
    fontSize: 14,
    fontWeight: '800',
  },
  createAccountArrow: {
    color: Palette.card,
    fontSize: 20,
    fontWeight: '600',
  },
  footer: {
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'center',
  },
});

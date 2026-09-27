import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/components/app-ui';
import { useAuth } from '@/providers/auth-provider';

export default function TabsLayout() {
  const { isLoading, profile, profileError, refreshProfile, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Palette.forest} />
        <Text style={styles.loadingText}>Loading your account…</Text>
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth" />;
  }

  if (!profile) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>
          {profileError ?? 'Your account profile could not be loaded.'}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void refreshProfile()}
          style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  const isFarmer = profile.account_type === 'farmer';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.forest,
        tabBarInactiveTintColor: Palette.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Home' }} />
      <Tabs.Screen
        name="explore"
        options={{
          title: isFarmer ? 'Discover' : 'Preview',
          href: isFarmer ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="pickups"
        options={{ title: 'My pickups', href: isFarmer ? undefined : null }}
      />
      <Tabs.Screen
        name="listings"
        options={{ title: 'My listings', href: isFarmer ? null : undefined }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 14,
    backgroundColor: Palette.background,
  },
  loadingText: {
    color: Palette.muted,
    fontSize: 15,
  },
  errorText: {
    color: Palette.error,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: {
    padding: 12,
  },
  retryText: {
    color: Palette.forest,
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    backgroundColor: Palette.background,
    borderTopColor: Palette.border,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

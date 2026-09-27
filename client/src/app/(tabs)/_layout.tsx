import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/providers/auth-provider';

export default function TabsLayout() {
  const { isLoading, profile, profileError, refreshProfile, session } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#365D3D" />
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
        tabBarActiveTintColor: '#365D3D',
        tabBarInactiveTintColor: '#7C8277',
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
      <Tabs.Screen name="index" options={{ href: null }} />
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
    backgroundColor: '#F8F8F1',
  },
  loadingText: {
    color: '#687166',
    fontSize: 15,
  },
  errorText: {
    color: '#A43F32',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  retry: {
    padding: 12,
  },
  retryText: {
    color: '#365D3D',
    fontSize: 15,
    fontWeight: '700',
  },
  tabBar: {
    backgroundColor: '#F8F8F1',
    borderTopColor: '#E0E5DA',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

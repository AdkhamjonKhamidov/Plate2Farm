import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import {
  fieldStyles,
  Notice,
  PageHeading,
  PrimaryButton,
  Screen,
} from '@/components/app-ui';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, saveProfile, session, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [organizationName, setOrganizationName] = useState(profile?.organization_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const save = async () => {
    if (fullName.trim().length < 2 || fullName.trim().length > 80) {
      setError('Full name must be between 2 and 80 characters.');
      return;
    }
    if (organizationName.trim().length > 120) {
      setError('Farm or organization name must be 120 characters or fewer.');
      return;
    }
    if (phone.trim().length > 30) {
      setError('Phone number must be 30 characters or fewer.');
      return;
    }
    if (phone.trim() && !/^[+()0-9 .-]+$/.test(phone.trim())) {
      setError('Enter a valid phone number.');
      return;
    }
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      await saveProfile({
        full_name: fullName,
        organization_name: organizationName,
        phone,
      });
      setNotice('Your profile has been updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const logOut = async () => {
    setIsSigningOut(true);
    setError(null);
    try {
      await signOut();
      router.replace('/auth');
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out.');
      setIsSigningOut(false);
    }
  };

  return (
    <Screen>
      <PageHeading
        eyebrow={profile?.account_type === 'farmer' ? 'Farmer account' : 'Food provider account'}
        title="Your profile"
        subtitle="Manage the details attached to your account."
      />

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Full name</Text>
        <TextInput
          accessibilityLabel="Full name"
          autoCapitalize="words"
          maxLength={80}
          onChangeText={setFullName}
          value={fullName}
          style={fieldStyles.input}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>
          {profile?.account_type === 'farmer' ? 'Farm name' : 'Organization name'}
        </Text>
        <TextInput
          accessibilityLabel="Farm or organization name"
          autoCapitalize="words"
          maxLength={120}
          onChangeText={setOrganizationName}
          placeholder="Optional"
          value={organizationName}
          style={fieldStyles.input}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Phone (optional)</Text>
        <TextInput
          accessibilityLabel="Phone number"
          autoComplete="tel"
          keyboardType="phone-pad"
          maxLength={30}
          onChangeText={setPhone}
          placeholder="Phone number"
          value={phone}
          style={fieldStyles.input}
        />
      </View>

      <View style={fieldStyles.group}>
        <Text style={fieldStyles.label}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          editable={false}
          value={session?.user.email ?? ''}
          style={[fieldStyles.input, { opacity: 0.65 }]}
        />
      </View>

      {error ? <Notice>{error}</Notice> : null}
      {notice ? <Notice tone="info">{notice}</Notice> : null}
      <PrimaryButton disabled={isSaving} onPress={() => void save()}>
        {isSaving ? 'Saving…' : 'Save profile'}
      </PrimaryButton>
      <PrimaryButton
        variant="secondary"
        disabled={isSigningOut}
        onPress={() => void logOut()}>
        {isSigningOut ? 'Signing out…' : 'Sign out'}
      </PrimaryButton>
    </Screen>
  );
}

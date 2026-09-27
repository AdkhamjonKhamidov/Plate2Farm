import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import {
  fieldStyles,
  Notice,
  PageHeading,
  PrimaryButton,
  Screen,
} from '@/components/app-ui';
import { useAuth } from '@/providers/auth-provider';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { authEvent, callbackError, clearCallbackError, isLoading, session, updatePassword } =
    useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const setNewPassword = async () => {
    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await updatePassword(password);
      setNotice('Your password has been updated.');
      setPassword('');
      setConfirmation('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  const message = callbackError ?? error;
  const isRecovery = mode === 'recovery';

  return (
    <Screen>
      <PageHeading
        eyebrow="Leftover account"
        title={isRecovery ? 'Choose a new password' : 'Confirming your account'}
        subtitle={
          isRecovery
            ? 'Use at least 8 characters for your new password.'
            : 'We are checking your secure sign-in link.'
        }
      />

      {isLoading ? (
        <ActivityIndicator color="#365D3D" />
      ) : isRecovery && session ? (
        <>
          <View style={fieldStyles.group}>
            <Text style={fieldStyles.label}>New password</Text>
            <TextInput
              accessibilityLabel="New password"
              autoCapitalize="none"
              maxLength={128}
              onChangeText={setPassword}
              secureTextEntry
              value={password}
              style={fieldStyles.input}
            />
          </View>
          <View style={fieldStyles.group}>
            <Text style={fieldStyles.label}>Confirm password</Text>
            <TextInput
              accessibilityLabel="Confirm password"
              autoCapitalize="none"
              maxLength={128}
              onChangeText={setConfirmation}
              secureTextEntry
              value={confirmation}
              style={fieldStyles.input}
            />
          </View>
          {message ? <Notice>{message}</Notice> : null}
          {notice ? <Notice tone="info">{notice}</Notice> : null}
          <PrimaryButton disabled={isSaving} onPress={() => void setNewPassword()}>
            {isSaving ? 'Updating…' : 'Update password'}
          </PrimaryButton>
          {notice ? (
            <PrimaryButton onPress={() => router.replace('/(tabs)')}>Continue</PrimaryButton>
          ) : null}
        </>
      ) : callbackError ? (
        <>
          <Notice>{callbackError}</Notice>
          <PrimaryButton
            variant="secondary"
            onPress={() => {
              clearCallbackError();
              router.replace('/auth');
            }}>
            Return to sign in
          </PrimaryButton>
        </>
      ) : session ? (
        <>
          <Notice tone="info">
            {authEvent === 'SIGNED_IN'
              ? 'Your email is confirmed and you are signed in.'
              : 'Your account is ready.'}
          </Notice>
          <PrimaryButton onPress={() => router.replace('/(tabs)')}>Continue to Leftover</PrimaryButton>
        </>
      ) : (
        <>
          <Notice>
            This link could not be used to sign in. Try signing in or request a fresh email link.
          </Notice>
          <PrimaryButton onPress={() => router.replace('/auth')}>Return to sign in</PrimaryButton>
        </>
      )}
    </Screen>
  );
}

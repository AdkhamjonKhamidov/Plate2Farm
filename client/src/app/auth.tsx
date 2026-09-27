import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette } from '@/components/app-ui';
import { BrandMark } from '@/components/brand-mark';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { validateEmail, validateSignUp } from '@/lib/validation';

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';
type AccountType = 'farmer' | 'provider';

export default function AuthScreen() {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<AuthMode>(requestedMode === 'signUp' ? 'signUp' : 'signIn');
  const [previousRequestedMode, setPreviousRequestedMode] = useState(requestedMode);
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState<'error' | 'success'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const isSignUp = mode === 'signUp';
  const isResetPassword = mode === 'resetPassword';

  if (requestedMode !== previousRequestedMode) {
    setPreviousRequestedMode(requestedMode);
    setMode(requestedMode === 'signUp' ? 'signUp' : 'signIn');
  }

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setNotice('');
    setShowPassword(false);
    setShowConfirmation(false);
  };

  const handleSubmit = async () => {
    setNotice('');
    if (isSignUp) {
      const validationError = validateSignUp({
        accountType,
        fullName,
        organizationName,
        email,
        password,
      });
      if (validationError) {
        setNoticeKind('error');
        setNotice(validationError);
        return;
      }
      if (password !== confirmation) {
        setNoticeKind('error');
        setNotice('The passwords do not match.');
        return;
      }
    } else {
      if (!validateEmail(email)) {
        setNoticeKind('error');
        setNotice('Enter a valid email address.');
        return;
      }
      if (!isResetPassword && (!password || password.length > 128)) {
        setNoticeKind('error');
        setNotice('Enter a password of 128 characters or fewer.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isResetPassword) {
        await sendPasswordReset(email);
        setNoticeKind('success');
        setNotice('If an account exists for this email, a password reset link is on its way.');
      } else if (isSignUp) {
        const result = await signUp({
          accountType,
          fullName,
          organizationName,
          email,
          password,
        });
        if (result.needsEmailConfirmation) {
          setMode('signIn');
          setShowPassword(false);
          setShowConfirmation(false);
          setNoticeKind('success');
          setNotice('Account created. Check your email to confirm your address, then sign in.');
        } else {
          router.replace('/(tabs)/dashboard');
        }
      } else {
        await signIn(email, password);
        router.replace('/(tabs)/dashboard');
      }
    } catch (error) {
      setNoticeKind('error');
      setNotice(error instanceof Error ? error.message : 'Unable to complete your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
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

            <View style={styles.intro}>
              <Text style={styles.eyebrow}>{BRAND_TAGLINE.toUpperCase()}</Text>
              <Text style={styles.title}>
                {isResetPassword
                  ? 'Reset your password'
                  : isSignUp
                    ? 'Join the good'
                    : 'Welcome back'}
              </Text>
              <Text style={styles.description}>
                {isResetPassword
                  ? 'Enter the email address connected to your account.'
                  : isSignUp
                    ? 'Create an account and help good food find its next home.'
                    : 'Sign in to continue making good food go further.'}
              </Text>
            </View>

            {!isResetPassword && (
              <View style={styles.modePicker} accessibilityRole="tablist">
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: !isSignUp }}
                  onPress={() => selectMode('signIn')}
                  style={[styles.modeButton, !isSignUp && styles.modeButtonSelected]}>
                  <Text style={[styles.modeText, !isSignUp && styles.modeTextSelected]}>
                    Sign in
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSignUp }}
                  onPress={() => selectMode('signUp')}
                  style={[styles.modeButton, isSignUp && styles.modeButtonSelected]}>
                  <Text style={[styles.modeText, isSignUp && styles.modeTextSelected]}>
                    Sign up
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={styles.form}>
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>I am joining as</Text>
                  <View style={styles.accountTypePicker}>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: accountType === 'farmer' }}
                      onPress={() => setAccountType('farmer')}
                      style={[
                        styles.accountTypeButton,
                        accountType === 'farmer' && styles.accountTypeButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === 'farmer' && styles.accountTypeTextSelected,
                        ]}>
                        Farmer
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: accountType === 'provider' }}
                      onPress={() => setAccountType('provider')}
                      style={[
                        styles.accountTypeButton,
                        accountType === 'provider' && styles.accountTypeButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.accountTypeText,
                          accountType === 'provider' && styles.accountTypeTextSelected,
                        ]}>
                        Restaurant / grocery
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    accessibilityLabel="Full name"
                    autoComplete="name"
                    autoCapitalize="words"
                    maxLength={80}
                    onChangeText={setFullName}
                    placeholder="Alex Green"
                    placeholderTextColor={Palette.muted}
                    textContentType="name"
                    value={fullName}
                    style={styles.input}
                  />
                </View>
              )}
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Farm or organization name (optional)</Text>
                  <TextInput
                    accessibilityLabel="Farm or organization name"
                    autoCapitalize="words"
                    maxLength={120}
                    onChangeText={setOrganizationName}
                    placeholder="Your farm or business"
                    placeholderTextColor={Palette.muted}
                    value={organizationName}
                    style={styles.input}
                  />
                </View>
              )}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                  accessibilityLabel="Email address"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  maxLength={254}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={Palette.muted}
                  textContentType="emailAddress"
                  value={email}
                  style={styles.input}
                />
              </View>
              {!isResetPassword && (
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.label}>Password</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      onPress={() => setShowPassword((visible) => !visible)}
                      style={styles.passwordVisibilityButton}>
                      <Text style={styles.passwordVisibilityText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    accessibilityLabel="Password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    maxLength={128}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={Palette.muted}
                    secureTextEntry={!showPassword}
                    textContentType={isSignUp ? 'newPassword' : 'password'}
                    value={password}
                    style={styles.input}
                  />
                </View>
              )}
              {isSignUp && (
                <View style={styles.fieldGroup}>
                  <View style={styles.fieldLabelRow}>
                    <Text style={styles.label}>Confirm password</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        showConfirmation ? 'Hide confirmed password' : 'Show confirmed password'
                      }
                      onPress={() => setShowConfirmation((visible) => !visible)}
                      style={styles.passwordVisibilityButton}>
                      <Text style={styles.passwordVisibilityText}>
                        {showConfirmation ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                  </View>
                  <TextInput
                    accessibilityLabel="Confirm password"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    maxLength={128}
                    onChangeText={setConfirmation}
                    placeholder="Enter your password again"
                    placeholderTextColor={Palette.muted}
                    secureTextEntry={!showConfirmation}
                    textContentType="newPassword"
                    value={confirmation}
                    style={styles.input}
                  />
                </View>
              )}
              {!isSignUp && !isResetPassword && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectMode('resetPassword')}
                  style={styles.forgotPasswordButton}>
                  <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                </Pressable>
              )}
              {!isSupabaseConfigured() ? (
                <Text style={styles.errorNotice}>
                  Supabase is not configured. You can still explore with a presentation demo.
                </Text>
              ) : null}
              {notice ? (
                <Text style={noticeKind === 'error' ? styles.errorNotice : styles.notice}>
                  {notice}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting || !isSupabaseConfigured() }}
                disabled={isSubmitting || !isSupabaseConfigured()}
                onPress={() => void handleSubmit()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  (isSubmitting || !isSupabaseConfigured()) && styles.buttonDisabled,
                ]}>
                <Text style={styles.primaryButtonText}>
                  {isSubmitting
                    ? 'Please wait…'
                    : isResetPassword
                      ? 'Send reset link'
                      : isSignUp
                        ? 'Create account'
                        : 'Sign in'}
                </Text>
                <Text style={styles.buttonArrow}>→</Text>
              </Pressable>
              {!isSignUp && !isResetPassword ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push('/presentation')}
                  style={({ pressed }) => [styles.demoLink, pressed && styles.buttonPressed]}>
                  <View style={styles.demoLinkCopy}>
                    <Text style={styles.demoLinkTitle}>Explore the presentation demo</Text>
                    <Text style={styles.demoLinkDescription}>
                      Preview the experience as a farmer or food poster.
                    </Text>
                  </View>
                  <Text style={styles.demoArrow}>→</Text>
                </Pressable>
              ) : null}
              {isResetPassword && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => selectMode('signIn')}
                  style={styles.returnButton}>
                  <Text style={styles.returnButtonText}>Back to sign in</Text>
                </Pressable>
              )}
            </View>

            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/privacy')}
              style={styles.privacyLink}>
              <Text style={styles.privacyLinkText}>Privacy notice</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push('/')}
              style={styles.downloadLink}>
              <Text style={styles.privacyLinkText}>Get the app</Text>
            </Pressable>
            <Text style={styles.footerNote}>Together, we can make good food go further.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  formContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flex: 1,
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
    gap: 9,
    marginBottom: 30,
  },
  brandMark: {
    height: 36,
    width: 36,
    borderRadius: 13,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: Palette.heading,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  intro: {
    gap: 10,
    marginBottom: 26,
  },
  eyebrow: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: Palette.heading,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  description: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  modePicker: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    backgroundColor: Palette.backgroundElement,
    marginBottom: 22,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonSelected: {
    backgroundColor: Palette.card,
  },
  modeText: {
    color: Palette.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextSelected: {
    color: Palette.forest,
    fontWeight: '800',
  },
  form: {
    gap: 17,
  },
  fieldGroup: {
    gap: 8,
  },
  accountTypePicker: {
    flexDirection: 'row',
    gap: 8,
  },
  accountTypeButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    backgroundColor: Palette.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTypeButtonSelected: {
    borderColor: Palette.forest,
    backgroundColor: Palette.softGreen,
  },
  accountTypeText: {
    color: Palette.muted,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  accountTypeTextSelected: {
    color: Palette.forest,
    fontWeight: '800',
  },
  label: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordVisibilityButton: {
    minHeight: 24,
    justifyContent: 'center',
  },
  passwordVisibilityText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 15,
    backgroundColor: Palette.card,
    paddingHorizontal: 16,
    color: Palette.heading,
    fontSize: 15,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  notice: {
    color: Palette.forest,
    fontSize: 13,
    lineHeight: 19,
  },
  errorNotice: {
    color: Palette.error,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: Palette.forest,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: Palette.card,
    fontSize: 15,
    fontWeight: '700',
  },
  demoLink: {
    minHeight: 76,
    marginTop: 5,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.backgroundElement,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  demoLinkCopy: {
    flex: 1,
    gap: 4,
  },
  demoLinkTitle: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '800',
  },
  demoLinkDescription: {
    color: Palette.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  demoArrow: {
    color: Palette.forest,
    fontSize: 19,
    fontWeight: '700',
  },
  buttonArrow: {
    color: Palette.card,
    fontSize: 21,
    fontWeight: '600',
  },
  returnButton: {
    alignSelf: 'center',
  },
  returnButtonText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    color: Palette.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  privacyLink: {
    alignSelf: 'center',
    marginTop: 24,
  },
  privacyLinkText: {
    color: Palette.forest,
    fontSize: 13,
    fontWeight: '700',
  },
  downloadLink: {
    alignSelf: 'center',
    marginTop: 12,
  },
});

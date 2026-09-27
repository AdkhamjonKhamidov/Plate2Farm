import { useRouter } from 'expo-router';
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

import { BrandMark } from '@/components/brand-mark';
import { BRAND_NAME, BRAND_TAGLINE } from '@/constants/brand';
import { useAuth } from '@/providers/auth-provider';
import { isSupabaseConfigured } from '@/lib/supabase';
import { validateEmail, validateSignUp } from '@/lib/validation';

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';
type AccountType = 'farmer' | 'provider';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [fullName, setFullName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeKind, setNoticeKind] = useState<'error' | 'success'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const isSignUp = mode === 'signUp';
  const isResetPassword = mode === 'resetPassword';

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setNotice('');
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
          setNoticeKind('success');
          setNotice('Account created. Check your email to confirm your address, then sign in.');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        await signIn(email, password);
        router.replace('/(tabs)');
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
            <Pressable
              accessibilityLabel="Back to home"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </Pressable>
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
                    placeholderTextColor="#9AA095"
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
                    placeholderTextColor="#9AA095"
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
                  placeholderTextColor="#9AA095"
                  textContentType="emailAddress"
                  value={email}
                  style={styles.input}
                />
              </View>
              {!isResetPassword && (
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    accessibilityLabel="Password"
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    autoCapitalize="none"
                    maxLength={128}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9AA095"
                    secureTextEntry
                    textContentType={isSignUp ? 'newPassword' : 'password'}
                    value={password}
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
                  Add your Supabase URL and publishable key to client/.env to enable account access.
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
    backgroundColor: '#F8F8F1',
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
    backgroundColor: '#EBF0E4',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#365D3D',
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
    backgroundColor: '#E5EFD9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: '#253B2B',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  intro: {
    gap: 10,
    marginBottom: 26,
  },
  eyebrow: {
    color: '#597445',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  title: {
    color: '#253B2B',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  description: {
    color: '#687166',
    fontSize: 15,
    lineHeight: 22,
  },
  modePicker: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    backgroundColor: '#EBEEE6',
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
    backgroundColor: '#FFFFFF',
  },
  modeText: {
    color: '#697266',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTextSelected: {
    color: '#365D3D',
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
    borderColor: '#E0E5DA',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTypeButtonSelected: {
    borderColor: '#365D3D',
    backgroundColor: '#EBF0E4',
  },
  accountTypeText: {
    color: '#697266',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
  accountTypeTextSelected: {
    color: '#365D3D',
    fontWeight: '800',
  },
  label: {
    color: '#344333',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#E0E5DA',
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    color: '#253B2B',
    fontSize: 15,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    color: '#365D3D',
    fontSize: 13,
    fontWeight: '700',
  },
  notice: {
    color: '#597445',
    fontSize: 13,
    lineHeight: 19,
  },
  errorNotice: {
    color: '#A43F32',
    fontSize: 13,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#365D3D',
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
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '600',
  },
  returnButton: {
    alignSelf: 'center',
  },
  returnButtonText: {
    color: '#365D3D',
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    color: '#7C8277',
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
    color: '#597445',
    fontSize: 13,
    fontWeight: '700',
  },
});

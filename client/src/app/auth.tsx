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

type AuthMode = 'signIn' | 'signUp' | 'resetPassword';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const isSignUp = mode === 'signUp';
  const isResetPassword = mode === 'resetPassword';

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setNotice('');
  };

  const handleSubmit = () => {
    setNotice(
      isResetPassword
        ? 'Password recovery will be available once authentication is connected.'
        : 'Account access will be available once authentication is connected.',
    );
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
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    accessibilityLabel="Full name"
                    autoComplete="name"
                    autoCapitalize="words"
                    onChangeText={setFullName}
                    placeholder="Alex Green"
                    placeholderTextColor="#9AA095"
                    textContentType="name"
                    value={fullName}
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
              {notice ? <Text style={styles.notice}>{notice}</Text> : null}
              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                <Text style={styles.primaryButtonText}>
                  {isResetPassword ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in'}
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
});

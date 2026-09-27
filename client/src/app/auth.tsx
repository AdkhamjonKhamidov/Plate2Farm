import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

type AuthMode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signIn');
  const isSignUp = mode === 'signUp';

  const handleSubmit = () => {
    Alert.alert('Authentication unavailable', 'Sign in and account creation are not connected yet.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityLabel="Back to home"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>🌱</Text>
            </View>
            <Text style={styles.brandName}>Plate2Farm</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.eyebrow}>GOOD FOOD. LESS WASTE.</Text>
            <Text style={styles.title}>{isSignUp ? 'Join the good' : 'Welcome back'}</Text>
            <Text style={styles.description}>
              {isSignUp
                ? 'Create an account and help good food find its next home.'
                : 'Sign in to continue making good food go further.'}
            </Text>
          </View>

          <View style={styles.modePicker}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: !isSignUp }}
              onPress={() => setMode('signIn')}
              style={[styles.modeButton, !isSignUp && styles.modeButtonSelected]}>
              <Text style={[styles.modeText, !isSignUp && styles.modeTextSelected]}>Sign in</Text>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: isSignUp }}
              onPress={() => setMode('signUp')}
              style={[styles.modeButton, isSignUp && styles.modeButtonSelected]}>
              <Text style={[styles.modeText, isSignUp && styles.modeTextSelected]}>Sign up</Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Your name</Text>
                <TextInput
                  autoComplete="name"
                  autoCapitalize="words"
                  placeholder="Alex Green"
                  placeholderTextColor="#9AA095"
                  style={styles.input}
                />
              </View>
            )}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoComplete="email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#9AA095"
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="Enter your password"
                placeholderTextColor="#9AA095"
                secureTextEntry
                style={styles.input}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Create account' : 'Sign in'}
              </Text>
              <Text style={styles.buttonArrow}>→</Text>
            </Pressable>
          </View>

          <Text style={styles.footerNote}>
            Together, we can make good food go further.
          </Text>
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
    marginBottom: 34,
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
  intro: {
    gap: 10,
    marginBottom: 28,
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
    marginBottom: 24,
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
    gap: 18,
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
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#365D3D',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
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
    marginTop: 'auto',
    paddingTop: 32,
  },
});

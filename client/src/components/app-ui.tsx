import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const Palette = {
  background: '#F2F5F0',
  card: '#FFFFFF',
  backgroundElement: '#EAF1EA',
  border: '#D7E0D7',
  forest: '#1F6B4A',
  forestDark: '#0F3D2E',
  heading: '#12241C',
  text: '#3E5248',
  muted: '#6B7C73',
  softGreen: '#D9EFE4',
  primarySoft: '#D9EFE4',
  accent: '#C45C26',
  accentSoft: '#F8E7DC',
  warn: '#B86E14',
  warnSoft: '#F8ECD8',
  error: '#B83A3A',
  errorSoft: '#F8E0E0',
  success: '#1F6B4A',
  header: '#3A2F28',
  headerMuted: '#E6D5C3',
} as const;

export function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Panel({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function PrimaryButton({
  children,
  disabled,
  onPress,
  accessibilityLabel,
  variant = 'primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onPress: PressableProps['onPress'];
  accessibilityLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        (pressed || disabled) && styles.buttonMuted,
      ]}>
      <Text style={variant === 'secondary' ? styles.secondaryText : styles.buttonText}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Notice({ children, tone = 'error' }: PropsWithChildren<{ tone?: 'error' | 'info' }>) {
  return (
    <View style={[styles.notice, tone === 'error' ? styles.errorNotice : styles.infoNotice]}>
      <Text style={tone === 'error' ? styles.errorText : styles.infoText}>{children}</Text>
    </View>
  );
}

export const fieldStyles = StyleSheet.create({
  group: {
    gap: 8,
  },
  label: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 15,
    backgroundColor: Palette.card,
    paddingHorizontal: 15,
    color: Palette.heading,
    fontSize: 15,
  },
  multiline: {
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
    alignItems: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 940,
    gap: 22,
  },
  heading: {
    gap: 8,
    paddingTop: 8,
  },
  eyebrow: {
    color: Palette.forest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: Palette.heading,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: Palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    gap: 14,
    padding: 18,
    borderRadius: 22,
    backgroundColor: Palette.card,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: Palette.forest,
  },
  secondary: {
    backgroundColor: Palette.softGreen,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  danger: {
    backgroundColor: Palette.error,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryText: {
    color: Palette.forest,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonMuted: {
    opacity: 0.72,
  },
  notice: {
    padding: 13,
    borderRadius: 13,
  },
  errorNotice: {
    backgroundColor: Palette.errorSoft,
  },
  infoNotice: {
    backgroundColor: Palette.softGreen,
  },
  errorText: {
    color: Palette.error,
    fontSize: 13,
    lineHeight: 19,
  },
  infoText: {
    color: Palette.forest,
    fontSize: 13,
    lineHeight: 19,
  },
});

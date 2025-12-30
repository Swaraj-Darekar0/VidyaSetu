import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { OnboardingPalette } from '@/constants/onboarding';
import { useLanguage } from '@/contexts/language';
import { upsertUserProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

const modes = [
  { key: 'login', label: 'Log in' },
  { key: 'signup', label: 'Sign up' },
] as const;

type Mode = (typeof modes)[number]['key'];

const socialProviders = [
  { key: 'google', label: 'Continue with Google', icon: 'logo-google' },
  { key: 'apple', label: 'Sign in with Apple', icon: 'logo-apple' },
];

const BACKGROUND_ROUTE = '/onboarding/background' as const;
const CLASS_SELECTION_ROUTE = '/onboarding/class-selection' as const;
const SUBJECT_SELECTION_ROUTE = '/onboarding/subject-selection' as const;
const HOME_ROUTE = '/(tabs)' as const;

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { copy } = useLanguage();
  const authCopy = copy.auth;

  const title = useMemo(() => (mode === 'login' ? authCopy.loginTitle : authCopy.signupTitle), [authCopy, mode]);
  const subtitle = useMemo(
    () => (mode === 'login' ? authCopy.loginSubtitle : authCopy.signupSubtitle),
    [authCopy, mode],
  );

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedPassword || (mode === 'signup' && !trimmedName)) {
      setErrorMessage(authCopy.validationMessage);
      console.warn('[auth] validation failed', { trimmedEmail, trimmedPasswordLength: trimmedPassword.length, mode });
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      console.log('[auth] handleSubmit:start', { mode, email: trimmedEmail });

      let userId: string | undefined;

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (error) throw error;
        userId = data.user?.id;
        console.log('[auth] login success', { email: trimmedEmail });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPassword,
          options: {
            data: {
              full_name: trimmedName,
            },
          },
        });
        if (error) throw error;

        userId = data.user?.id;
        if (!userId) {
          throw new Error('Signup succeeded but user information is missing.');
        }

        await upsertUserProfile({ userId, fullName: trimmedName, email: trimmedEmail });
        console.log('[auth] signup success', { email: trimmedEmail, userId });
      }

      if (!userId) {
        throw new Error('Unable to load your account. Please try again.');
      }

      const nextRoute = await resolveNextOnboardingRoute(userId);
      router.replace(nextRoute as never);
      console.log('[auth] navigate', { destination: nextRoute });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMessage(message);
      console.error('[auth] handleSubmit:error', err);
    } finally {
      setSubmitting(false);
      console.log('[auth] handleSubmit:complete');
    }
  };

  const canSubmit =
    !!email.trim() &&
    !!password.trim() &&
    (mode === 'login' || (!!name.trim() && mode === 'signup')) &&
    !submitting;

  const stepText = useMemo(() => authCopy.stepLabel(0, 3), [authCopy]);
  const primaryCta = mode === 'login' ? authCopy.loginCta : authCopy.signupCta;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <View>
          <Text style={styles.stepText}>{stepText}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: '15%' }]} />
          </View>
        </View>

        <View>
          <Text style={styles.eyebrow}>{authCopy.eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <LanguageSwitcher />

        <View style={styles.modeSwitch}>
          {modes.map((item) => {
            const isActive = mode === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                accessibilityRole="button"
                onPress={() => setMode(item.key)}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}
                activeOpacity={0.9}>
                <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                  {item.key === 'login' ? authCopy.modeLogin : authCopy.modeSignup}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.formGroup}>
          {mode === 'signup' && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{authCopy.nameLabel}</Text>
              <TextInput
                placeholder="Ada Lovelace"
                placeholderTextColor={OnboardingPalette.muted}
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{authCopy.emailLabel}</Text>
            <TextInput
              placeholder="you@email.com"
              placeholderTextColor={OnboardingPalette.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>{authCopy.passwordLabel}</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={OnboardingPalette.muted}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          activeOpacity={0.8}
          disabled={!canSubmit}
          onPress={handleSubmit}>
          {submitting ? (
            <ActivityIndicator color={OnboardingPalette.background} />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>{primaryCta}</Text>
              <Ionicons name="arrow-forward" size={18} color={OnboardingPalette.background} />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.helperText}>
          {authCopy.helperText}
        </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const resolveNextOnboardingRoute = async (userId: string) => {
  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('mother_tongue, school_type, class_id, subjects')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('[auth] resolveNextOnboardingRoute:error', error);
    throw error;
  }

  if (!data || !data.mother_tongue || !data.school_type) {
    return BACKGROUND_ROUTE;
  }

  if (!data.class_id) {
    return CLASS_SELECTION_ROUTE;
  }

  if (!data.subjects || (Array.isArray(data.subjects) && data.subjects.length === 0)) {
    return SUBJECT_SELECTION_ROUTE;
  }

  return HOME_ROUTE;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: OnboardingPalette.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 20,
    backgroundColor: OnboardingPalette.background,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  stepText: {
    color: OnboardingPalette.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: OnboardingPalette.accent,
  },
  eyebrow: {
    color: OnboardingPalette.accent,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: OnboardingPalette.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: OnboardingPalette.textSecondary,
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: OnboardingPalette.surface,
    padding: 6,
    borderRadius: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: OnboardingPalette.card,
  },
  modeLabel: {
    color: OnboardingPalette.textSecondary,
    fontWeight: '600',
  },
  modeLabelActive: {
    color: OnboardingPalette.textPrimary,
  },
  formGroup: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: OnboardingPalette.surface,
    color: OnboardingPalette.textPrimary,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: OnboardingPalette.accent,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 54,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontWeight: '700',
    color: OnboardingPalette.background,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  forgotText: {
    color: OnboardingPalette.textSecondary,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: OnboardingPalette.outline,
  },
  dividerLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: OnboardingPalette.surface,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialLabel: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  helperText: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  link: {
    color: OnboardingPalette.accent,
    fontWeight: '600',
  },
});

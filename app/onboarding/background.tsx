import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageSwitcher } from '@/components/language-switcher';
import { OnboardingPalette } from '@/constants/onboarding';
import { useLanguage } from '@/contexts/language';
import { getCurrentUserId, upsertOnboardingProgress } from '@/lib/profile';

const schoolOptions = [
  { id: 'english', label: 'English Medium' },
  { id: 'marathi', label: 'Marathi Medium' },
  { id: 'other', label: 'Other Medium' },
] as const;

export default function BackgroundScreen() {
  const { language, copy } = useLanguage();
  const [schoolType, setSchoolType] = useState<typeof schoolOptions[number]['id']>('english');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const onboardingCopy = copy.onboarding;

  const handleContinue = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      console.log('[onboarding/background] handleContinue:start', { language, schoolType });
      const userId = await getCurrentUserId();
      await upsertOnboardingProgress({
        userId,
        motherTongue: language,
        schoolType,
        currentStep: 1,
      });

      console.log('[onboarding/background] handleContinue:success');
      router.push('/onboarding/class-selection');
    } catch (error) {
      console.error('[onboarding/background] handleContinue:error', error);
      const message =
        error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Unable to save your info. Please try again.';
      setErrorMessage(message);
    } finally {
      setSaving(false);
      console.log('[onboarding/background] handleContinue:complete');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrapper}>
          <View style={styles.iconBadge}>
            <Ionicons name="sparkles-outline" size={24} color={OnboardingPalette.background} />
          </View>
        </View>

        <Text style={styles.eyebrow}>{onboardingCopy.backgroundEyebrow}</Text>
        <Text style={styles.title}>{onboardingCopy.backgroundTitle}</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{onboardingCopy.motherTongueLabel}</Text>
          <LanguageSwitcher style={styles.languageSwitcher} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{onboardingCopy.typeOfSchoolLabel}</Text>
          <View style={styles.optionList}>
            {schoolOptions.map((option) => {
              const isActive = schoolType === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.optionCard, isActive && styles.optionCardActive]}
                  activeOpacity={0.9}
                  onPress={() => setSchoolType(option.id)}>
                  <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{option.label}</Text>
                  <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} disabled={saving} onPress={handleContinue}>
          <Text style={styles.primaryLabel}>{saving ? onboardingCopy.savingLabel : onboardingCopy.continueCta}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: OnboardingPalette.background,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  iconWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  iconBadge: {
    height: 68,
    width: 68,
    borderRadius: 34,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
  },
  title: {
    color: OnboardingPalette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  fieldGroup: {
    gap: 12,
  },
  fieldLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 14,
  },
  languageSwitcher: {
    gap: 8,
  },
  inputWrapper: {
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    color: OnboardingPalette.textPrimary,
    fontSize: 16,
    marginRight: 12,
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    backgroundColor: OnboardingPalette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardActive: {
    borderColor: OnboardingPalette.accent,
    backgroundColor: '#1f1f1f',
  },
  optionLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  optionLabelActive: {
    color: OnboardingPalette.textPrimary,
  },
  radio: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: OnboardingPalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: OnboardingPalette.accent,
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: OnboardingPalette.accent,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  primaryButton: {
    height: 56,
    borderRadius: 24,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: OnboardingPalette.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

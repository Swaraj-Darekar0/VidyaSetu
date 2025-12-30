import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPalette, classOptions } from '@/constants/onboarding';
import { getCurrentUserId, upsertOnboardingProgress } from '@/lib/profile';

export default function ClassSelectionScreen() {
  const [selectedClassId, setSelectedClassId] = useState(classOptions[1]?.id ?? '6');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedIndex = useMemo(
    () => classOptions.findIndex((item) => item.id === selectedClassId) + 1,
    [selectedClassId],
  );

  const handleContinue = async () => {
    try {
      setSaving(true);
      setErrorMessage(null);
      console.log('[onboarding/class] handleContinue:start', { selectedClassId });
      const userId = await getCurrentUserId();
      await upsertOnboardingProgress({
        userId,
        classId: selectedClassId,
        currentStep: 1,
      });

      router.push('/onboarding/subject-selection');
      console.log('[onboarding/class] navigate', { destination: '/onboarding/subject-selection' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your selection. Please try again.';
      setErrorMessage(message);
      console.error('[onboarding/class] handleContinue:error', error);
    } finally {
      setSaving(false);
      console.log('[onboarding/class] handleContinue:complete');
    }
  };

  const handleSelectClass = (id: string) => {
    console.log('[onboarding/class] optionPressed', { id, previous: selectedClassId });
    setSelectedClassId(id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.stepText}>Step 1 of 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: '33%' }]} />
          </View>
        </View>

        <View>
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>Select Your Class</Text>
          <Text style={styles.subtitle}>Choose the grade you&apos;re currently studying in.</Text>
        </View>

        <View style={styles.selectionSummary}>
          <Text style={styles.summaryLabel}>Currently selected</Text>
          <Text style={styles.summaryValue}>{`Class ${selectedClassId}`}</Text>
          <Text style={styles.summaryHint}>{`Popular pick #${selectedIndex}`}</Text>
        </View>

        <View style={styles.grid}>
          {classOptions.map((item) => {
            const isActive = selectedClassId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, isActive && styles.cardActive]}
                activeOpacity={0.9}
                onPress={() => handleSelectClass(item.id)}>
                <View style={styles.cardHeader}>
                  <Ionicons
                    name="school-outline"
                    size={18}
                    color={isActive ? OnboardingPalette.background : OnboardingPalette.textSecondary}
                    style={styles.cardIcon}
                  />
                  {isActive && (
                    <View style={styles.pill}>
                      <Ionicons name="checkmark" size={14} color={OnboardingPalette.background} />
                    </View>
                  )}
                </View>
                <Text style={[styles.cardTitle, isActive && styles.cardTitleActive]}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={OnboardingPalette.textPrimary} />
          <Text style={styles.secondaryLabel}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.9}
          disabled={saving}
          onPress={handleContinue}>
          <Text style={styles.primaryLabel}>{saving ? 'Saving...' : 'Continue'}</Text>
          {!saving && <Ionicons name="arrow-forward" size={18} color={OnboardingPalette.background} />}
        </TouchableOpacity>
      </View>
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
    gap: 20,
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
    marginTop: 6,
  },
  selectionSummary: {
    backgroundColor: OnboardingPalette.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  summaryLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    color: OnboardingPalette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  summaryHint: {
    color: OnboardingPalette.accent,
    marginTop: 4,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    gap: 8,
  },
  cardActive: {
    backgroundColor: OnboardingPalette.accent,
    borderColor: OnboardingPalette.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  pill: {
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: OnboardingPalette.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  cardTitleActive: {
    color: OnboardingPalette.background,
  },
  cardSubtitle: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  footer: {
    padding: 24,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: OnboardingPalette.background,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: OnboardingPalette.surface,
  },
  secondaryLabel: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    backgroundColor: OnboardingPalette.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryLabel: {
    color: OnboardingPalette.background,
    fontWeight: '700',
    fontSize: 16,
  },
});

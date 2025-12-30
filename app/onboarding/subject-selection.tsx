import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPalette, SubjectOption, getSubjectsForClass } from '@/constants/onboarding';
import { getCurrentUserId, upsertOnboardingProgress } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

export default function SubjectSelectionScreen() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>([]);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectLoadError, setSubjectLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectLoadError(null);
        const userId = await getCurrentUserId();
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('class_id, subjects')
          .eq('user_id', userId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        const classId = data?.class_id ?? '5';
        const classSubjects = getSubjectsForClass(classId);
        if (!isMounted) return;

        setAvailableSubjects(classSubjects);
        setSelectedSubjects((prev) => {
          if (data?.subjects?.length) {
            return data.subjects as string[];
          }

          const stillValid = prev.filter((id) => classSubjects.some((subject) => subject.id === id));
          if (stillValid.length) return stillValid;
          if (classSubjects.length) return [classSubjects[0].id];
          return [];
        });
      } catch (err) {
        console.error('[onboarding/subject] fetchSubjects:error', err);
        if (!isMounted) return;
        setSubjectLoadError('Unable to load subjects. Please try again.');
      } finally {
        if (isMounted) {
          setLoadingSubjects(false);
        }
      }
    };

    fetchSubjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSubject = (id: string) => {
    console.log('[onboarding/subject] toggleSubject', { id });
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((subjectId) => subjectId !== id) : [...prev, id],
    );
  };

  const summaryText = useMemo(() => {
    if (!selectedSubjects.length) return 'Pick at least one subject to begin.';
    const highlight = availableSubjects.find((item) => item.id === selectedSubjects[0]);
    return `${selectedSubjects.length} selected · ${highlight?.title ?? 'Personalised focus'}`;
  }, [availableSubjects, selectedSubjects]);

  const handleContinue = async () => {
    if (!selectedSubjects.length) {
      setErrorMessage('Pick at least one subject to continue.');
      console.warn('[onboarding/subject] validation failed');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      console.log('[onboarding/subject] handleContinue:start', { selectedSubjects, remindersEnabled });
      const userId = await getCurrentUserId();
      await upsertOnboardingProgress({
        userId,
        subjects: selectedSubjects,
        currentStep: 2,
      });

      router.replace('/(tabs)' as never);
      console.log('[onboarding/subject] navigate', { destination: '/(tabs)' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your subjects. Please try again.';
      setErrorMessage(message);
      console.error('[onboarding/subject] handleContinue:error', error);
    } finally {
      setSaving(false);
      console.log('[onboarding/subject] handleContinue:complete');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.stepText}>Step 2 of 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: '66%' }]} />
          </View>
        </View>

        <View>
          <Text style={styles.eyebrow}>Learning focus</Text>
          <Text style={styles.title}>What would you like to learn?</Text>
          <Text style={styles.subtitle}>Select subjects (you can add more later).</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Your plan</Text>
          <Text style={styles.summaryValue}>{summaryText}</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryHint}>Smart reminders</Text>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: OnboardingPalette.surface, true: OnboardingPalette.accentMuted }}
              thumbColor={remindersEnabled ? OnboardingPalette.background : OnboardingPalette.muted}
            />
          </View>
        </View>

        <View style={styles.list}>
          {loadingSubjects && (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={OnboardingPalette.accent} />
              <Text style={styles.loadingLabel}>Loading subjects…</Text>
            </View>
          )}
          {subjectLoadError && <Text style={styles.errorText}>{subjectLoadError}</Text>}
          {!loadingSubjects && !availableSubjects.length ? (
            <Text style={styles.subjectDescription}>No subjects available for your class yet.</Text>
          ) : null}
          {availableSubjects.map((subject) => {
            const isActive = selectedSubjects.includes(subject.id);
            return (
              <TouchableOpacity
                key={subject.id}
                style={[styles.listItem, isActive && styles.listItemActive]}
                activeOpacity={0.9}
                onPress={() => toggleSubject(subject.id)}>
                <View style={styles.itemLeft}>
                  <View style={[styles.iconBadge, isActive && styles.iconBadgeActive]}>
                    <Ionicons
                      name={subject.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={isActive ? OnboardingPalette.background : OnboardingPalette.textPrimary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.subjectTitle, isActive && styles.subjectTitleActive]}>
                      {subject.title}
                    </Text>
                    <Text style={styles.subjectDescription}>{subject.description}</Text>
                  </View>
                </View>
                <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                  {isActive && (
                    <Ionicons name="checkmark" size={16} color={OnboardingPalette.background} />
                  )}
                </View>
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
          style={[styles.primaryButton, (!selectedSubjects.length || saving) && styles.primaryButtonDisabled]}
          activeOpacity={0.85}
          disabled={!selectedSubjects.length || saving}
          onPress={handleContinue}>
          <Text style={styles.primaryLabel}>{saving ? 'Saving...' : 'Finish'}</Text>
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
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: OnboardingPalette.textSecondary,
    marginTop: 6,
  },
  summaryCard: {
    backgroundColor: OnboardingPalette.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    gap: 10,
  },
  summaryLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    color: OnboardingPalette.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryHint: {
    color: OnboardingPalette.textSecondary,
  },
  list: {
    gap: 12,
  },
  loadingCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: OnboardingPalette.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  loadingLabel: {
    color: OnboardingPalette.textPrimary,
  },
  listItem: {
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  listItemActive: {
    backgroundColor: OnboardingPalette.card,
    borderColor: OnboardingPalette.accent,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    height: 46,
    width: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconBadgeActive: {
    backgroundColor: OnboardingPalette.accent,
  },
  subjectTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  subjectTitleActive: {
    color: OnboardingPalette.accent,
  },
  subjectDescription: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  checkbox: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: OnboardingPalette.accent,
    borderColor: OnboardingPalette.accent,
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
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryLabel: {
    color: OnboardingPalette.background,
    fontWeight: '700',
    fontSize: 16,
  },
});

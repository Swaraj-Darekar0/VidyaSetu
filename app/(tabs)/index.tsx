import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPalette, classOptions, getSubjectDefinition } from '@/constants/onboarding';
import { useLanguage } from '@/contexts/language';
import { QuickActionKey } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const quickActionOrder: QuickActionKey[] = ['ask', 'solve'];
const quickActionIcons: Record<QuickActionKey, keyof typeof Ionicons.glyphMap> = {
  ask: 'mic-outline',
  solve: 'pencil-outline',
};

const statConfig = [
  { id: 'questions', label: 'Questions asked today', key: 'questions_today' },
  { id: 'problems', label: 'Problems solved', key: 'problems_solved' },
  { id: 'streak', label: 'Study streak', key: 'streak_days' },
] as const;

type SelectedSubject = {
  id: string;
  title: string;
  meta: string;
  icon: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { copy } = useLanguage();
  const [profileName, setProfileName] = useState('Student');
  const [statCards, setStatCards] = useState(() => statConfig.map((item) => ({ ...item, value: '0' })));
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [classLabel, setClassLabel] = useState<string | null>(null);
  const homeCopy = copy.home;

  const greetSubtitle = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  }, []);

  const quickActions = useMemo(
    () =>
      quickActionOrder.map((key) => ({
        id: key,
        icon: quickActionIcons[key],
        ...homeCopy.quickActions[key],
      })),
    [homeCopy],
  );

  const effectiveClassLabel = classLabel ?? homeCopy.statusFallback;

  const fetchHomeData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        router.replace('/onboarding/login');
        return;
      }

      const [profileRes, statsRes, onboardingRes] = await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('id', user.id).maybeSingle(),
        supabase
          .from('home_stats')
          .select('questions_today, problems_solved, streak_days')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase.from('onboarding_progress').select('subjects, class_id').eq('user_id', user.id).maybeSingle(),
      ]);

      if (profileRes.data?.full_name) {
        setProfileName(profileRes.data.full_name);
      } else if (user.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name);
      } else if (user.email) {
        setProfileName(user.email.split('@')[0] ?? 'Learner');
      }

      const mappedStats = statConfig.map((item) => ({
        ...item,
        value: statsRes.data?.[item.key as keyof typeof statsRes.data]?.toString() ?? '0',
      }));
      setStatCards(mappedStats);

      const subjects = (onboardingRes.data?.subjects ?? []) as string[];
      const mappedSubjects = subjects
        .map((subjectId) => {
          const definition = getSubjectDefinition(subjectId);
          if (!definition) return null;
          return {
            id: subjectId,
            title: definition.title,
            meta: definition.description,
            icon: definition.icon,
          } satisfies SelectedSubject;
        })
        .filter(Boolean) as SelectedSubject[];

      setSelectedSubjects(mappedSubjects);

      const classId = onboardingRes.data?.class_id ?? null;
      if (classId) {
        const match = classOptions.find((option) => option.id === classId);
        setClassLabel(match?.label ?? `Class ${classId}`);
      } else {
        setClassLabel(null);
      }
    } catch (error) {
      console.error('[home] fetchHomeData', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load home data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  }, [fetchHomeData]);

  const handleOpenSubject = useCallback(
    (subjectId: string) => {
      router.push({ pathname: '/subject/[subjectId]', params: { subjectId } } as never);
    },
    [router],
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/onboarding/login');
        },
      },
    ]);
  }, [router]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingState]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={OnboardingPalette.accent} />}>
        <View style={styles.appBar}>
          <Ionicons name="leaf-outline" size={20} color={OnboardingPalette.accent} />
          <Text style={styles.appBarTitle}>{homeCopy.appBarTitle}</Text>
          <View style={styles.appBarActions}>
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons name="school-outline" size={20} color={OnboardingPalette.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={20} color={OnboardingPalette.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={handleLogout}>
              <Ionicons name="settings-outline" size={20} color={OnboardingPalette.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroGreeting}>{homeCopy.heroGreeting(profileName)}</Text>
            <Text style={styles.heroSubtext}>{greetSubtitle}</Text>
          </View>
          <View style={styles.heroStatusRow}>
            <View style={styles.statusPill}>
              <Ionicons name="school-outline" size={14} color={OnboardingPalette.accent} />
              <Text style={styles.statusLabel}>{effectiveClassLabel}</Text>
            </View>
          </View>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickCard} activeOpacity={0.9}>
              <View style={styles.quickIconWrapper}>
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={20} color={OnboardingPalette.background} />
              </View>
              <Text style={styles.quickTitle}>{action.title}</Text>
              <Text style={styles.quickDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{homeCopy.selectedSubjects}</Text>
        </View>
        <View style={styles.activityGrid}>
          {selectedSubjects.length === 0 && <Text style={styles.activityMeta}>{homeCopy.noSubjectsLabel}</Text>}
          {selectedSubjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.activityCard}
              activeOpacity={0.85}
              onPress={() => handleOpenSubject(item.id)}>
              <View style={styles.subjectHeader}>
                <View style={styles.subjectIcon}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={OnboardingPalette.background} />
                </View>
                <Text style={styles.activityTitle}>{item.title}</Text>
              </View>
              <Text style={styles.activityMeta}>{item.meta}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addSubjectButton} activeOpacity={0.9}>
          <Ionicons name="add-outline" size={20} color={OnboardingPalette.background} />
          <Text style={styles.addSubjectLabel}>{homeCopy.addSubject}</Text>
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    gap: 20,
    paddingBottom: 140,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  appBarActions: {
    flexDirection: 'row',
    gap: 14,
  },
  heroCard: {
    backgroundColor: OnboardingPalette.card,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  heroStatusRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  heroGreeting: {
    color: OnboardingPalette.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  heroSubtext: {
    color: OnboardingPalette.textSecondary,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: OnboardingPalette.elevated,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: OnboardingPalette.accent,
  },
  statusLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  quickCard: {
    flex: 1,
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  quickIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  quickDescription: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  activityGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  activityCard: {
    flexBasis: '48%',
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subjectIcon: {
    height: 36,
    width: 36,
    borderRadius: 12,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  activityMeta: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: OnboardingPalette.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: OnboardingPalette.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  addSubjectButton: {
    marginTop: 12,
    height: 56,
    borderRadius: 28,
    backgroundColor: OnboardingPalette.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addSubjectLabel: {
    color: OnboardingPalette.background,
    fontWeight: '700',
    fontSize: 16,
  },
});

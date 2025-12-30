import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingPalette, downloadQueue } from '@/constants/onboarding';

const HOME_ROUTE = '/(tabs)' as const;

export default function ContentDownloadScreen() {
  const [wifiOnly, setWifiOnly] = useState(true);
  const [bluetoothSharing, setBluetoothSharing] = useState(false);

  const completedCount = useMemo(
    () => downloadQueue.filter((item) => item.status === 'done').length,
    [],
  );

  const overallProgress = useMemo(() => completedCount / downloadQueue.length, [completedCount]);
  const allReady = completedCount === downloadQueue.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.stepText}>Step 3 of 3</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${overallProgress * 100}%` }]} />
          </View>
        </View>

        <View>
          <Text style={styles.eyebrow}>Final setup</Text>
          <Text style={styles.title}>Download Learning Content</Text>
          <Text style={styles.subtitle}>
            Please wait for your selected subjects to finish downloading.
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusCount}>{`${completedCount} of ${downloadQueue.length} subjects downloaded`}</Text>
          <Text style={styles.statusHint}>Running in the background</Text>
        </View>

        <View style={styles.downloadList}>
          {downloadQueue.map((item) => (
            <View key={item.id} style={styles.downloadCard}>
              <View style={styles.cardTopRow}>
                <View style={[styles.iconBadge, item.status !== 'queued' && styles.iconBadgeActive]}>
                  <Ionicons
                    name={item.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={item.status !== 'queued' ? OnboardingPalette.background : OnboardingPalette.accent}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardMeta}>{item.size}</Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    item.status === 'done'
                      ? styles.badgeDone
                      : item.status === 'downloading'
                        ? styles.badgeDownloading
                        : styles.badgeQueued,
                  ]}>
                  {item.status === 'done' && (
                    <Ionicons name="checkmark" size={14} color={OnboardingPalette.background} />
                  )}
                  {item.status !== 'done' && (
                    <Ionicons
                      name={item.status === 'downloading' ? 'arrow-down-circle-outline' : 'time-outline'}
                      size={16}
                      color={item.status === 'downloading' ? OnboardingPalette.background : OnboardingPalette.textPrimary}
                    />
                  )}
                </View>
              </View>

              {item.status === 'downloading' && (
                <View style={styles.itemProgressTrack}>
                  <View style={[styles.itemProgressBar, { width: `${item.progress * 100}%` }]} />
                  <Text style={styles.progressLabel}>{`${Math.round(item.progress * 100)}%`}</Text>
                </View>
              )}
              {item.status === 'queued' && (
                <Text style={styles.queueLabel}>Queued · Auto downloading soon</Text>
              )}
              {item.status === 'done' && (
                <Text style={styles.queueLabel}>Completed · Ready to learn offline</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.preferenceList}>
          <View style={styles.preferenceCard}>
            <View>
              <Text style={styles.preferenceTitle}>Download over WiFi only</Text>
              <Text style={styles.preferenceSubtitle}>Save your mobile data</Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: OnboardingPalette.surface, true: OnboardingPalette.accentMuted }}
              thumbColor={wifiOnly ? OnboardingPalette.background : OnboardingPalette.muted}
            />
          </View>

          <View style={styles.preferenceCard}>
            <View>
              <Text style={styles.preferenceTitle}>Enable Bluetooth sharing</Text>
              <Text style={styles.preferenceSubtitle}>Share content with nearby peers</Text>
            </View>
            <Switch
              value={bluetoothSharing}
              onValueChange={setBluetoothSharing}
              trackColor={{ false: OnboardingPalette.surface, true: OnboardingPalette.accentMuted }}
              thumbColor={bluetoothSharing ? OnboardingPalette.background : OnboardingPalette.muted}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !allReady && styles.primaryButtonDisabled]}
          activeOpacity={0.85}
          disabled={!allReady}
          onPress={() => router.replace(HOME_ROUTE as never)}>
          <Text style={styles.primaryLabel}>{allReady ? 'Start Learning' : 'Preparing downloads...'}</Text>
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
  statusRow: {
    gap: 6,
  },
  statusCount: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  statusHint: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
  },
  downloadList: {
    gap: 14,
  },
  downloadCard: {
    backgroundColor: OnboardingPalette.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBadge: {
    height: 52,
    width: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(215,255,95,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeActive: {
    backgroundColor: OnboardingPalette.accent,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: OnboardingPalette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  cardMeta: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDone: {
    backgroundColor: OnboardingPalette.accentMuted,
  },
  badgeDownloading: {
    backgroundColor: OnboardingPalette.accent,
  },
  badgeQueued: {
    backgroundColor: OnboardingPalette.card,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
  },
  itemProgressTrack: {
    height: 6,
    backgroundColor: OnboardingPalette.outline,
    borderRadius: 999,
    overflow: 'hidden',
  },
  itemProgressBar: {
    height: '100%',
    backgroundColor: OnboardingPalette.accent,
  },
  progressLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  queueLabel: {
    color: OnboardingPalette.textSecondary,
    fontSize: 12,
  },
  preferenceList: {
    gap: 12,
  },
  preferenceCard: {
    backgroundColor: OnboardingPalette.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceTitle: {
    color: OnboardingPalette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  preferenceSubtitle: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    padding: 24,
    backgroundColor: OnboardingPalette.background,
  },
  primaryButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: OnboardingPalette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    color: OnboardingPalette.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { OnboardingPalette } from '@/constants/onboarding';
import { useLanguage } from '@/contexts/language';
import { languageOptions } from '@/lib/i18n';

interface LanguageSwitcherProps {
  style?: StyleProp<ViewStyle>;
  dense?: boolean;
}

export function LanguageSwitcher({ style, dense = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={[styles.wrapper, dense && styles.wrapperDense, style]}>
      {languageOptions.map((option) => {
        const isActive = option.code === language;
        return (
          <TouchableOpacity
            key={option.code}
            style={[styles.chip, dense && styles.chipDense, isActive && styles.chipActive]}
            activeOpacity={0.9}
            onPress={() => setLanguage(option.code)}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrapperDense: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: OnboardingPalette.outline,
    backgroundColor: OnboardingPalette.surface,
  },
  chipDense: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: OnboardingPalette.accent,
    borderColor: OnboardingPalette.accent,
  },
  label: {
    color: OnboardingPalette.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: OnboardingPalette.background,
  },
});

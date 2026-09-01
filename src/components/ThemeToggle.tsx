import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../store/ThemeContext';
import type { ThemeMode } from '../constants/theme';

const HIT = { top: 20, bottom: 20, left: 16, right: 16 } as const;

/** Instant theme switch — responds on touch-down, large half-finger targets. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { mode, setMode, colors } = useAppTheme();
  const [pending, setPending] = useState<ThemeMode | null>(null);
  const shown = pending ?? mode;

  useEffect(() => {
    setPending(null);
  }, [mode]);

  const pick = (next: ThemeMode) => {
    if (next === shown) return;
    setPending(next);
    setMode(next);
  };

  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.panel, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPressIn={() => pick('dark')}
        onPress={() => pick('dark')}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityState={{ selected: shown === 'dark' }}
        accessibilityLabel={t('profile.themeDark')}
        style={[
          styles.chip,
          shown === 'dark' && { backgroundColor: colors.coralMuted },
        ]}
      >
        <Feather
          name="moon"
          size={18}
          color={shown === 'dark' ? colors.coral : colors.textMuted}
        />
      </Pressable>
      <Pressable
        onPressIn={() => pick('light')}
        onPress={() => pick('light')}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityState={{ selected: shown === 'light' }}
        accessibilityLabel={t('profile.themeLight')}
        style={[
          styles.chip,
          shown === 'light' && { backgroundColor: colors.coralMuted },
        ]}
      >
        <Feather
          name="sun"
          size={18}
          color={shown === 'light' ? colors.coral : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 48,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

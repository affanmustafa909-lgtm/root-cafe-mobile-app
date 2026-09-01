import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { radii, typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

export type BadgeTone = 'neutral' | 'navy' | 'sky' | 'coral' | 'muted';

type Props = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

export function Badge({ label, tone = 'neutral', style }: Props) {
  const { colors } = useAppTheme();
  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    neutral: { bg: colors.hover, fg: colors.textMuted },
    navy: { bg: colors.navyMuted, fg: colors.text },
    sky: { bg: colors.skyMuted, fg: colors.sky },
    coral: { bg: colors.coralMuted, fg: colors.coral },
    muted: { bg: colors.hover, fg: colors.textTertiary },
  };
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }, style]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function statusTone(status?: string): BadgeTone {
  switch (status) {
    case 'RECEIVED':
      return 'neutral';
    case 'PREPARING':
      return 'navy';
    case 'READY_FOR_PICKUP':
      return 'sky';
    case 'COMPLETED':
      return 'sky';
    default:
      return 'muted';
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    ...typography.small,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

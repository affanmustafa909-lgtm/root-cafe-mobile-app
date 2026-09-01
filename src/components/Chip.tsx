import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { radii } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  tone?: 'dark' | 'cafe';
};

export function Chip({
  label,
  selected,
  onPress,
  style,
  accessibilityLabel,
  tone = 'dark',
}: Props) {
  const { cafe, colors, typography, mode } = useAppTheme();
  const cafeTone = tone === 'cafe';
  const selectedLabel =
    mode === 'dark' ? colors.black : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: cafeTone ? cafe.border : colors.border,
          backgroundColor: cafeTone ? cafe.card : colors.panel,
        },
        selected &&
          (cafeTone
            ? { backgroundColor: colors.coral, borderColor: colors.coral }
            : {
                backgroundColor: colors.coralMuted,
                borderColor: colors.coral,
              }),
        style,
      ]}
    >
      <Text
        style={[
          typography.bodyBold,
          {
            fontSize: 14,
            color: cafeTone ? cafe.text : colors.textMuted,
          },
          selected && { color: selectedLabel },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 42,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
});

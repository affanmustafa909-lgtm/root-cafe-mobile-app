import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, touchTarget } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  accessibilityLabel?: string;
  compact?: boolean;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  accessibilityLabel = 'Quantity',
  compact,
}: Props) {
  const { colors, typography, mode } = useAppTheme();
  const plusLabel = mode === 'dark' ? colors.black : '#FFFFFF';
  return (
    <View
      style={[
        styles.row,
        compact && {
          backgroundColor: colors.panelElevated,
          borderRadius: radii.full,
          paddingHorizontal: 6,
          paddingVertical: 4,
          gap: 8,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable
        style={
          compact
            ? styles.btnCompact
            : [
                styles.btn,
                {
                  backgroundColor: colors.panelElevated,
                  borderColor: colors.border,
                },
              ]
        }
        onPress={() => onChange(Math.max(min, value - 1))}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Text
          style={[
            typography.h3,
            { color: colors.text, fontSize: 20, lineHeight: 22 },
          ]}
        >
          −
        </Text>
      </Pressable>
      <Text
        style={[
          typography.bodyBold,
          {
            minWidth: 24,
            textAlign: 'center',
            color: colors.text,
          },
        ]}
      >
        {value}
      </Text>
      <Pressable
        style={
          compact
            ? [styles.plusCompact, { backgroundColor: colors.coral }]
            : [
                styles.btn,
                {
                  backgroundColor: colors.panelElevated,
                  borderColor: colors.border,
                },
              ]
        }
        onPress={() => onChange(value + 1)}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Text
          style={[
            typography.h3,
            {
              color: compact ? plusLabel : colors.text,
              fontSize: compact ? 18 : 20,
              lineHeight: compact ? 20 : 22,
            },
          ]}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btn: {
    width: touchTarget - 4,
    height: touchTarget - 4,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCompact: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCompact: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, touchTarget } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function HeaderBack({ onPress, accessibilityLabel = 'Back' }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.btn,
        {
          top: insets.top + 8,
          backgroundColor: colors.panel,
          borderColor: colors.border,
        },
      ]}
      hitSlop={8}
    >
      <Feather name="chevron-left" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: touchTarget,
    height: touchTarget,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { duration, easing, useReducedMotion } from '../constants/motion';
import { radii, touchTarget } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import { LoadingBean } from './LoadingBean';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  pill?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  pill,
  style,
  accessibilityLabel,
}: Props) {
  const { colors, typography, mode } = useAppTheme();
  const isDisabled = disabled || loading;
  const reduced = useReducedMotion();
  const lift = useRef(new Animated.Value(0)).current;

  const animate = (to: number) => {
    if (reduced || isDisabled) return;
    Animated.timing(lift, {
      toValue: to,
      duration: duration.fast,
      easing,
      useNativeDriver: true,
    }).start();
  };

  const textColor =
    variant === 'primary'
      ? mode === 'dark'
        ? colors.black
        : '#FFFFFF'
      : variant === 'danger'
        ? '#FFFFFF'
        : variant === 'ghost'
          ? colors.textMuted
          : colors.text;

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: colors.coral }
      : variant === 'secondary'
        ? {
            backgroundColor: colors.panel,
            borderWidth: 1,
            borderColor: colors.border,
          }
        : variant === 'outline'
          ? {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: colors.borderStrong,
            }
          : variant === 'danger'
            ? { backgroundColor: colors.danger }
            : { backgroundColor: 'transparent' };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => animate(-1)}
      onPressOut={() => animate(0)}
      style={style}
    >
      <Animated.View
        style={[
          styles.base,
          variantStyle,
          pill && styles.pill,
          isDisabled && styles.disabled,
          { transform: [{ translateY: lift }] },
        ]}
      >
        {loading ? (
          <LoadingBean size="sm" />
        ) : (
          <Text style={[typography.button, { color: textColor }]}>{title}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    borderRadius: radii.button,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  pill: { borderRadius: radii.full },
  disabled: { opacity: 0.45 },
});

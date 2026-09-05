import { Feather } from '@expo/vector-icons';
import React, { forwardRef, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { fonts, radii } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    error,
    style,
    onFocus,
    onBlur,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const { colors } = useAppTheme();
  const isPassword = Boolean(secureTextEntry);
  const hide = isPassword && !visible;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { marginBottom: 14 },
        label: {
          fontFamily: fonts.sansSemi,
          fontSize: 13,
          lineHeight: 18,
          letterSpacing: 0.1,
          color: colors.textSecondary,
          marginBottom: 8,
        },
        field: {
          position: 'relative',
          justifyContent: 'center',
        },
        input: {
          borderWidth: 1,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontSize: 16,
          lineHeight: 22,
          fontFamily: fonts.sans,
          minHeight: 52,
          color: colors.text,
          backgroundColor: colors.panel,
        },
        inputWithToggle: {
          paddingRight: 48,
        },
        inputDisabled: {
          opacity: 0.55,
        },
        toggle: {
          position: 'absolute',
          right: 6,
          height: 40,
          width: 40,
          alignItems: 'center',
          justifyContent: 'center',
        },
        error: {
          marginTop: 6,
          fontSize: 12,
          fontFamily: fonts.sansMedium,
          color: colors.coral,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.placeholder}
          {...props}
          secureTextEntry={hide}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              borderColor: error || focused ? colors.coral : colors.border,
            },
            isPassword && styles.inputWithToggle,
            props.editable === false && styles.inputDisabled,
            style,
          ]}
        />
        {isPassword ? (
          <Pressable
            style={styles.toggle}
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
          >
            <Feather
              name={visible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

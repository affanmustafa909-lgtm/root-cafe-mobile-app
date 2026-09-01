import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CoffeeBeanRow } from './CoffeeBean';
import { spacing } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import { Button } from './Button';
import { LoadingBean } from './LoadingBean';

export function LoadingState({ message }: { message?: string }) {
  const { colors, typography } = useAppTheme();
  return (
    <View
      style={[styles.center, { backgroundColor: colors.background }]}
      accessibilityRole="progressbar"
    >
      <LoadingBean />
      {message ? (
        <Text
          style={[
            styles.text,
            { ...typography.caption, color: colors.textSecondary },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export function EmptyState({
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <CoffeeBeanRow size="md" style={{ marginBottom: 8 }} />
      <Text
        style={[styles.title, { ...typography.h2, color: colors.text }]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.text,
            { ...typography.caption, color: colors.textSecondary },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const { colors, typography } = useAppTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <Text
        style={[styles.title, { ...typography.h2, color: colors.text }]}
      >
        {message}
      </Text>
      {onRetry ? (
        <View style={styles.action}>
          <Button title={retryLabel} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: 10,
  },
  title: {
    textAlign: 'center',
  },
  text: {
    textAlign: 'center',
    maxWidth: 280,
  },
  action: { marginTop: 12, minWidth: 180 },
});

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OrderStatus } from '../types';
import { typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import { Badge, statusTone } from './Badge';
import { Card } from './Card';

type Props = {
  orderNumber: string | number;
  dateLabel: string;
  itemsLabel: string;
  totalLabel: string;
  status: OrderStatus;
  statusLabel: string;
  onView: () => void;
  onTrack?: () => void;
  viewLabel: string;
  trackLabel?: string;
};

export function OrderCard({
  orderNumber,
  dateLabel,
  itemsLabel,
  totalLabel,
  status,
  statusLabel,
  onView,
  onTrack,
  viewLabel,
  trackLabel,
}: Props) {
  const { colors } = useAppTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={[styles.number, { color: colors.text }]}>#{orderNumber}</Text>
        <Badge label={statusLabel} tone={statusTone(status)} />
      </View>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>{dateLabel}</Text>
      <Text style={[styles.items, { color: colors.textMuted }]} numberOfLines={2}>
        {itemsLabel}
      </Text>
      <Text style={[styles.price, { color: colors.text }]}>{totalLabel}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onView} accessibilityRole="button">
          <Text style={[styles.link, { color: colors.sky }]}>{viewLabel}</Text>
        </Pressable>
        {onTrack && trackLabel ? (
          <Pressable onPress={onTrack} accessibilityRole="button">
            <Text style={[styles.link, { color: colors.sky }]}>{trackLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  number: { ...typography.bodyBold },
  meta: { ...typography.caption, marginTop: 6 },
  items: { ...typography.bodySmall, marginTop: 4 },
  price: { ...typography.h3, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 16, marginTop: 12 },
  link: { ...typography.bodyBold, fontSize: 14 },
});

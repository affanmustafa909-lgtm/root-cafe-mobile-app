import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CoffeeBeanRow } from '../components/CoffeeBean';
import { FadeIn } from '../components/FadeIn';
import { spacing, typography } from '../constants/theme';
import { useAppTheme } from '../store/ThemeContext';
import type { Order } from '../types';

type Props = {
  order: Order;
  onTrack: () => void;
  onView: () => void;
};

export function OrderConfirmationScreen({ order, onTrack, onView }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FadeIn>
        <CoffeeBeanRow size="md" style={{ marginBottom: 12 }} />
        <Text style={[styles.badge, { color: colors.sky }]}>
          {t('orders.placed')}
        </Text>
        <Text style={[styles.number, { color: colors.text }]}>
          {t('orders.orderNumber', { number: order.orderNumber })}
        </Text>
      </FadeIn>
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('checkout.pickup')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {order.pickupType === 'SCHEDULED'
            ? `${order.pickupDate ?? ''} ${order.pickupTime ?? ''}`.trim()
            : t('checkout.asap')}
        </Text>
        <Text
          style={[styles.label, { marginTop: 12, color: colors.textSecondary }]}
        >
          {t('checkout.paymentMethod')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {t('checkout.payAtCafeLabel')}
        </Text>
      </Card>
      <Button title={t('orders.trackOrder')} onPress={onTrack} />
      <Button title={t('orders.viewOrder')} variant="secondary" onPress={onView} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: 12,
  },
  badge: {
    ...typography.h1,
    textAlign: 'center',
  },
  number: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: 12,
  },
  card: { marginBottom: 8 },
  label: { ...typography.label },
  value: { ...typography.bodyBold, marginTop: 4 },
});

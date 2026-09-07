import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { OrderTimeline } from '../components/OrderTimeline';
import { ErrorState, LoadingState } from '../components/States';
import { spacing, typography } from '../constants/theme';
import { useOrder } from '../hooks/useMenu';
import { useAppTheme } from '../store/ThemeContext';
import { formatPrice } from '../utils/pricing';
import { formatPickupDateTime } from '../utils/pickup';

type Props = {
  orderId: string;
};

export function OrderDetailsScreen({ orderId }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { data, isLoading, isError, refetch } = useOrder(orderId);

  if (isLoading) return <LoadingState message={t('common.loading')} />;
  if (isError || !data) {
    return (
      <ErrorState
        message={t('common.error')}
        onRetry={() => void refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.number, { color: colors.text }]}>
        {t('orders.orderNumber', { number: data.orderNumber })}
      </Text>
      <Text style={[styles.meta, { color: colors.textSecondary }]}>
        {new Date(data.createdAt).toLocaleString()}
      </Text>

      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {t('checkout.pickup')}
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {data.pickupType === 'SCHEDULED'
            ? formatPickupDateTime(data.pickupDate, data.pickupTime)
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
        <Text
          style={[styles.label, { marginTop: 12, color: colors.textSecondary }]}
        >
          {t('orders.paymentStatus')}
        </Text>
        <View style={{ marginTop: 6 }}>
          <Badge
            label={
              data.paymentStatus === 'PAID'
                ? t('orders.paymentPaid')
                : t('orders.paymentUnpaid')
            }
            tone={data.paymentStatus === 'PAID' ? 'sky' : 'coral'}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <OrderTimeline status={data.status} />
        {data.status === 'DECLINED' && data.notes ? (
          <Text style={[styles.meta, { color: colors.textSecondary, marginTop: 8 }]}>
            {data.notes}
          </Text>
        ) : null}
      </Card>

      {data.items.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Text style={[styles.value, { color: colors.text }]}>
            {item.quantity}× {item.name}
          </Text>
          {(item.customizations ?? []).map((c, idx) => (
            <Text
              key={`${item.id}-${idx}`}
              style={[styles.meta, { color: colors.textSecondary }]}
            >
              {c.name}: {c.option}
              {c.price ? ` (+${formatPrice(c.price)})` : ''}
            </Text>
          ))}
          <Text style={[styles.price, { color: colors.text }]}>
            {formatPrice(item.lineTotal ?? item.unitPrice * item.quantity)}
          </Text>
        </Card>
      ))}

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {t('cart.subtotal')}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {formatPrice(data.subtotal ?? 0)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {t('cart.tax')}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {formatPrice(data.tax ?? 0)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.value, { color: colors.text }]}>
            {t('cart.total')}
          </Text>
          <Text style={[styles.total, { color: colors.text }]}>
            {formatPrice(data.total)}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  number: { ...typography.h1 },
  meta: { ...typography.caption, marginTop: 4 },
  card: { marginTop: 12 },
  label: { ...typography.label },
  value: { ...typography.bodyBold, marginTop: 4 },
  price: { ...typography.bodyBold, marginTop: 8 },
  total: { ...typography.numeric, fontSize: 22 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});

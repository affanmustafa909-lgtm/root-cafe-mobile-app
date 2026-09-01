import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { OrderTimeline } from '../components/OrderTimeline';
import { ErrorState, LoadingState } from '../components/States';
import { spacing, typography } from '../constants/theme';
import { useOrder } from '../hooks/useMenu';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { useAppTheme } from '../store/ThemeContext';
import { formatPrice } from '../utils/pricing';

type Props = {
  orderId: string;
};

export function OrderTrackingScreen({ orderId }: Props) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { connected } = useOrderSocket(true);
  const { data, isLoading, isError, refetch } = useOrder(orderId, {
    refetchInterval: connected ? false : 30_000,
  });

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
      <Text style={[styles.kicker, { color: colors.sky }]}>
        {t('orders.tracking')}
      </Text>
      <Text style={[styles.number, { color: colors.text }]}>
        {t('orders.orderNumber', { number: data.orderNumber })}
      </Text>
      <Card style={styles.card}>
        <OrderTimeline status={data.status} />
      </Card>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {t('checkout.pickup')}:{' '}
        {data.pickupType === 'SCHEDULED'
          ? `${data.pickupDate ?? ''} ${data.pickupTime ?? ''}`.trim()
          : t('checkout.asap')}
      </Text>
      <Text style={[styles.total, { color: colors.text }]}>
        {t('cart.total')}: {formatPrice(data.total)}
      </Text>
      {!connected ? (
        <Text style={[styles.pollHint, { color: colors.textSecondary }]}>
          {t('orders.pollHint')}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 40 },
  kicker: { ...typography.label, marginBottom: 6 },
  number: { ...typography.h1, marginBottom: 16 },
  card: { marginBottom: 16 },
  meta: { ...typography.body, marginTop: 4 },
  total: { ...typography.h3, marginTop: 12 },
  pollHint: { ...typography.caption, marginTop: 16 },
});

import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { OrderCard } from '../components/OrderCard';
import { Screen } from '../components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { radii, spacing } from '../constants/theme';
import { useOrders } from '../hooks/useMenu';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';
import type { OrderStatus } from '../types';
import { formatPrice } from '../utils/pricing';

const ACTIVE_STATUSES = new Set<OrderStatus>([
  'RECEIVED',
  'PREPARING',
  'READY_FOR_PICKUP',
]);

type Props = {
  onOpenOrder: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
};

export function OrdersScreen({ onOpenOrder, onTrackOrder }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const { data, isError, refetch, isPending, isFetching } =
    useOrders(isAuthenticated);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) void refetch();
    }, [isAuthenticated, refetch]),
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        title: {
          ...typography.h1,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.md,
          color: colors.text,
        },
        tabs: {
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          gap: 8,
          marginTop: 16,
        },
        tab: {
          flex: 1,
          minHeight: 44,
          borderRadius: radii.full,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.panel,
        },
        tabOn: {
          backgroundColor: colors.coralMuted,
          borderColor: colors.coral,
        },
        tabText: {
          fontFamily: typography.bodyBold.fontFamily,
          color: colors.textMuted,
        },
        tabTextOn: { color: colors.text },
        list: { padding: spacing.md, paddingBottom: 40, flexGrow: 1 },
      }),
    [colors, typography],
  );

  const { active, past } = useMemo(() => {
    const list = data ?? [];
    return {
      active: list.filter((o) => ACTIVE_STATUSES.has(o.status)),
      past: list.filter((o) => !ACTIVE_STATUSES.has(o.status)),
    };
  }, [data]);

  if (!isAuthenticated) {
    return (
      <Screen>
        <EmptyState
          title={t('orders.title')}
          subtitle={t('orders.emptyActiveHint')}
        />
      </Screen>
    );
  }

  if (isPending && !data) {
    return (
      <Screen>
        <LoadingState message={t('common.loading')} />
      </Screen>
    );
  }
  if (isError && !data) {
    return (
      <Screen>
        <ErrorState
          message={t('common.error')}
          onRetry={() => void refetch()}
          retryLabel={t('common.retry')}
        />
      </Screen>
    );
  }

  const list = tab === 'active' ? active : past;

  return (
    <Screen>
      <View style={styles.flex}>
        <Text style={styles.title}>{t('orders.title')}</Text>
        <View style={styles.tabs}>
          {(['active', 'past'] as const).map((key) => (
            <Pressable
              key={key}
              style={[styles.tab, tab === key && styles.tabOn]}
              onPress={() => setTab(key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === key }}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextOn]}>
                {key === 'active' ? t('orders.active') : t('orders.past')}
              </Text>
            </Pressable>
          ))}
        </View>
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={Boolean(isFetching && data)}
              onRefresh={() => void refetch()}
              tintColor={colors.coral}
            />
          }
        >
          {list.length === 0 ? (
            <EmptyState
              title={
                tab === 'active'
                  ? t('orders.emptyActive')
                  : t('orders.emptyPast')
              }
              subtitle={
                tab === 'active'
                  ? t('orders.emptyActiveHint')
                  : t('orders.emptyPastHint')
              }
            />
          ) : (
            list.map((order) => (
              <OrderCard
                key={order.id}
                orderNumber={order.orderNumber}
                dateLabel={new Date(order.createdAt).toLocaleDateString()}
                itemsLabel={order.items.map((i) => i.name).join(', ')}
                totalLabel={formatPrice(order.total)}
                status={order.status}
                statusLabel={t(`orders.status.${order.status}`)}
                onView={() => onOpenOrder(order.id)}
                onTrack={
                  ACTIVE_STATUSES.has(order.status)
                    ? () => onTrackOrder(order.id)
                    : undefined
                }
                viewLabel={t('orders.viewOrder')}
                trackLabel={t('orders.trackOrder')}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

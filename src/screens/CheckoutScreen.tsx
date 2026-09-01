import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingState } from '../components/States';
import { ScheduledPickupPicker } from '../components/ScheduledPickupPicker';
import { fonts, radii, spacing } from '../constants/theme';
import { useAppSettings } from '../hooks/useMenu';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { orderApi, productApi } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import { useAppTheme } from '../store/ThemeContext';
import type { CartItem, Order, PickupType } from '../types';
import { friendlyError } from '../utils/errors';
import { generatePickupDates, generatePickupSlots } from '../utils/pickup';
import { calcLineTotal, calcTax, formatPrice } from '../utils/pricing';
import { completeCartOptions } from '../utils/customization';

type Props = {
  onSuccess: (order: Order) => void;
  onNeedAuth: () => void;
};

export function CheckoutScreen({ onSuccess, onNeedAuth }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const { items, subtotal, clearCart, replaceItems } = useCart();
  const settingsQuery = useAppSettings();
  const { isOffline } = useNetworkStatus();
  const [pickupType, setPickupType] = useState<PickupType>('ASAP');
  const [pickupDate, setPickupDate] = useState<string | undefined>();
  const [pickupTime, setPickupTime] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const notesRef = useRef<TextInput>(null);
  const notesY = useRef(0);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        content: { padding: spacing.md, paddingBottom: 120 },
        section: {
          ...typography.h3,
          marginTop: 16,
          marginBottom: 10,
          color: colors.text,
        },
        toggleRow: { flexDirection: 'row', gap: 8 },
        toggle: {
          flex: 1,
          minHeight: 48,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.panel,
          padding: 10,
        },
        toggleOn: {
          backgroundColor: colors.coralMuted,
          borderColor: colors.coral,
        },
        toggleText: {
          fontFamily: typography.bodyBold.fontFamily,
          color: colors.textMuted,
          textAlign: 'center',
        },
        toggleTextOn: { color: colors.text },
        hint: {
          ...typography.caption,
          marginTop: 8,
          lineHeight: 20,
          color: colors.textSecondary,
        },
        notes: {
          minHeight: 88,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          padding: 12,
          backgroundColor: colors.panel,
          textAlignVertical: 'top',
          color: colors.text,
          fontFamily: fonts.sans,
          fontSize: 16,
        },
        line: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
          gap: 8,
        },
        lineName: {
          flex: 1,
          ...typography.bodySmall,
          color: colors.textMuted,
        },
        linePrice: { ...typography.bodySmall, color: colors.text },
        meta: { ...typography.body, color: colors.textSecondary },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        totalLabel: { ...typography.bodyBold, color: colors.text },
        totalValue: { ...typography.numeric, fontSize: 26, color: colors.text },
        payBox: { marginTop: 16 },
        payEyebrow: {
          ...typography.label,
          color: colors.sky,
          marginBottom: 6,
        },
        payLabel: { ...typography.h3, color: colors.text },
        footer: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: spacing.md,
          paddingTop: 12,
          backgroundColor: colors.panel,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }),
    [colors, typography],
  );

  const settings = settingsQuery.data;
  const dates = useMemo(
    () => (settings ? generatePickupDates(settings) : []),
    [settings],
  );
  const slots = useMemo(
    () => (settings ? generatePickupSlots(settings) : []),
    [settings],
  );

  useEffect(() => {
    if (pickupType !== 'SCHEDULED') return;
    if (!pickupDate && dates[0]) setPickupDate(dates[0]);
  }, [pickupType, pickupDate, dates]);

  const taxRate = settings?.taxRate ?? 0;
  const tax = calcTax(subtotal, taxRate);
  const total = subtotal + tax;

  const revalidateCart = async (): Promise<CartItem[] | null> => {
    const next: CartItem[] = [];
    const messages: string[] = [];
    for (const item of items) {
      try {
        const product = await productApi.get(item.productId);
        if (
          product.soldOut ||
          product.isSoldOut ||
          product.isAvailable === false ||
          product.isActive === false
        ) {
          messages.push(`${item.productName}: ${t('cart.noLongerAvailable')}`);
          continue;
        }
        const priceChanged = Number(product.price) !== Number(item.basePrice);
        if (priceChanged) {
          messages.push(`${item.productName}: ${t('cart.priceChanged')}`);
        }
        const { options, error } = completeCartOptions(
          product,
          item.selectedOptions,
        );
        if (error) {
          messages.push(`${item.productName}: ${error}`);
          continue;
        }
        const updated = {
          ...item,
          basePrice: product.price,
          productName: product.name,
          productImageUrl: product.imageUrl,
          selectedOptions: options,
          lineTotal: calcLineTotal(product.price, options, item.quantity),
        };
        next.push(updated);
      } catch {
        messages.push(`${item.productName}: ${t('cart.noLongerAvailable')}`);
      }
    }
    replaceItems(next);
    if (messages.length) {
      Alert.alert(t('cart.title'), messages.join('\n'));
    }
    return next.length ? next : null;
  };

  const placeOrder = async () => {
    if (!isAuthenticated) {
      onNeedAuth();
      return;
    }
    if (isOffline) {
      Alert.alert(t('common.error'), t('common.offline'));
      return;
    }
    if (pickupType === 'SCHEDULED' && (!pickupDate || !pickupTime)) {
      Alert.alert(
        t('checkout.title'),
        `${t('checkout.date')} / ${t('checkout.time')}`,
      );
      return;
    }
    setSubmitting(true);
    try {
      const validItems = await revalidateCart();
      if (!validItems?.length) {
        Alert.alert(t('checkout.orderError'));
        return;
      }
      const order = await orderApi.create({
        pickupType,
        pickupDate: pickupType === 'SCHEDULED' ? pickupDate : undefined,
        pickupTime: pickupType === 'SCHEDULED' ? pickupTime : undefined,
        notes: notes.trim() || undefined,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          optionIds: item.selectedOptions.map((o) => o.optionId),
        })),
      });
      clearCart();
      onSuccess(order);
    } catch (error) {
      Alert.alert(t('checkout.orderError'), friendlyError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (settingsQuery.isLoading) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <View style={styles.flex}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.section}>{t('checkout.pickup')}</Text>
        <View style={styles.toggleRow}>
          {(['ASAP', 'SCHEDULED'] as PickupType[]).map((type) => (
            <Pressable
              key={type}
              style={[styles.toggle, pickupType === type && styles.toggleOn]}
              onPress={() => setPickupType(type)}
              accessibilityRole="button"
              accessibilityState={{ selected: pickupType === type }}
            >
              <Text
                style={[
                  styles.toggleText,
                  pickupType === type && styles.toggleTextOn,
                ]}
              >
                {type === 'ASAP' ? t('checkout.asap') : t('checkout.scheduled')}
              </Text>
            </Pressable>
          ))}
        </View>

        {pickupType === 'ASAP' ? (
          <Text style={styles.hint}>
            {settings?.pickup.asapEstimateMinutes
              ? t('checkout.asapEstimate', {
                  minutes: settings.pickup.asapEstimateMinutes,
                })
              : t('checkout.asapHint')}
          </Text>
        ) : (
          <ScheduledPickupPicker
            dates={dates}
            slots={slots}
            pickupDate={pickupDate}
            pickupTime={pickupTime}
            onChangeDate={setPickupDate}
            onChangeTime={setPickupTime}
            onContinueNext={() => {
              scrollRef.current?.scrollTo({
                y: Math.max(0, notesY.current - 24),
                animated: true,
              });
              setTimeout(() => notesRef.current?.focus(), 280);
            }}
            dateLabel={t('checkout.date')}
            timeLabel={t('checkout.time')}
          />
        )}

        <Text
          style={styles.section}
          onLayout={(e) => {
            notesY.current = e.nativeEvent.layout.y;
          }}
        >
          {t('checkout.notes')}
        </Text>
        <TextInput
          ref={notesRef}
          style={styles.notes}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder={t('checkout.notes')}
          placeholderTextColor={colors.placeholder}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
        />

        <Text style={styles.section}>{t('checkout.summary')}</Text>
        <Card>
          {items.map((item) => (
            <View key={item.id} style={styles.line}>
              <Text style={styles.lineName}>
                {item.quantity}× {item.productName}
              </Text>
              <Text style={styles.linePrice}>
                {formatPrice(item.lineTotal)}
              </Text>
            </View>
          ))}
          <View style={styles.line}>
            <Text style={styles.meta}>{t('cart.subtotal')}</Text>
            <Text style={styles.meta}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.meta}>{t('cart.tax')}</Text>
            <Text style={styles.meta}>{formatPrice(tax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </Card>

        <Card style={styles.payBox} elevated>
          <Text style={styles.payEyebrow}>{t('checkout.paymentMethod')}</Text>
          <Text style={styles.payLabel}>{t('checkout.payAtCafeLabel')}</Text>
          <Text style={styles.hint}>{t('checkout.payAtCafe')}</Text>
        </Card>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Button
          title={t('checkout.placeOrder')}
          onPress={() => void placeOrder()}
          loading={submitting}
          disabled={isOffline || items.length === 0}
        />
      </View>
    </View>
  );
}

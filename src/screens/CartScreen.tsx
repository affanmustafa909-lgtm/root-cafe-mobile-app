import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/States';
import { QuantityStepper } from '../components/QuantityStepper';
import { Screen } from '../components/Screen';
import { radii, spacing } from '../constants/theme';
import { useAppSettings, useProducts } from '../hooks/useMenu';
import { resolveProductImageSource } from '../assets/products/productImages';
import { mediaUrl } from '../services/api';
import { useCart } from '../store/CartContext';
import { useAppTheme } from '../store/ThemeContext';
import type { Product } from '../types';
import { calcTax, formatPrice } from '../utils/pricing';

type Props = {
  onContinueShopping: () => void;
  onCheckout: () => void;
  onEditItem: (cartItemId: string, productId: string) => void;
};

export function CartScreen({
  onContinueShopping,
  onCheckout,
  onEditItem,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useAppTheme();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const settings = useAppSettings();
  const products = useProducts();
  const taxRate = settings.data?.taxRate ?? 0;
  const tax = calcTax(subtotal, taxRate);
  const total = subtotal + tax;

  const liveById = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products.data ?? []) map.set(p.id, p);
    return map;
  }, [products.data]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        content: { padding: spacing.md, paddingBottom: 220 },
        title: { ...typography.h1, marginBottom: 16 },
        card: { marginBottom: 12 },
        cardInner: { flexDirection: 'row', gap: 12, padding: 12 },
        thumb: {
          width: 76,
          height: 76,
          borderRadius: radii.md,
          backgroundColor: colors.panelElevated,
        },
        cardBody: { flex: 1 },
        name: {
          ...typography.h3,
          fontSize: 16,
          lineHeight: 22,
          color: colors.text,
        },
        option: { ...typography.caption, marginTop: 2, color: colors.textSecondary },
        row: {
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        price: { ...typography.bodyBold, color: colors.text },
        actions: { flexDirection: 'row', gap: 16, marginTop: 10 },
        link: {
          color: colors.sky,
          fontFamily: typography.bodyBold.fontFamily,
        },
        remove: {
          color: colors.danger,
          fontFamily: typography.bodyBold.fontFamily,
        },
        summary: { marginTop: 8, gap: 10 },
        summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
        summaryLabel: { ...typography.body, color: colors.textSecondary },
        summaryValue: { ...typography.body, color: colors.text },
        totalLabel: { ...typography.bodyBold, color: colors.text },
        totalValue: { ...typography.numeric, fontSize: 22, color: colors.text },
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
          gap: 8,
        },
      }),
    [colors, typography],
  );

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState
          title={t('cart.empty')}
          subtitle={t('cart.emptyHint')}
          actionLabel={t('cart.continueShopping')}
          onAction={onContinueShopping}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{t('cart.title')}</Text>
          {items.map((item) => {
            const live = liveById.get(item.productId);
            const imageUrl = live?.imageUrl ?? item.productImageUrl;
            const remote = mediaUrl(imageUrl);
            const imageSource = resolveProductImageSource(
              live?.name ?? item.productName,
              imageUrl,
              remote,
              item.productId,
              live?.categoryId ?? live?.category?.id,
              mediaUrl(live?.imageUrlHot),
              mediaUrl(live?.imageUrlCold),
            );
            return (
              <Card key={item.id} style={styles.card} padded={false}>
                <View style={styles.cardInner}>
                  {imageSource ? (
                    <Image
                      source={imageSource}
                      style={styles.thumb}
                      contentFit="cover"
                      recyclingKey={`${item.productId}-${imageUrl ?? ''}`}
                    />
                  ) : null}
                  <View style={styles.cardBody}>
                    <Text style={styles.name}>{item.productName}</Text>
                    {item.selectedOptions.map((opt) => (
                      <Text
                        key={`${item.id}-${opt.optionId}`}
                        style={styles.option}
                      >
                        {opt.groupName}: {opt.optionName}
                        {opt.additionalPrice > 0
                          ? ` (+${formatPrice(opt.additionalPrice)})`
                          : ''}
                      </Text>
                    ))}
                    <View style={styles.row}>
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.id, q)}
                      />
                      <Text style={styles.price}>
                        {formatPrice(item.lineTotal)}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() => onEditItem(item.id, item.productId)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.link}>{t('cart.edit')}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeItem(item.id)}
                        accessibilityRole="button"
                      >
                        <Text style={styles.remove}>{t('cart.remove')}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Card>
            );
          })}

          <Card style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart.tax')}</Text>
              <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('cart.total')}</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </Card>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <Button
            title={t('cart.clear')}
            variant="ghost"
            onPress={() =>
              Alert.alert(t('cart.clear'), '', [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('cart.clear'),
                  style: 'destructive',
                  onPress: clearCart,
                },
              ])
            }
          />
          <Button
            title={t('cart.continueShopping')}
            variant="secondary"
            onPress={onContinueShopping}
          />
          <Button title={t('cart.checkout')} onPress={onCheckout} />
        </View>
      </View>
    </Screen>
  );
}

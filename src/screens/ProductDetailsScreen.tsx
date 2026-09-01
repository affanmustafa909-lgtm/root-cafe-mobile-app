import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
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
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { QuantityStepper } from '../components/QuantityStepper';
import { ErrorState, LoadingState } from '../components/States';
import { useToast } from '../components/Toast';
import { radii, spacing } from '../constants/theme';
import { localProductImage, productImageForTemperature } from '../assets/products/productImages';
import { useProduct } from '../hooks/useMenu';
import { mediaUrl } from '../services/api';
import { useCart } from '../store/CartContext';
import { useAppTheme } from '../store/ThemeContext';
import type { CartOption, CustomizationGroup } from '../types';
import {
  toggleOption,
  validateSelections,
  productGroups,
  ensureRequiredSelections,
  cartOptionsFromSelections,
  selectionsFromCartOptions,
  type SelectionMap,
} from '../utils/customization';
import { calcLineTotal, formatPrice, productSale } from '../utils/pricing';

const GROUP_ORDER = ['Temperature', 'Size', 'Milk', 'Syrups'];

type Props = {
  productId: string;
  editCartItemId?: string;
  onAdded: () => void;
  onBack: () => void;
};

export function ProductDetailsScreen({
  productId,
  editCartItemId,
  onAdded,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { colors, typography } = useAppTheme();
  const { data, isLoading, isError, refetch } = useProduct(productId);
  const { addItem, updateItem, items } = useCart();
  const existing = editCartItemId
    ? items.find((item) => item.id === editCartItemId)
    : undefined;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: colors.background },
        topBar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.md,
          paddingBottom: 8,
          backgroundColor: colors.background,
        },
        iconBtn: {
          width: 42,
          height: 42,
          borderRadius: radii.full,
          backgroundColor: colors.panel,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        topTitle: { ...typography.h3, fontSize: 18, color: colors.text },
        content: { paddingBottom: 140, paddingHorizontal: spacing.lg },
        hero: {
          width: '100%',
          height: 240,
          marginBottom: spacing.md,
          borderRadius: radii.hero,
          overflow: 'hidden',
          backgroundColor: colors.panelElevated,
        },
        image: {
          width: '100%',
          height: '100%',
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: spacing.lg,
        },
        titleBlock: { flex: 1, gap: 4 },
        name: {
          ...typography.h3,
          fontSize: 22,
          lineHeight: 28,
          color: colors.text,
        },
        groupRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
        },
        groupTitle: {
          ...typography.bodyBold,
          color: colors.text,
          fontSize: 15,
          minWidth: 72,
          maxWidth: 88,
        },
        pills: {
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 8,
        },
        option: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'transparent',
          borderRadius: radii.full,
          paddingHorizontal: 12,
          paddingVertical: 8,
          minHeight: 36,
          gap: 4,
          backgroundColor: colors.panelElevated,
        },
        optionFlex: { flexGrow: 1, flexBasis: 0 },
        optionSelected: {
          backgroundColor: colors.coralMuted,
          borderColor: colors.coral,
        },
        optionDisabled: { opacity: 0.4 },
        optionName: {
          ...typography.body,
          color: colors.textMuted,
          fontSize: 13,
        },
        optionNameOn: {
          color: colors.coral,
          fontFamily: typography.bodyBold.fontFamily,
        },
        optionPrice: {
          ...typography.caption,
          color: colors.sky,
          fontSize: 11,
        },
        descBlock: { marginTop: spacing.sm, gap: 8 },
        descHeading: { ...typography.bodyBold, color: colors.text },
        desc: {
          ...typography.body,
          color: colors.textMuted,
          lineHeight: 22,
          fontSize: 14,
        },
        seeMore: { ...typography.bodyBold, color: colors.text, fontSize: 14 },
        allergens: { ...typography.caption, marginTop: 2 },
        footer: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: spacing.lg,
          paddingTop: 14,
          backgroundColor: colors.background,
        },
        total: {
          ...typography.numeric,
          fontSize: 22,
          minWidth: 90,
          color: colors.text,
        },
        strike: {
          ...typography.caption,
          textDecorationLine: 'line-through',
          color: colors.textTertiary,
          marginTop: 2,
        },
      }),
    [colors, typography],
  );

  const groups: CustomizationGroup[] = useMemo(() => {
    const list = data ? productGroups(data) : [];
    return [...list].sort((a, b) => {
      const ai = GROUP_ORDER.indexOf(a.name);
      const bi = GROUP_ORDER.indexOf(b.name);
      return (ai === -1 ? 80 : ai) - (bi === -1 ? 80 : bi);
    });
  }, [data]);

  const [favorite, setFavorite] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [selections, setSelections] = useState<SelectionMap>(() => {
    if (!existing) return {};
    return selectionsFromCartOptions(existing.selectedOptions);
  });

  useEffect(() => {
    if (!data) return;
    setSelections((prev) => {
      const base = existing
        ? selectionsFromCartOptions(existing.selectedOptions)
        : prev;
      const next = ensureRequiredSelections(groups, base, { productName: data.name });
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.keys(next).every(
          (key) =>
            (next[key] ?? []).join() === (prev[key] ?? []).join(),
        );
      return same ? prev : next;
    });
  }, [data, existing, groups]);

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

  const soldOut = data.soldOut || data.isSoldOut || data.isAvailable === false;
  const sale = productSale(data);
  const uri = mediaUrl(data.imageUrl);

  const selectedOptions: CartOption[] = cartOptionsFromSelections(
    groups,
    selections,
  );

  const temperatureSelection = selectedOptions.find(
    (o) => o.groupName === 'Temperature',
  )?.optionName as 'Hot' | 'Cold' | undefined;

  const displayImage =
    productImageForTemperature(
      data.id,
      data.name,
      data.categoryId ?? data.category?.id,
      temperatureSelection,
      uri,
    ) ??
    (uri ? { uri } : localProductImage(data.name));

  const lineTotal = calcLineTotal(data.price, selectedOptions, quantity);

  const onAdd = () => {
    if (soldOut) {
      Alert.alert(t('common.soldOut'), t('common.unavailable'));
      return;
    }
    const validationError = validateSelections(groups, selections);
    if (validationError) {
      Alert.alert(t('common.error'), validationError);
      return;
    }
    if (editCartItemId) {
      updateItem(editCartItemId, {
        productId: data.id,
        productName: data.name,
        productImageUrl: data.imageUrl,
        basePrice: data.price,
        quantity,
        selectedOptions,
      });
    } else {
      addItem({
        productId: data.id,
        productName: data.name,
        productImageUrl: data.imageUrl,
        basePrice: data.price,
        quantity,
        selectedOptions,
      });
    }
    toast.show(t('product.added'), 'success');
    onAdded();
  };

  return (
    <View style={styles.flex}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          style={styles.iconBtn}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.topTitle}>{t('product.details')}</Text>
        <Pressable
          onPress={() => setFavorite((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          style={styles.iconBtn}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={colors.coral}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {displayImage ? (
          <View style={styles.hero}>
            <Image
              source={displayImage}
              style={styles.image}
              contentFit="cover"
            />
          </View>
        ) : null}

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name}>{data.name}</Text>
            {soldOut ? <Badge label={t('common.soldOut')} tone="coral" /> : null}
          </View>
          <QuantityStepper compact value={quantity} onChange={setQuantity} />
        </View>

        {groups.map((group) => {
          const options = group.options.filter((o) => o.isActive !== false);
          const compactRow = options.length <= 3;
          return (
            <View key={group.id} style={styles.groupRow}>
              <Text style={styles.groupTitle}>{group.name}</Text>
              <View style={styles.pills}>
                {options.map((option) => {
                  const selected = (selections[group.id] ?? []).includes(
                    option.id,
                  );
                  const unavailable = option.isAvailable === false;
                  const extra = Number(
                    option.price || option.additionalPrice || 0,
                  );
                  return (
                    <Pressable
                      key={option.id}
                      disabled={unavailable}
                      onPress={() =>
                        setSelections((prev) =>
                          toggleOption(groups, prev, group.id, option.id),
                        )
                      }
                      style={[
                        styles.option,
                        compactRow && styles.optionFlex,
                        selected && styles.optionSelected,
                        unavailable && styles.optionDisabled,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: unavailable }}
                    >
                      <Text
                        style={[
                          styles.optionName,
                          selected && styles.optionNameOn,
                        ]}
                        numberOfLines={1}
                      >
                        {option.name}
                      </Text>
                      {extra > 0 ? (
                        <Text style={styles.optionPrice}>
                          +{formatPrice(extra)}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}

        {data.description || data.allergens ? (
          <View style={styles.descBlock}>
            <Text style={styles.descHeading}>{t('product.description')}</Text>
            <Text style={styles.desc} numberOfLines={descOpen ? undefined : 2}>
              {data.description}
            </Text>
            {descOpen && data.allergens ? (
              <Text style={styles.allergens}>
                {t('product.allergens')}: {data.allergens}
              </Text>
            ) : null}
            <Pressable onPress={() => setDescOpen((v) => !v)}>
              <Text style={styles.seeMore}>
                {descOpen ? t('product.seeLess') : t('product.seeMore')}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View>
          <Text style={styles.total}>{formatPrice(lineTotal)}</Text>
          {sale.compareAt && quantity === 1 ? (
            <Text style={styles.strike}>{formatPrice(sale.compareAt)}</Text>
          ) : null}
        </View>
        <Button
          title={t('product.addToCart')}
          onPress={onAdd}
          disabled={soldOut}
          pill
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

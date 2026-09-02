import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CategoryChipBar } from '../components/CategoryChipBar';
import { ProductCard } from '../components/ProductCard';
import { hasProductImage } from '../assets/products/productImages';
import { Skeleton } from '../components/Skeleton';
import { EmptyState, ErrorState } from '../components/States';
import { fonts, radii } from '../constants/theme';
import { useCategories, useProducts } from '../hooks/useMenu';
import { useAppTheme } from '../store/ThemeContext';

type Props = {
  initialCategoryId?: string;
  onOpenProduct: (productId: string) => void;
};

export function MenuScreen({ initialCategoryId, onOpenProduct }: Props) {
  const { t } = useTranslation();
  const { cafe } = useAppTheme();
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initialCategoryId,
  );
  const [search, setSearch] = useState('');
  const categories = useCategories();
  const products = useProducts(categoryId);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: cafe.bg },
        header: {
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
          gap: 14,
          backgroundColor: cafe.bg,
        },
        searchBox: {
          minHeight: 48,
          borderRadius: 999,
          backgroundColor: cafe.card,
          borderWidth: 1,
          borderColor: cafe.border,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        search: {
          flex: 1,
          fontSize: 15,
          color: cafe.text,
          fontFamily: fonts.sans,
          paddingVertical: 10,
        },
        list: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
        skeletons: { gap: 14 },
      }),
    [cafe],
  );

  const filtered = useMemo(() => {
    const list = (products.data ?? []).filter(hasProductImage);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q),
    );
  }, [products.data, search]);

  if (products.isError) {
    return (
      <ErrorState
        message={t('common.error')}
        onRetry={() => void products.refetch()}
        retryLabel={t('common.retry')}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={cafe.textMuted} />
          <TextInput
            accessibilityLabel={t('menu.search')}
            placeholder={t('menu.search')}
            placeholderTextColor={cafe.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
        </View>
        <CategoryChipBar
          categories={categories.data ?? []}
          selectedId={categoryId}
          onSelect={setCategoryId}
          allLabel={t('menu.all')}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={false}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {(categories.isPending && !categories.data) ||
        (products.isPending && !products.data) ? (
          <View style={styles.skeletons}>
            <Skeleton height={112} radius={radii.lg} />
            <Skeleton height={112} radius={radii.lg} />
            <Skeleton height={112} radius={radii.lg} />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={t('menu.empty')}
            subtitle={t('menu.emptyHint')}
          />
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              variant="list"
              product={product}
              onPress={() => onOpenProduct(product.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

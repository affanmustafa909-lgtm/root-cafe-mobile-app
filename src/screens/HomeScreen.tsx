import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CoffeeBeanRow } from '../components/CoffeeBean';
import { CategoryChipBar } from '../components/CategoryChipBar';
import { FadeIn } from '../components/FadeIn';
import {
  HomeFilterSheet,
  type HomeSort,
} from '../components/HomeFilterSheet';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { ErrorState, LoadingState } from '../components/States';
import { fonts } from '../constants/theme';
import {
  useCakeOfDay,
  useCategories,
  usePopularSales,
  useProducts,
  useAppSettings,
} from '../hooks/useMenu';
import { mediaUrl } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useAppTheme } from '../store/ThemeContext';

const BANNER_FALLBACK = require('../assets/home/promo-cup.jpg');
const LOGO = require('../assets/home/logo.png');
const GRID_PREVIEW = 10;

type LayoutMode = 'grid' | 'list';

type Props = {
  onOpenMenu: (categoryId?: string) => void;
  onOpenProduct: (productId: string) => void;
};

export function HomeScreen({ onOpenMenu, onOpenProduct }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cafe, colors, cafeShadow } = useAppTheme();
  const categories = useCategories();
  const products = useProducts();
  const popularSales = usePopularSales();
  const cake = useCakeOfDay();
  const settings = useAppSettings();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<HomeSort>('newest');
  const [draftCategoryId, setDraftCategoryId] = useState<string | undefined>();
  const [draftSort, setDraftSort] = useState<HomeSort>('newest');
  const [refreshing, setRefreshing] = useState(false);

  const refreshHome = useCallback(async () => {
    await Promise.all([
      categories.refetch(),
      products.refetch(),
      popularSales.refetch(),
      cake.refetch(),
      settings.refetch(),
    ]);
  }, [
    categories.refetch,
    products.refetch,
    popularSales.refetch,
    cake.refetch,
    settings.refetch,
  ]);

  useFocusEffect(
    useCallback(() => {
      void products.refetch();
      void categories.refetch();
    }, [products.refetch, categories.refetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshHome();
    } finally {
      setRefreshing(false);
    }
  }, [refreshHome]);

  const bannerSource = useMemo(() => {
    const remote = mediaUrl(settings.data?.homeBannerImageUrl);
    return remote ? { uri: remote } : BANNER_FALLBACK;
  }, [settings.data?.homeBannerImageUrl]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        flex: { flex: 1, backgroundColor: cafe.bg },
        content: {
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 48,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
        },
        identity: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          gap: 12,
        },
        logoWrap: {
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: '#0A0A0A',
          borderWidth: 1,
          borderColor: colors.navy,
          overflow: 'hidden',
        },
        logo: {
          width: 52,
          height: 52,
          borderRadius: 26,
        },
        identityText: { flex: 1 },
        name: {
          fontFamily: fonts.sansBold,
          fontSize: 16,
          color: cafe.text,
        },
        greeting: {
          marginTop: 2,
          fontFamily: fonts.sans,
          fontSize: 13,
          color: cafe.textMuted,
        },
        bell: {
          width: 42,
          height: 42,
          borderRadius: 999,
          backgroundColor: cafe.card,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: cafe.border,
        },
        searchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginBottom: 18,
        },
        searchBox: {
          flex: 1,
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
        searchInput: {
          flex: 1,
          fontSize: 15,
          color: cafe.text,
          fontFamily: fonts.sans,
          paddingVertical: 10,
        },
        filterBtn: {
          width: 48,
          height: 48,
          borderRadius: 16,
          backgroundColor: cafe.card,
          borderWidth: 1,
          borderColor: cafe.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        banner: {
          height: 168,
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 22,
          backgroundColor: cafe.banner,
          ...cafeShadow,
        },
        bannerImage: { width: '100%', height: '100%' },
        rowBetween: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        },
        section: {
          fontFamily: fonts.sansBold,
          fontSize: 18,
          color: cafe.text,
        },
        viewToggle: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        viewBtn: {
          width: 32,
          height: 32,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: cafe.border,
          backgroundColor: cafe.card,
        },
        viewBtnActive: {
          borderColor: cafe.olive,
          backgroundColor: cafe.olive,
        },
        seeAll: {
          color: cafe.olive,
          fontFamily: fonts.sansSemi,
          fontSize: 14,
        },
        chipsScroll: { flexGrow: 0, marginBottom: 18 },
        chips: { alignItems: 'center', paddingRight: 8 },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: -7,
        },
        gridItem: { width: '50%', paddingHorizontal: 7 },
        list: { gap: 0 },
        seeAllFooter: {
          marginTop: 8,
          marginBottom: 4,
          alignSelf: 'center',
          paddingVertical: 12,
          paddingHorizontal: 20,
        },
        seeAllFooterText: {
          color: cafe.olive,
          fontFamily: fonts.sansSemi,
          fontSize: 15,
        },
      }),
    [cafe, colors, cafeShadow],
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greetingMorning');
    if (hour < 18) return t('home.greetingAfternoon');
    return t('home.greetingEvening');
  }, [t]);

  const displayName =
    user?.name?.trim() ||
    (user?.email ? user.email.split('@')[0] : t('home.guest'));

  const salesRank = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of popularSales.data ?? []) {
      map.set(row.productId, Number(row.quantitySold) || 0);
    }
    return map;
  }, [popularSales.data]);

  const visible = useMemo(() => {
    // Show every available product (remote/local image or placeholder card).
    const list = (products.data ?? []).filter(
      (p) => !p.soldOut && !p.isSoldOut,
    );
    const q = search.trim().toLowerCase();
    const filtered = list.filter((p) => {
      const inCategory =
        !categoryId ||
        p.categoryId === categoryId ||
        p.category?.id === categoryId;
      const inSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q);
      return inCategory && inSearch;
    });

    const createdMs = (p: (typeof filtered)[number]) => {
      if (!p.createdAt) return 0;
      const t = new Date(p.createdAt).getTime();
      return Number.isFinite(t) ? t : 0;
    };
    const NEW_MS = 7 * 24 * 60 * 60 * 1000;
    const isNew = (p: (typeof filtered)[number]) =>
      createdMs(p) > 0 && Date.now() - createdMs(p) < NEW_MS;

    return [...filtered].sort((a, b) => {
      if (sort === 'priceAsc') return Number(a.price) - Number(b.price);
      if (sort === 'priceDesc') return Number(b.price) - Number(a.price);
      if (sort === 'name') return a.name.localeCompare(b.name);

      // Default: brand-new products first (so they appear on Home),
      // then most ordered, then newest / catalog order.
      const aNew = isNew(a);
      const bNew = isNew(b);
      if (aNew !== bNew) return aNew ? -1 : 1;
      if (aNew && bNew) return createdMs(b) - createdMs(a);

      const sa = salesRank.get(a.id) ?? 0;
      const sb = salesRank.get(b.id) ?? 0;
      if (sb !== sa) return sb - sa;
      if (createdMs(b) !== createdMs(a)) return createdMs(b) - createdMs(a);
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [products.data, categoryId, search, sort, salesRank]);

  const gridItems = visible.slice(0, GRID_PREVIEW);
  const cakeProductId = cake.data?.productId || cake.data?.product?.id;

  // Keep showing cached menu instead of a full-screen spinner on revisit.
  if (
    (categories.isPending && !categories.data) ||
    (products.isPending && !products.data)
  ) {
    return (
      <Screen backgroundColor={cafe.bg}>
        <LoadingState message={t('common.loading')} />
      </Screen>
    );
  }

  // Only hard-fail when we have no data at all (keep UI if cached data exists).
  if (
    (categories.isError && !categories.data) ||
    (products.isError && !products.data)
  ) {
    return (
      <Screen backgroundColor={cafe.bg}>
        <ErrorState
          message={t('common.error')}
          onRetry={() => {
            void categories.refetch();
            void products.refetch();
            void cake.refetch();
            void settings.refetch();
          }}
          retryLabel={t('common.retry')}
        />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={cafe.bg}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={false}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        bounces
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <FadeIn>
          <View style={styles.header}>
            <View style={styles.identity}>
              <View style={styles.logoWrap}>
                {user?.avatarUrl && mediaUrl(user.avatarUrl) ? (
                  <Image
                    source={{ uri: mediaUrl(user.avatarUrl) }}
                    style={styles.logo}
                    resizeMode="cover"
                  />
                ) : (
                  <Image source={LOGO} style={styles.logo} resizeMode="cover" />
                )}
              </View>
              <View style={styles.identityText}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <Text style={styles.greeting}>{greeting} 👋</Text>
                <CoffeeBeanRow size="sm" gap={4} style={{ marginTop: 6 }} />
              </View>
            </View>
            <View style={styles.bell}>
              <Feather name="bell" size={18} color={cafe.text} />
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={0}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color={cafe.textMuted} />
              <TextInput
                accessibilityLabel={t('home.search')}
                placeholder={t('home.search')}
                placeholderTextColor={cafe.textMuted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.filter')}
              onPress={() => {
                setDraftCategoryId(categoryId);
                setDraftSort(sort);
                setFilterOpen(true);
              }}
              style={[
                styles.filterBtn,
                (categoryId || sort !== 'newest') && {
                  borderColor: cafe.orange,
                  backgroundColor: colors.coralMuted,
                },
              ]}
            >
              <Feather name="sliders" size={18} color={cafe.text} />
            </Pressable>
          </View>
        </FadeIn>

        <FadeIn delay={0}>
          <Pressable
            style={styles.banner}
            onPress={() =>
              cakeProductId ? onOpenProduct(cakeProductId) : onOpenMenu()
            }
            accessibilityRole="button"
            accessibilityLabel={t('home.orderNow')}
          >
            <Image
              source={bannerSource}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </Pressable>
        </FadeIn>

        <View style={styles.rowBetween}>
          <Text style={styles.section}>{t('home.categories')}</Text>
          <Pressable
            onPress={() => onOpenMenu(categoryId)}
            accessibilityRole="button"
            accessibilityLabel={t('home.viewMenu')}
          >
            <Text style={styles.seeAll}>{t('home.viewMenu')}</Text>
          </Pressable>
        </View>
        <CategoryChipBar
          categories={categories.data ?? []}
          selectedId={categoryId}
          onSelect={setCategoryId}
          allLabel={t('menu.all')}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chips}
        />

        <View style={styles.rowBetween}>
          <Text style={styles.section}>{t('home.popularDrinks')}</Text>
          <View style={styles.viewToggle}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.gridView')}
              accessibilityState={{ selected: layout === 'grid' }}
              onPress={() => setLayout('grid')}
              style={[
                styles.viewBtn,
                layout === 'grid' && styles.viewBtnActive,
              ]}
            >
              <Feather
                name="grid"
                size={14}
                color={layout === 'grid' ? '#FFFFFF' : cafe.textMuted}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.listView')}
              accessibilityState={{ selected: layout === 'list' }}
              onPress={() => setLayout('list')}
              style={[
                styles.viewBtn,
                layout === 'list' && styles.viewBtnActive,
              ]}
            >
              <Feather
                name="list"
                size={14}
                color={layout === 'list' ? '#FFFFFF' : cafe.textMuted}
              />
            </Pressable>
          </View>
        </View>

        {layout === 'grid' ? (
          <View style={styles.grid}>
            {gridItems.map((product) => (
              <View key={product.id} style={styles.gridItem}>
                <ProductCard
                  variant="grid"
                  product={product}
                  onPress={() => onOpenProduct(product.id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.list}>
            {gridItems.map((product) => (
              <ProductCard
                key={product.id}
                variant="list"
                product={product}
                onPress={() => onOpenProduct(product.id)}
              />
            ))}
          </View>
        )}

        {visible.length > 0 ? (
          <Pressable
            style={styles.seeAllFooter}
            onPress={() => onOpenMenu(categoryId)}
            accessibilityRole="button"
            accessibilityLabel={t('home.seeAll')}
          >
            <Text style={styles.seeAllFooterText}>{t('home.seeAll')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <HomeFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories.data ?? []}
        categoryId={draftCategoryId}
        sort={draftSort}
        onChangeCategory={setDraftCategoryId}
        onChangeSort={setDraftSort}
        onApply={() => {
          setCategoryId(draftCategoryId);
          setSort(draftSort);
          setFilterOpen(false);
        }}
        onClear={() => {
          setDraftCategoryId(undefined);
          setDraftSort('newest');
          setCategoryId(undefined);
          setSort('newest');
          setFilterOpen(false);
        }}
        title={t('home.filter')}
        categoryLabel={t('home.categories')}
        sortLabel={t('home.sort')}
        allLabel={t('menu.all')}
        applyLabel={t('home.applyFilter')}
        clearLabel={t('home.clearFilter')}
        sortNewest={t('home.sortNewest')}
        sortPriceAsc={t('home.sortPriceAsc')}
        sortPriceDesc={t('home.sortPriceDesc')}
        sortName={t('home.sortName')}
      />
    </Screen>
  );
}

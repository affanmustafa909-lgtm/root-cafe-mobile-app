import { useQuery } from '@tanstack/react-query';
import { menuApi, orderApi, settingsApi, loyaltyApi } from '../services/api';

/** Shared options so socket invalidation + navigation always pull fresh menu data. */
const liveMenu = {
  refetchOnMount: 'always' as const,
  refetchOnReconnect: true,
  refetchOnWindowFocus: false,
};

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.categories(),
    staleTime: 30_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    ...liveMenu,
  });
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ['products', categoryId ?? 'all'],
    queryFn: () => menuApi.products(categoryId),
    staleTime: 10_000,
    gcTime: 60 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    // Fallback when socket is slow/offline — new admin products appear without restart
    refetchInterval: 20_000,
    ...liveMenu,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => menuApi.product(id),
    enabled: !!id,
    staleTime: 10_000,
    gcTime: 30 * 60_000,
    ...liveMenu,
  });
}

export function useCakeOfDay() {
  return useQuery({
    queryKey: ['cake-of-day'],
    queryFn: () => menuApi.cakeOfDay(),
    staleTime: 30_000,
    ...liveMenu,
  });
}

export function usePopularSales() {
  return useQuery({
    queryKey: ['products-popular'],
    queryFn: () => menuApi.popularSales(100),
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    ...liveMenu,
  });
}

export function useOnboarding() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: () => import('../services/api').then((m) => m.onboardingApi.list()),
    staleTime: 30_000,
    ...liveMenu,
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['settings-app'],
    queryFn: () => settingsApi.app(),
    staleTime: 30_000,
    ...liveMenu,
  });
}

export function useStampCard(enabled = true) {
  return useQuery({
    queryKey: ['stamp-card'],
    queryFn: () => loyaltyApi.stampCard(),
    enabled,
    staleTime: 30_000,
    gcTime: 15 * 60_000,
    ...liveMenu,
  });
}

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.mine(),
    enabled,
    staleTime: 10_000,
    gcTime: 10 * 60_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: enabled ? 12_000 : false,
    retry: 2,
  });
}

export function useOrder(id: string, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id),
    enabled: !!id,
    staleTime: 5_000,
    refetchOnMount: 'always',
    refetchInterval: options?.refetchInterval ?? 8_000,
  });
}

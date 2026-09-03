import { useQuery } from '@tanstack/react-query';
import { menuApi, orderApi, settingsApi, loyaltyApi } from '../services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.categories(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 6000),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ['products', categoryId ?? 'all'],
    queryFn: () => menuApi.products(categoryId),
    staleTime: 3 * 60_000,
    gcTime: 30 * 60_000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 6000),
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => menuApi.product(id),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnMount: false,
  });
}

export function useCakeOfDay() {
  return useQuery({
    queryKey: ['cake-of-day'],
    queryFn: () => menuApi.cakeOfDay(),
    staleTime: 2 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}

export function usePopularSales() {
  return useQuery({
    queryKey: ['products-popular'],
    queryFn: () => menuApi.popularSales(100),
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function useOnboarding() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: () => import('../services/api').then((m) => m.onboardingApi.list()),
    staleTime: 10 * 60_000,
    refetchOnMount: false,
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['settings-app'],
    queryFn: () => settingsApi.app(),
    staleTime: 5 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function useStampCard(enabled = true) {
  return useQuery({
    queryKey: ['stamp-card'],
    queryFn: () => loyaltyApi.stampCard(),
    enabled,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.mine(),
    enabled,
  });
}

export function useOrder(id: string, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.get(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

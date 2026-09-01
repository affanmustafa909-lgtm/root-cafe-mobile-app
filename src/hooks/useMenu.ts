import { useQuery } from '@tanstack/react-query';
import { menuApi, orderApi, settingsApi } from '../services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.categories(),
    staleTime: 15_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}

export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: ['products', categoryId ?? 'all'],
    queryFn: () => menuApi.products(categoryId),
    staleTime: 0,
    gcTime: 60_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => menuApi.product(id),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCakeOfDay() {
  return useQuery({
    queryKey: ['cake-of-day'],
    queryFn: () => menuApi.cakeOfDay(),
    staleTime: 15_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
}

export function useOnboarding() {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: () => import('../services/api').then((m) => m.onboardingApi.list()),
    staleTime: 60_000,
    refetchOnMount: 'always',
  });
}

export function useAppSettings() {
  return useQuery({
    queryKey: ['settings-app'],
    queryFn: () => settingsApi.app(),
    staleTime: 30_000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
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

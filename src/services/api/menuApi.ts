import { api } from './client';
import {
  mapCakeOfDay,
  mapCategory,
  mapProduct,
  type CakeOfTheDay,
  type Category,
  type Product,
} from '../../types';

export const categoryApi = {
  async list(): Promise<Category[]> {
    const { data } = await api.get<Record<string, unknown>[]>('/categories');
    return data.map(mapCategory);
  },
};

export const productApi = {
  async list(categoryId?: string): Promise<Product[]> {
    const { data } = await api.get<Record<string, unknown>[]>('/products', {
      params: categoryId ? { categoryId } : undefined,
    });
    return data.map(mapProduct);
  },

  async get(id: string): Promise<Product> {
    const { data } = await api.get<Record<string, unknown>>(`/products/${id}`);
    return mapProduct(data);
  },
};

export const menuApi = {
  categories: categoryApi.list,
  products: productApi.list,
  product: productApi.get,
  async popularSales(
    limit = 100,
  ): Promise<{ productId: string; quantitySold: number }[]> {
    const { data } = await api.get<{ productId: string; quantitySold: number }[]>(
      '/products/popular',
      { params: { limit } },
    );
    return data ?? [];
  },
  async cakeOfDay(date?: string): Promise<CakeOfTheDay | null> {
    const { data } = await api.get<Record<string, unknown> | null>(
      '/cake-of-day',
      { params: date ? { date } : undefined },
    );
    return mapCakeOfDay(data);
  },
};

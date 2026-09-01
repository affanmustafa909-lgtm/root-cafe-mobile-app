import { api } from './client';
import { mapOrder, type CreateOrderPayload, type Order } from '../../types';

export const orderApi = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await api.post<Record<string, unknown>>('/orders', payload);
    return mapOrder(data);
  },

  async mine(): Promise<Order[]> {
    const { data } = await api.get<Record<string, unknown>[]>('/orders/me');
    return data.map(mapOrder);
  },

  async get(id: string): Promise<Order> {
    const { data } = await api.get<Record<string, unknown>>(`/orders/me/${id}`);
    return mapOrder(data);
  },
};

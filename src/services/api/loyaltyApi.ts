import { api } from './client';
import type { StampCardStatus } from '../../types';

export const loyaltyApi = {
  async stampCard(): Promise<StampCardStatus> {
    const { data } = await api.get<StampCardStatus>('/loyalty/stamp-card');
    return data;
  },
};

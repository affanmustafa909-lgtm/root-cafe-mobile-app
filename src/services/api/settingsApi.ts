import { api } from './client';
import { mapAppSettings, type AppSettings } from '../../types';

export const settingsApi = {
  async app(): Promise<AppSettings> {
    const { data } = await api.get<Record<string, unknown>>('/settings/app');
    return mapAppSettings(data);
  },
};

export const notificationApi = {
  async registerToken(token: string, platform?: string) {
    await api.post('/device-tokens', { token, platform });
  },
  async removeToken(token: string) {
    await api.delete('/device-tokens', { data: { token } });
  },
};

export const profileApi = {
  update: (payload: { name?: string; phone?: string }) =>
    import('./authApi').then((m) => m.authApi.updateProfile(payload)),
  delete: () => import('./authApi').then((m) => m.authApi.deleteAccount()),
};

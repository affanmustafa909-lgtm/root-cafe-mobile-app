import { api } from './client';
import { mapUser, type User } from '../../types';
import { setToken } from './tokenStorage';

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await api.post<{ accessToken: string }>('/auth/login', {
      email,
      password,
    });
    await setToken(data.accessToken);
    return data;
  },

  async register(payload: {
    email: string;
    name: string;
    password: string;
    phone?: string;
  }) {
    const { data } = await api.post<{ accessToken: string }>(
      '/auth/register',
      payload,
    );
    await setToken(data.accessToken);
    return data;
  },

  async me() {
    const { data } = await api.get<Record<string, unknown>>('/auth/me');
    return mapUser(data);
  },

  async updateProfile(payload: { name?: string; phone?: string }) {
    const { data } = await api.patch<Record<string, unknown>>(
      '/auth/me',
      payload,
    );
    return mapUser(data);
  },

  async uploadAvatar(uri: string, mimeType = 'image/jpeg') {
    const form = new FormData();
    form.append('image', {
      uri,
      name: 'avatar.jpg',
      type: mimeType,
    } as unknown as Blob);
    const { data } = await api.patch<Record<string, unknown>>(
      '/auth/me/avatar',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return mapUser(data);
  },

  async clearAvatar() {
    const { data } = await api.patch<Record<string, unknown>>(
      '/auth/me/avatar/clear',
    );
    return mapUser(data);
  },

  async deleteAccount() {
    await api.delete('/auth/me');
    await setToken(null);
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    await setToken(null);
  },
};

export type { User };

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, getToken, onUnauthorized } from '../services/api';
import type { User } from '../types';
import { friendlyError } from '../utils/errors';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (payload: { name?: string; phone?: string }) => Promise<void>;
  uploadAvatar: (uri: string, mimeType?: string) => Promise<void>;
  clearAvatar: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const stored = await getToken();
    setTokenState(stored);
    if (!stored) {
      setUser(null);
      return;
    }
    const me = await authApi.me();
    setUser(me);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshUser();
      } catch {
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [refreshUser]);

  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setUser(null);
      setTokenState(null);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login(email, password);
    const stored = await getToken();
    setTokenState(stored);
    setUser(await authApi.me());
  }, []);

  const register = useCallback(
    async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
    }) => {
      const name = `${payload.firstName} ${payload.lastName}`.trim();
      await authApi.register({
        email: payload.email,
        name,
        password: payload.password,
        phone: payload.phone,
      });
      const stored = await getToken();
      setTokenState(stored);
      setUser(await authApi.me());
    },
    [],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setTokenState(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await authApi.deleteAccount();
    setUser(null);
    setTokenState(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: { name?: string; phone?: string }) => {
      const updated = await authApi.updateProfile(payload);
      setUser(updated);
    },
    [],
  );

  const uploadAvatar = useCallback(async (uri: string, mimeType?: string) => {
    const updated = await authApi.uploadAvatar(uri, mimeType);
    setUser(updated);
  }, []);

  const clearAvatar = useCallback(async () => {
    const updated = await authApi.clearAvatar();
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      refreshUser,
      deleteAccount,
      updateProfile,
      uploadAvatar,
      clearAvatar,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      deleteAccount,
      updateProfile,
      uploadAvatar,
      clearAvatar,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { friendlyError };
